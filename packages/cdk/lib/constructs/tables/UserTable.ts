import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import CustomTable from '../CustomTable'

export default class UserTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const customTable = new CustomTable(this, 'UserTable', {
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: 'Email',
          partitionKey: {
            name: 'email',
            type: AttributeType.STRING,
          },
        },
      ],
    })

    this.table = customTable.table

    new CfnOutput(this, 'UserTableOutput', { key: 'UserTable', value: this.table.tableName })
  }
}
