import { Construct } from 'constructs'
import {
  Alarm,
  AlarmRule,
  AlarmState,
  AlarmStatusWidget,
  CompositeAlarm,
  Dashboard,
  GraphWidget,
  LogQueryVisualizationType,
  LogQueryWidget,
  Metric,
  SingleValueWidget,
  TextWidget,
  TextWidgetBackground,
} from 'aws-cdk-lib/aws-cloudwatch'
import type { IHttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import type { IApp } from '@aws-cdk/aws-amplify-alpha'
import type { ITableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { getEnvironmentConfig } from '../environment-config'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Duration } from 'aws-cdk-lib'
import type { ILogGroup } from 'aws-cdk-lib/aws-logs'

interface DashboardProps {
  amplifyApp?: IApp
  api: IHttpApi
  apiLogGroup?: ILogGroup
  userPoolId: string
  userPoolClientId: string
  functions: Array<NodejsFunction>
  tables: Array<ITableV2>
}

export default class Monitoring extends Construct {
  public readonly dashboard?: Dashboard
  public readonly alarmSnsTopic?: Topic
  constructor(scope: Construct, id: string, props: DashboardProps) {
    super(scope, id)
    if (!this.getIsAlarmsEnabled() && !this.getIsDashboardEnabled()) {
      return
    }

    if (this.getIsAlarmsEnabled()) {
      this.alarmSnsTopic = new Topic(scope, 'AlarmTopic')
      const environmentConfig = getEnvironmentConfig(this.node)

      if (environmentConfig.monitoring!.alarmNotificationEmail) {
        this.alarmSnsTopic.addSubscription(new EmailSubscription(environmentConfig.monitoring!.alarmNotificationEmail))
      }
    }

    if (this.getIsDashboardEnabled()) {
      this.dashboard = new Dashboard(this, 'Dashboard', {
        start: '-P10D',
      })

      const { alarms: lambdaAlarms } = this.addLambdaWidgets({ functions: props.functions })
      const { alarms: apiAlarms } = this.addApiWidgets({ api: props.api, apiLogGroup: props.apiLogGroup })
      this.addTableWidgets({ tables: props.tables })
      this.addCognitoWidgets({ userPoolId: props.userPoolId, userPoolClientId: props.userPoolClientId })

      if (props.amplifyApp) {
        this.addWebAppWidgets({ amplifyApp: props.amplifyApp })
      }

      if (this.getIsAlarmsEnabled()) {
        this.addAlarmStatusWidget({ alarms: [...(apiAlarms as Array<Alarm>), ...(lambdaAlarms as Array<Alarm>)] })
      }
    }
  }

  getIsAlarmsEnabled() {
    const environmentConfig = getEnvironmentConfig(this.node)

    // NOTE: isAlarmsEnabled requires isDashboardEnabled to also be true, since the logic within also creates the metrics.
    // While it's possible to decouple, in practice it's unlikely that you would want Alarms without Dashboards, so
    // it's better to keep the code simpler.
    return environmentConfig.monitoring?.isDashboardEnabled && environmentConfig.monitoring?.isAlarmsEnabled
  }

  getIsDashboardEnabled() {
    const environmentConfig = getEnvironmentConfig(this.node)
    return environmentConfig.monitoring?.isDashboardEnabled
  }

  addHeading(heading: string) {
    if (this.dashboard) {
      this.dashboard.addWidgets(
        new TextWidget({
          markdown: `# ${heading}`,
          width: 24,
          height: 1,
          background: TextWidgetBackground.TRANSPARENT,
        }),
      )
    }
  }

  subscribeAlarm(alarm: Alarm | CompositeAlarm) {
    if (this.alarmSnsTopic) {
      alarm.addAlarmAction(new SnsAction(this.alarmSnsTopic))
    }
  }

  addApiWidgets({ api, apiLogGroup }: { api: IHttpApi; apiLogGroup?: ILogGroup }) {
    this.addHeading('API Gateway')
    const clientErrorsMetric = api.metricClientError()
    const serverErrorsMetric = api.metricServerError()
    const isAlarmsEnabled = this.getIsAlarmsEnabled()
    let clientErrorsAlarm, serverErrorsAlarm

    if (isAlarmsEnabled) {
      clientErrorsAlarm = clientErrorsMetric.createAlarm(this, 'ApiClientErrorsAlarm', {
        evaluationPeriods: 3,
        threshold: 10,
      })
      this.subscribeAlarm(clientErrorsAlarm)
      serverErrorsAlarm = serverErrorsMetric.createAlarm(this, 'ApiServerErrorsAlarm', {
        evaluationPeriods: 1,
        threshold: 1,
      })
      this.subscribeAlarm(serverErrorsAlarm)
    }

    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 8,
        left: [clientErrorsMetric],
        right: [serverErrorsMetric],
        leftAnnotations: isAlarmsEnabled ? [clientErrorsAlarm!.toAnnotation()] : undefined,
        rightAnnotations: isAlarmsEnabled ? [serverErrorsAlarm!.toAnnotation()] : undefined,
      }),
      new GraphWidget({
        width: 8,
        left: [
          api.metricLatency(),
          // api.metricIntegrationLatency()
        ],
      }),
      new GraphWidget({
        width: 8,
        left: [api.metricCount()],
      }),
      // new GraphWidget({
      //   width: 12,
      //   left: [api.metricDataProcessed()],
      // })
    )

    if (apiLogGroup) {
      this.dashboard!.addWidgets(
        new LogQueryWidget({
          title: 'Internal Errors (5xx)',
          view: LogQueryVisualizationType.TABLE,
          width: 12,
          height: 10,
          logGroupNames: [apiLogGroup.logGroupName],
          queryLines: [
            'fields @timestamp, status, httpMethod, path, ip, userAgent, @logStream, @log',
            'filter status >= 500',
            'sort @timestamp desc',
            'limit 20',
          ],
        }),
        new LogQueryWidget({
          title: 'Client Errors (4xx)',
          view: LogQueryVisualizationType.TABLE,
          width: 12,
          height: 10,
          logGroupNames: [apiLogGroup.logGroupName],
          queryLines: [
            'fields @timestamp, status, httpMethod, path, ip, userAgent, @logStream, @log',
            `filter status >= 400 and status < 500 and path not in ${JSON.stringify(BRUTE_FORCE_PATH_LIST)}`,
            'sort @timestamp desc',
            'limit 20',
          ],
        }),
      )
    }

    return {
      alarms: isAlarmsEnabled ? [serverErrorsAlarm, clientErrorsAlarm] : undefined,
    }
  }

  addLambdaWidgets({ functions }: { functions: Array<NodejsFunction> }) {
    this.addHeading('Lambda Functions')
    const errorMetrics = functions.map((fn) => ({ fn, metric: fn.metricErrors() }))
    const throttleMetrics = functions.map((fn) => ({ fn, metric: fn.metricThrottles() }))
    const isAlarmsEnabled = this.getIsAlarmsEnabled()
    const allLambdaFunctionsThrottlesMetric = NodejsFunction.metricAllThrottles()
    let allLambdaFunctionsThrottlesAlarm
    let errorAlarms, throttleAlarms

    if (isAlarmsEnabled) {
      allLambdaFunctionsThrottlesAlarm = allLambdaFunctionsThrottlesMetric.createAlarm(this, 'AllLambdaFunctionsThrottlesAlarm', {
        evaluationPeriods: 1,
        threshold: 1,
      })
      this.subscribeAlarm(allLambdaFunctionsThrottlesAlarm)
      errorAlarms = errorMetrics.map((errorMetric) =>
        errorMetric.metric.createAlarm(this, `ErrorAlarm${errorMetric.fn.node.id}`, {
          evaluationPeriods: 1,
          threshold: 1,
        }),
      )
      throttleAlarms = throttleMetrics.map((throttleMetric) =>
        throttleMetric.metric.createAlarm(this, `ThrottleAlarm${throttleMetric.fn.node.id}`, {
          evaluationPeriods: 1,
          threshold: 1,
        }),
      )

      // NOTE: Composite Alarms cost $0.50/month
      // const errorCompositeAlarm = new CompositeAlarm(this, 'ErrorCompositeAlarm', {
      //   alarmRule: AlarmRule.anyOf(
      //     ...errorAlarms.map((errorAlarm) => AlarmRule.fromAlarm(errorAlarm, AlarmState.ALARM)),
      //     ...throttleAlarms.map((throttleAlarm) => AlarmRule.fromAlarm(throttleAlarm, AlarmState.ALARM))
      //   ),
      // })
      // this.subscribeAlarm(errorCompositeAlarm)
    }

    const lambdaWidgetHeight = 4 + functions.length
    this.dashboard!.addWidgets(
      new GraphWidget({
        title: 'Duration (avg)',
        height: lambdaWidgetHeight,
        width: 12,
        liveData: true,
        left: functions.map((fn) => fn.metricDuration()),
      }),
      new GraphWidget({
        title: 'Duration (p95)',
        height: lambdaWidgetHeight,
        width: 12,
        liveData: true,
        left: functions.map((fn) =>
          fn.metricDuration({
            statistic: 'P95',
          }),
        ),
      }),
      new GraphWidget({
        height: lambdaWidgetHeight,
        width: 12,
        liveData: true,
        left: functions.map((fn) => fn.metricInvocations()),
      }),
      new GraphWidget({
        height: lambdaWidgetHeight,
        width: 12,
        liveData: true,
        left: errorMetrics.map((m) => m.metric),
        right: throttleMetrics.map((m) => m.metric),
        leftAnnotations: errorAlarms ? [errorAlarms[0].toAnnotation()] : undefined,
      }),
    )
    this.dashboard!.addWidgets(
      new LogQueryWidget({
        view: LogQueryVisualizationType.TABLE,
        width: 24,
        height: 10,
        logGroupNames: functions.map((f) => f.logGroup.logGroupName),
        queryLines: [
          'fields @timestamp, message.logName, message.errorMessage, message.url, message.method, requestId, @logStream, @log',
          "filter @message like /(?i)error/ or level == 'ERROR'",
          'sort @timestamp desc',
          'limit 20',
          // 'dedup requestId',
        ],
      }),
    )

    return {
      alarms: isAlarmsEnabled ? [...errorAlarms!, ...throttleAlarms!] : undefined,
    }
  }

  addTableWidgets({ tables }: { tables: Array<ITableV2> }) {
    this.addHeading('DynamoDB Tables')
    const tableWidgetHeight = 4 + tables.length
    this.dashboard!.addWidgets(
      // new GraphWidget({
      //   height: tableWidgetHeight,
      //   width: 12,
      //   liveData: true,
      //   left: tables.map((table) => table.metricConditionalCheckFailedRequests()),
      // }),
      new GraphWidget({
        height: tableWidgetHeight,
        width: 24,
        liveData: true,
        left: tables.map((table) => table.metricConsumedReadCapacityUnits()),
        right: tables.map((table) => table.metricConsumedReadCapacityUnits()),
      }),
      // NOTE: This seems broken. CDK isn't applying the table name to the metric dimensions
      // new GraphWidget({
      //   height: tableWidgetHeight,
      //   width: 12,
      //   liveData: true,
      //   left: tables.map((table) => table.metricUserErrors()),
      // })
    )
  }

  addCognitoWidgets({ userPoolId, userPoolClientId }: { userPoolId: string; userPoolClientId: string }) {
    this.addHeading('Cognito')
    const dimensionsMap = {
      UserPool: userPoolId,
      UserPoolClient: userPoolClientId,
    }
    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'TokenRefreshSuccesses',
            dimensionsMap,
            statistic: 'sum',
          }),
        ],
      }),
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignInSuccesses',
            dimensionsMap,
            statistic: 'sum',
          }),
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'FederationSuccesses',
            dimensionsMap: {
              ...dimensionsMap,
              IdentityProvider: 'Google',
            },
            statistic: 'sum',
          }),
        ],
      }),
      new GraphWidget({
        width: 8,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignUpSuccesses',
            dimensionsMap,
            statistic: 'sum',
            label: 'Email Signup',
          }),
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignUpSuccesses',
            dimensionsMap: {
              ...dimensionsMap,
              UserPoolClient: 'Admin', // Federated signup
            },
            statistic: 'sum',
            label: 'Federated Signup',
          }),
        ],
      }),
      // new SingleValueWidget({
      //   width: 8,
      //   title: 'Sign Ups This Week',
      //   metrics: [
      //     new Metric({
      //       namespace: 'AWS/Cognito',
      //       metricName: 'SignUpSuccesses',
      //       dimensionsMap,
      //       statistic: 'sum',
      //       period: Duration.days(7),
      //       label: 'Email Signup',
      //     }),
      //     new Metric({
      //       namespace: 'AWS/Cognito',
      //       metricName: 'SignUpSuccesses',
      //       dimensionsMap: {
      //         ...dimensionsMap,
      //         UserPoolClient: 'Admin',
      //       },
      //       statistic: 'sum',
      //       period: Duration.days(7),
      //       label: 'Federated Signup',
      //     }),
      //   ],
      // })
    )
  }

  addWebAppWidgets({ amplifyApp }: { amplifyApp: IApp }) {
    this.addHeading('Web App')
    const dimensionsMap = {
      App: amplifyApp.appId,
    }
    this.dashboard!.addWidgets(
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'Requests',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'Latency',
            dimensionsMap,
          }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: 'BytesDownloaded',
            dimensionsMap,
          }),
          // new Metric({
          //   namespace: 'AWS/AmplifyHosting',
          //   metricName: 'BytesUploaded',
          //   dimensionsMap,
          // }),
        ],
      }),
      new GraphWidget({
        width: 12,
        liveData: true,
        left: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: '4xxErrors',
            dimensionsMap,
          }),
        ],
        right: [
          new Metric({
            namespace: 'AWS/AmplifyHosting',
            metricName: '5xxErrors',
            dimensionsMap,
          }),
        ],
      }),
    )
  }

  addAlarmStatusWidget({ alarms }: { alarms: Array<Alarm> }) {
    this.addHeading('Alarms')
    const alarmStatusWidgetHeight = 1 + Math.ceil(alarms.length / 6)
    this.dashboard!.addWidgets(
      new AlarmStatusWidget({
        alarms,
        width: 24,
        height: alarmStatusWidgetHeight,
      }),
    )
  }
}

