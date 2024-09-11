import { Aws, CfnOutput, Stack, type StackProps } from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import Auth from '../constructs/Auth'
import Budget from '../constructs/Budget'
import Monitoring from '../constructs/Monitoring'
import WebApp from '../constructs/WebApp'
import ExpressApi from '../constructs/ExpressApi'
import { getEnvironmentName } from '../environment-config'

interface MonitoringStackProps extends StackProps {
  auth: Auth
  webApp?: WebApp
  api: ExpressApi
  ingredientTable: TableV2
  recipeTable: TableV2
  recipeIngredientTable: TableV2
  recipeRatingTable: TableV2
  shoppingListTable: TableV2
  shoppingListItemTable: TableV2
  stepTable: TableV2
  tagTable: TableV2
  userTable: TableV2
}

export default class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props)

    new Budget(this, 'Budget')

    const envName = getEnvironmentName(this.node)
    new Monitoring(this, `Recipes-${envName}-Monitoring`, {
      userPoolId: props.auth.userPool.userPoolId,
      userPoolClientId: props.auth.userPoolClient.userPoolClientId,
      amplifyApp: props.webApp?.amplifyApp,
      api: props.api.api,
      apiLogGroup: props.api.apiLogGroup,
      functions: [
        props.api.lambdaFunction,
        props.auth.cognitoPreSignupFunction,
        props.auth.cognitoPreTokenGenerationFunction,
        props.auth.cognitoCustomMessageFunction,
      ],
      tables: [
        props.ingredientTable,
        props.recipeTable,
        props.recipeIngredientTable,
        props.recipeRatingTable,
        props.shoppingListTable,
        props.shoppingListItemTable,
        props.stepTable,
        props.tagTable,
        props.userTable,
      ],
    })
    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}
