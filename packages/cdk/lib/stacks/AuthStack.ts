import { Aws, CfnOutput, Stack, type StackProps } from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import Auth from '../constructs/Auth'

interface AuthStackProps extends StackProps {
  userTable: TableV2
}

export default class AuthStack extends Stack {
  public readonly auth: Auth
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props)
    this.auth = new Auth(this, 'Auth', {
      userTable: props.userTable,
    })
    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}
