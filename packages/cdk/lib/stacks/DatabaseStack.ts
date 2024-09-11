import { Aws, CfnOutput, Stack, type StackProps} from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import IngredientTable from '../constructs/tables/IngredientTable'
import RecipeTable from '../constructs/tables/RecipeTable'
import RecipeIngredientTable from '../constructs/tables/RecipeIngredientTable'
import RecipeRatingTable from '../constructs/tables/RecipeRatingTable'
import ShoppingListTable from '../constructs/tables/ShoppingListTable'
import ShoppingListItemTable from '../constructs/tables/ShoppingListItemTable'
import StepTable from '../constructs/tables/StepTable'
import TagTable from '../constructs/tables/TagTable'
import UserTable from '../constructs/tables/UserTable'

export default class DatabaseStack extends Stack {
  public readonly ingredientTable: TableV2
  public readonly recipeTable: TableV2
  public readonly recipeIngredientTable: TableV2
  public readonly recipeRatingTable: TableV2
  public readonly shoppingListTable: TableV2
  public readonly shoppingListItemTable: TableV2
  public readonly stepTable: TableV2
  public readonly tagTable: TableV2
  public readonly userTable: TableV2

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    
    this.ingredientTable = new IngredientTable(this, 'IngredientTable').table
    this.recipeTable = new RecipeTable(this, 'RecipeTable').table
    this.recipeIngredientTable = new RecipeIngredientTable(this, 'RecipeIngredientTable').table
    this.recipeRatingTable = new RecipeRatingTable(this, 'RecipeRatingTable').table
    this.shoppingListTable = new ShoppingListTable(this, 'ShoppingListTable').table
    this.shoppingListItemTable = new ShoppingListItemTable(this, 'ShoppingListItemTable').table
    this.stepTable = new StepTable(this, 'StepTable').table
    this.tagTable = new TagTable(this, 'TagTable').table
    this.userTable = new UserTable(this, 'UserTable').table
    
    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}