import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import CustomTable from '../CustomTable'

export default class ShoppingListItemTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const customTable = new CustomTable(this, 'ShoppingListItemTable', {
      partitionKey: { name: 'shoppingListId', type: AttributeType.STRING },
      sortKey: { name: 'ingredientId', type: AttributeType.STRING },
    })

    this.table = customTable.table

    new CfnOutput(this, 'ShoppingListItemTableOutput', { key: 'ShoppingListItemTable', value: this.table.tableName })
  }
}