// APIs are often targeted by attackers probing for leaked endpoints. Ignore these in the dashboard logs, as they can get quite noisy.
const BRUTE_FORCE_PATH_LIST = [
  '/',
  '/alpha/.git/config',
  '/wp-includes/js/.git/config',
  '/wp-content/themes/.git/config',
  '/wp-content/plugins/.git/config',
  '/vendor/.git/config',
  '/wiki/.git/config',
  '/v3/.git/config',
  '/wp-content/.git/config',
  '/v2/.git/config',
  '/web/.git/config',
  '/v1/.git/config',
  '/test/.git/config',
  '/store/.git/config',
  '/static/.git/config',
  '/user/.git/config',
  '/staging/.git/config',
  '/src/.git/config',
  '/site/.git/config',
  '/shop/.git/config',
  '/samples/.git/config',
  '/repository/.git/config',
  '/public/.git/config',
  '/s3/.git/config',
  '/qa/.git/config',
  '/repos/.git/config',
  '/old-cuburn/.git/config',
  '/node_modules/.git/config',
  '/new/.git/config',
  '/m/.git/config',
  '/__MACOSX/.git/config',
  '/live/.git/config',
  '/includes/.git/config',
  '/git/.git/config',
  '/.git/config',
  '/gateway/.git/config',
  '/flock/.git/config',
  '/common/.git/config',
  '/dev/.git/config',
  '/config/.git/config',
  '/developer/.git/config',
  '/data/.git/config',
  '/database/.git/config',
  '/demo/.git/config',
  '/backup/.git/config',
  '/cms/.git/config',
  '/blog/.git/config',
  '/application/.git/config',
  '/blog/wp-content/themes/.git/config',
  '/build/.git/config',
  '/beta/.git/config',
  '/app/.git/config',
  '/api/v4/.git/config',
  '/api/v2/.git/config',
  '/api/v3/.git/config',
  '/api/user/v4/.git/config',
  '/api/user/v3/.git/config',
  '/api/user/v1/.git/config',
  '/api/admin/v2/.git/config',
  '/api/v1/.git/config',
  '/api/user/v2/.git/config',
  '/api/admin/v4/.git/config',
  '/api/.git/config',
  '/api/admin/v3/.git/config',
  '/a/.git/config',
  '/api/admin/v1/.git/config',
  '/amphtml/.git/config',
  '/aomanalyzer/.git/config',
  '/admin/.git/config',
  '/.svn/wc.db',
  '/.env.exemple',
  '/favicon.ico',
  '/backup.zip',
  '/.git/HEAD',
  '/wp-admin/setup-config.php',
  '/backup.sql',
  '/config.yml',
  '/.env',
  '/backup.tar.gz',
  '/feed',
  '/dump.sql',
  '/.env.production',
  '/config.xml',
  '/.ssh/id_rsa',
  '/config.php',
  '/web.config',
  '/static/admin/javascript/hetong.js',
  '/Public/home/js/check.js',
  '/.secret',
  '/_profiler/phpinfo',
]
