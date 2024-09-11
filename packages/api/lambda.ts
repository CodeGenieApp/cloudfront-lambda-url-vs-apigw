import serverlessExpress from '@codegenie/serverless-express'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import { debug } from '@/common/debug'
import app from './app'
const serverlessExpressInstance = serverlessExpress({
  app,
})

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {
  debug('api.lambda.handler', { path: event.rawPath, method: event.requestContext.http.method })
  return serverlessExpressInstance(event, context)
}
