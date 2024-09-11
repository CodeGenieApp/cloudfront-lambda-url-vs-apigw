import { Aws, CfnOutput, Stack, type StackProps } from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import ExpressApi from '../constructs/ExpressApi'
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import Auth from '../constructs/Auth'

interface ApiStackProps extends StackProps {
  auth: Auth
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

export default class ApiStack extends Stack {
  public readonly api: ExpressApi
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)
    this.api = new ExpressApi(this, 'ExpressApi', {
      auth: props.auth,
      ingredientTable: props.ingredientTable,
      recipeTable: props.recipeTable,
      recipeIngredientTable: props.recipeIngredientTable,
      recipeRatingTable: props.recipeRatingTable,
      shoppingListTable: props.shoppingListTable,
      shoppingListItemTable: props.shoppingListItemTable,
      stepTable: props.stepTable,
      tagTable: props.tagTable,
      userTable: props.userTable,
    })
    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}
