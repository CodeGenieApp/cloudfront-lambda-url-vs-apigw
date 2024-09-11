import { Aws, CfnOutput, Stack, type StackProps } from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import WebApp from '../constructs/WebApp'
import { getEnvironmentConfig } from '../environment-config'

type WebAppStackProps = StackProps

export default class WebAppStack extends Stack {
  public readonly webApp: WebApp
  public readonly webAppUrl: string
  constructor(scope: Construct, id: string, props: WebAppStackProps) {
    super(scope, id, props)
    const environmentConfig = getEnvironmentConfig(this.node)
    this.webApp = new WebApp(this, 'WebApp')
    this.webAppUrl = environmentConfig.ui?.domainName ? `https://${environmentConfig.ui.domainName}` : this.webApp.amplifyUrl
    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}
