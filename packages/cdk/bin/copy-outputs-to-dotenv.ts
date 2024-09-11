/* eslint @typescript-eslint/no-var-requires: 0 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const { ENVIRONMENT } = process.env

if (!ENVIRONMENT) {
  throw new Error('No ENVIRONMENT environment variable defined')
}

const nodeEnv = ENVIRONMENT === 'development' ? 'development' : 'production'
const outputs = await import(`../cdk-outputs.${ENVIRONMENT}.json`)

if (!outputs) {
  const envShort = ENVIRONMENT === 'development' ? 'dev' : ENVIRONMENT === 'production' ? 'prod' : ENVIRONMENT
  throw new Error(`No cdk-outputs.${ENVIRONMENT}.json. Try running \`npm run pull-stack-outputs:${envShort}\``)
}

const cdkJson: any = await import('../cdk.json')
const cdkJsonEnvironmentConfig = cdkJson.context.environmentConfig[ENVIRONMENT]
const databaseStackOutputs = outputs[`Recipes-${ENVIRONMENT}-Database`]
const apiStackOutputs = outputs[`Recipes-${ENVIRONMENT}-Api`]
const authStackOutputs = outputs[`Recipes-${ENVIRONMENT}-Auth`]
const webAppStackOutputs = outputs[`Recipes-${ENVIRONMENT}-WebApp`]
const SECRET_WARNING = `# WARNING: This file is committed to source control. Store secrets in .env.${ENVIRONMENT}.local instead of here.`
const apiDotEnv = `${SECRET_WARNING}
NODE_ENV=${nodeEnv}
AWS_REGION="${apiStackOutputs.Region}"
COGNITO_USER_POOL_ID="${authStackOutputs.UserPoolId}"
COGNITO_USER_POOL_CLIENT_ID="${authStackOutputs.UserPoolClientId}"
USER_UPLOADED_FILES_BUCKET="${apiStackOutputs.UserUploadedFilesBucketName}"
INGREDIENT_TABLE="${databaseStackOutputs.IngredientTable}"
RECIPE_TABLE="${databaseStackOutputs.RecipeTable}"
RECIPE_INGREDIENT_TABLE="${databaseStackOutputs.RecipeIngredientTable}"
RECIPE_RATING_TABLE="${databaseStackOutputs.RecipeRatingTable}"
SHOPPING_LIST_TABLE="${databaseStackOutputs.ShoppingListTable}"
SHOPPING_LIST_ITEM_TABLE="${databaseStackOutputs.ShoppingListItemTable}"
STEP_TABLE="${databaseStackOutputs.StepTable}"
TAG_TABLE="${databaseStackOutputs.TagTable}"
USER_TABLE="${databaseStackOutputs.UserTable}"`

writeFileSync(path.resolve(import.meta.dirname, `../../api/.env.${ENVIRONMENT}`), apiDotEnv)

let uiDotEnv = `NEXT_PUBLIC_ApiEndpoint="${apiStackOutputs.ApiEndpoint}"
NEXT_PUBLIC_CognitoUserPoolId="${authStackOutputs.UserPoolId}"
NEXT_PUBLIC_CognitoUserPoolClientId="${authStackOutputs.UserPoolClientId}"
NEXT_PUBLIC_Region="${authStackOutputs.Region}"
AMPLIFY_URL="${webAppStackOutputs.AmplifyUrl}"`

if (cdkJsonEnvironmentConfig.auth?.autoVerifyUsers) {
  uiDotEnv = `NEXT_PUBLIC_AUTO_VERIFY_USERS=1
${uiDotEnv}`
}

uiDotEnv = `${SECRET_WARNING}
${uiDotEnv}`

writeFileSync(path.resolve(import.meta.dirname, `../../ui/.env/.env.${ENVIRONMENT}`), uiDotEnv)
