import { AWS_REGION } from '@/api/config'
import { fromIni } from '@aws-sdk/credential-providers'
const { AWS_ACCESS_KEY_ID, NODE_ENV } = process.env

const DEFAULT_AWS_CONFIG: any = {
  region: AWS_REGION,
}

// For local development, get creds from ~/.aws/credentials; alternatively, set AWS_PROFILE env var
if (process.env.IS_LOCAL && NODE_ENV !== 'test' && !AWS_ACCESS_KEY_ID) {
  if (!process.env.ENVIRONMENT) {
    throw new Error('No ENVIRONMENT env var set')
  }
  // NOTE: Replace fromIni with fromSSO if using SSO instead of credentials file
  DEFAULT_AWS_CONFIG.credentials = fromIni({ profile: `recipes_${process.env.ENVIRONMENT}` })
}

export function getAwsClientConfig<ClientConfig>(clientConfig?: ClientConfig): ClientConfig {
  return {
    ...DEFAULT_AWS_CONFIG,
    ...clientConfig,
  }
}
