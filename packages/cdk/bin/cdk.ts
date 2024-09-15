import { App, Tags } from 'aws-cdk-lib'
import DatabaseStack from '../lib/stacks/DatabaseStack'
import { getEnvironmentName, getEnvironmentConfig, getIsProdish, getRegion } from '../lib/environment-config'
import getTagsMap from '../lib/getTagsMap'
import ApiStack from '../lib/stacks/ApiStack'
import AuthStack from '../lib/stacks/AuthStack'
import MonitoringStack from '../lib/stacks/MonitoringStack'
import WebAppStack from '../lib/stacks/WebAppStack'

const app = new App()
const isTerminationProtectionEnabled = getIsProdish({ node: app.node })
const envName = getEnvironmentName(app.node)
const environmentConfig = getEnvironmentConfig(app.node)
const region = getRegion(app.node)
const commonStackProps = {
  terminationProtection: isTerminationProtectionEnabled,
  env: {
    region,
  },
}
const webAppStack = new WebAppStack(app, `Recipes-${envName}-WebApp`, commonStackProps)
const databaseStack = new DatabaseStack(app, `Recipes-${envName}-Database`, commonStackProps)
const authStack = new AuthStack(app, `Recipes-${envName}-Auth`, {
  ...commonStackProps,
  userTable: databaseStack.userTable,
})
const tableProps = {
  ingredientTable: databaseStack.ingredientTable,
  recipeTable: databaseStack.recipeTable,
  recipeIngredientTable: databaseStack.recipeIngredientTable,
  recipeRatingTable: databaseStack.recipeRatingTable,
  shoppingListTable: databaseStack.shoppingListTable,
  shoppingListItemTable: databaseStack.shoppingListItemTable,
  stepTable: databaseStack.stepTable,
  tagTable: databaseStack.tagTable,
  userTable: databaseStack.userTable,
}
const apiStack = new ApiStack(app, `Recipes-${envName}-Api`, {
  ...commonStackProps,
  ...tableProps,
  auth: authStack.auth,
})
// const monitoringStack = new MonitoringStack(app, `Recipes-${envName}-Monitoring`, {
//   ...commonStackProps,
//   ...tableProps,
//   auth: authStack.auth,
//   webApp: webAppStack.webApp,
//   api: apiStack.api,
// })

const tagsMap = getTagsMap(envName)
Object.entries(tagsMap).forEach(([tagKey, tagValue]) => {
  Tags.of(app).add(tagKey, tagValue)
})
