export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const AWS_REGION = process.env.AWS_REGION!
export const USER_UPLOADED_FILES_BUCKET: string = process.env.USER_UPLOADED_FILES_BUCKET!
export const INGREDIENT_TABLE: string = process.env.INGREDIENT_TABLE!
export const RECIPE_TABLE: string = process.env.RECIPE_TABLE!
export const RECIPE_INGREDIENT_TABLE: string = process.env.RECIPE_INGREDIENT_TABLE!
export const RECIPE_RATING_TABLE: string = process.env.RECIPE_RATING_TABLE!
export const SHOPPING_LIST_TABLE: string = process.env.SHOPPING_LIST_TABLE!
export const SHOPPING_LIST_ITEM_TABLE: string = process.env.SHOPPING_LIST_ITEM_TABLE!
export const STEP_TABLE: string = process.env.STEP_TABLE!
export const TAG_TABLE: string = process.env.TAG_TABLE!
export const USER_TABLE: string = process.env.USER_TABLE!
export const COGNITO_USER_POOL_ID: string = process.env.COGNITO_USER_POOL_ID!
export const COGNITO_USER_POOL_CLIENT_ID: string = process.env.COGNITO_USER_POOL_CLIENT_ID!
