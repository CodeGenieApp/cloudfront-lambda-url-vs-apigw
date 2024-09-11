import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import CustomTable from '../CustomTable'

export default class IngredientTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const customTable = new CustomTable(this, 'IngredientTable', {
      partitionKey: { name: 'ingredientId', type: AttributeType.STRING },
    })

    this.table = customTable.table

    new CfnOutput(this, 'IngredientTableOutput', { key: 'IngredientTable', value: this.table.tableName })
  }
}
