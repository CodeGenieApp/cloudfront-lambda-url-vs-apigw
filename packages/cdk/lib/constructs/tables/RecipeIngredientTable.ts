import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import CustomTable from '../CustomTable'

export default class RecipeIngredientTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const customTable = new CustomTable(this, 'RecipeIngredientTable', {
      partitionKey: { name: 'recipeId', type: AttributeType.STRING },
      sortKey: { name: 'ingredientId', type: AttributeType.STRING },
    })

    this.table = customTable.table

    new CfnOutput(this, 'RecipeIngredientTableOutput', { key: 'RecipeIngredientTable', value: this.table.tableName })
  }
}
