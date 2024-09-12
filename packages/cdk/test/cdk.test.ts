import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import WebAppStack from '../lib/stacks/WebAppStack'

test('Snapshot test', () => {
  const app = new cdk.App({
    context: {
      env: 'test',
      environmentConfig: {
        test: {
          profile: 'recipes_test',
          region: 'us-test-2',
          logRetentionInDays: 1,
          amplify: {},
          api: {
            domainEnabled: false,
          },
        },
      },
    },
  })
  const stack = new WebAppStack(app, 'WebAppStack', {
    terminationProtection: false,
    env: {
      region: 'us-test-2',
    },
  })
  const template = Template.fromStack(stack)
  expect(template).toMatchSnapshot()
})
