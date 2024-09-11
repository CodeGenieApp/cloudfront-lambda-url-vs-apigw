import { Construct } from 'constructs'
import { TableV2, type TablePropsV2 } from 'aws-cdk-lib/aws-dynamodb'
import { getRemovalPolicy, getIsDeletionProtectionEnabled, getIsPointInTimeRecoveryEnabled } from '../environment-config'

export default class CustomTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string, props: TablePropsV2) {
    super(scope, id)

    this.table = new TableV2(this, id, {
      deletionProtection: getIsDeletionProtectionEnabled({ node: this.node }),
      removalPolicy: getRemovalPolicy({ node: this.node }),
      pointInTimeRecovery: getIsPointInTimeRecoveryEnabled({ node: this.node }),
      ...props,
    })
  }
}
