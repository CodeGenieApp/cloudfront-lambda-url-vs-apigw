import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
const [, , environmentParam] = process.argv

function copyAwsCredsProfileToAppProfile({
  appName,
  environment,
  profileToCopy = 'default',
}: {
  appName: string
  environment: string
  profileToCopy?: string
}) {
  const awsCredentialsFile = path.resolve(os.homedir(), '.aws/credentials')
  const awsCredentials = fs.readFileSync(awsCredentialsFile, 'utf-8')
  const newProfileNameWithoutEnvSuffix = appName
  const newProfileName = `${newProfileNameWithoutEnvSuffix}_${environment}`

  if (awsCredentials.includes(`[${newProfileName}]`)) return

  const [, profileToCopySplit] = awsCredentials.split(`[${profileToCopy}]`)

  if (!profileToCopySplit) {
    throw new Error(
      `No profile named ${profileToCopy} was found in ~/.aws/credentials. Either re-run the command with \`COPY_AWS_PROFILE=profile-name-to-copy npm run init:dev\` or manually create a profile called '${newProfileName}' and run \`COPY_AWS_PROFILE=0 npm run init:dev\`.`,
    )
  }

  const [profileToCopyCreds] = profileToCopySplit.split(/\[.*\]/)
  const profileToCopyCredsNewlineCleaned = profileToCopyCreds.replace('\n\n', '\n')
  fs.appendFileSync(
    awsCredentialsFile,
    `
[${newProfileName}]${profileToCopyCredsNewlineCleaned}`,
  )
}

if (process.env.COPY_AWS_PROFILE !== '0') {
  copyAwsCredsProfileToAppProfile({
    appName: 'recipes',
    environment: environmentParam,
    profileToCopy: process.env.COPY_AWS_PROFILE,
  })
}
