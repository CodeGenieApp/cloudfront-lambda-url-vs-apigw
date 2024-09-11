import { writeFileSync } from 'node:fs'
import { CloudFormationClient, DescribeStacksCommand, type DescribeStacksOutput } from '@aws-sdk/client-cloudformation'
import path from 'node:path'
import { getAwsClientConfig } from '@/common/aws-client-config'
import cdkJson from '../cdk.json'
import { type CdkJsonEnvironmentConfigEnvironment } from '../lib/environment-config'

async function pullStackOutputs({ region, stackName }: { region: string; stackName: string }): Promise<any[]> {
  const client = new CloudFormationClient(getAwsClientConfig({ region }))

  try {
    const command = new DescribeStacksCommand({
      StackName: stackName,
    })
    const stackResponse: DescribeStacksOutput = await client.send(command)

    if (!stackResponse.Stacks || stackResponse.Stacks.length === 0) {
      throw new Error(`Stack '${stackName}' not found in region '${region}'.`)
    }

    const stack = stackResponse.Stacks[0]

    if (!stack) {
      throw new Error(`Stack '${stackName}' not found.`)
    }

    if (!stack.Outputs) {
      throw new Error(`Stack '${stackName}' has no outputs.`)
    }

    return stack.Outputs
  } catch (error: any) {
    throw new Error(`Error retrieving CloudFormation stack outputs: ${error.message}`)
  } finally {
    client.destroy()
  }
}

function writeOutputs({ environment, outputsByStack }: { environment: string; outputsByStack: any }) {
  const outputFilePath = path.resolve(import.meta.dirname, `../cdk-outputs.${environment}.json`)
  const formattedOutputStringified = JSON.stringify(outputsByStack, null, 2)
  writeFileSync(outputFilePath, formattedOutputStringified, 'utf8')
}

async function main() {
  try {
    const environment = process.env.ENVIRONMENT

    if (!environment) {
      console.error('ENVIRONMENT environment variable not set.')
      return
    }

    const environmentCdkContext = (cdkJson.context.environmentConfig as any)[environment] as CdkJsonEnvironmentConfigEnvironment
    const region = environmentCdkContext.region

    const stackNames = [
      `Recipes-${environment}-WebApp`,
      `Recipes-${environment}-Database`,
      `Recipes-${environment}-Auth`,
      `Recipes-${environment}-Api`,
      `Recipes-${environment}-Monitoring`,
    ]

    const outputsByStack: any = {}
    const stackOutputsPromises = stackNames.map(async (stackName) => {
      const outputs = await pullStackOutputs({ region, stackName })
      outputsByStack[stackName] = {}
      outputs.forEach((output: any) => {
        outputsByStack[stackName][output.OutputKey] = output.OutputValue
      })
    })
    await Promise.all(stackOutputsPromises)

    writeOutputs({ outputsByStack, environment })
  } catch (error: any) {
    console.error(error.message)
  }
}

main()
