import { NodejsFunction, type NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Architecture, LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { getAppLogLevel, getEnvironmentConfig, getIsSourceMapsEnabled, getSystemLogLevel, getTracingConfig } from '../environment-config'
import { LogGroup, type LogGroupProps } from 'aws-cdk-lib/aws-logs'
import { resolve } from 'node:path'
import type { StringMap } from '@/common/types'

interface CustomNodejsFunctionProps {
  logGroup?: LogGroupProps
  function: NodejsFunctionProps
}

export default class CustomNodejsFunction extends Construct {
  readonly logGroup: LogGroup
  readonly function: NodejsFunction
  constructor(scope: Construct, id: string, props: CustomNodejsFunctionProps) {
    super(scope, id)
    const { logRetentionInDays } = getEnvironmentConfig(this.node)

    this.logGroup = new LogGroup(this, `${id}LogGroup`, {
      retention: logRetentionInDays,
      ...props.logGroup,
    })

    // Tracing
    const tracingConfig = getTracingConfig(this.node)
    const tracing = tracingConfig?.enabled ? Tracing.ACTIVE : undefined

    // NODE_OPTIONS
    const environment: StringMap = {}
    const NODE_OPTIONS_ARRAY: Array<string> = props.function.environment?.NODE_OPTIONS?.split(' ') ?? []
    const isSourceMapsEnabled = getIsSourceMapsEnabled({ node: this.node })

    if (isSourceMapsEnabled) {
      NODE_OPTIONS_ARRAY.push('--enable-source-maps')
    }

    if (NODE_OPTIONS_ARRAY.length) {
      environment.NODE_OPTIONS = NODE_OPTIONS_ARRAY.join(' ')
    }

    this.function = new NodejsFunction(this, `${id}Function`, {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: props.function.entry,
      timeout: Duration.seconds(10),
      memorySize: 1024,
      architecture: Architecture.ARM_64,
      tracing,
      logFormat: LogFormat.JSON,
      systemLogLevel: getSystemLogLevel(this.node),
      applicationLogLevel: getAppLogLevel(this.node),
      logGroup: this.logGroup,
      projectRoot: resolve(import.meta.dirname, '../..'),
      ...props.function,
      bundling: {
        keepNames: true,
        sourceMap: isSourceMapsEnabled,
        format: OutputFormat.ESM,
        target: 'esnext',
        // tsconfig: resolve(import.meta.dirname, '../../tsconfig.json'),
        // NOTE: uncomment bundleAwsSDK If you need to use a specific/latest version of the AWS SDK
        // bundleAwsSDK: true,
        banner: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        ...props.function.bundling,
      },
      environment: {
        ...environment,
        ...props.function.environment,
      },
    })
  }
}
