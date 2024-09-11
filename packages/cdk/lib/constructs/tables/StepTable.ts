import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import CustomTable from '../CustomTable'

export default class StepTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const customTable = new CustomTable(this, 'StepTable', {
      partitionKey: { name: 'recipeId', type: AttributeType.STRING },
      sortKey: { name: 'stepId', type: AttributeType.STRING },
    })

    this.table = customTable.table

    new CfnOutput(this, 'StepTableOutput', { key: 'StepTable', value: this.table.tableName })
  }
}
