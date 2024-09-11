import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { RECIPE_INGREDIENT_TABLE } from '../config'

assertHasRequiredEnvVars(['RECIPE_INGREDIENT_TABLE'])

export const RecipeIngredientTable = new DynamoDbToolbox.Table({
  name: RECIPE_INGREDIENT_TABLE,
  partitionKey: 'recipeId',
  sortKey: 'ingredientId',
  DocumentClient: dynamoDbDocumentClient,
})

export const RecipeIngredientEntity = new DynamoDbToolbox.Entity({
  name: 'RecipeIngredient',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    recipeId: {
      partitionKey: true,
    },
    ingredientId: {
      sortKey: true,
    },
    qty: 'number',
    unit: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: RecipeIngredientTable,
})

export const RecipeIngredientSchema = z.object({
  ingredientId: z.string(),
  qty: z.number().optional(),
  recipeId: z.string(),
  unit: z.enum(['g', 'tbsp', 'tsp', 'cup']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const RecipeIngredientSansReadOnlySchema = RecipeIngredientSchema.omit({
  recipeId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const RecipeIngredientSansImmutableSchema = RecipeIngredientSansReadOnlySchema.omit({
  ingredientId: true,
})
export const RecipeIngredientUpdateSchema = RecipeIngredientSansImmutableSchema.partial()

export type RecipeIngredientSchemaType = z.infer<typeof RecipeIngredientSchema>
export type RecipeIngredientSansReadOnlySchemaType = z.infer<typeof RecipeIngredientSansReadOnlySchema>
export type RecipeIngredientSansImmutableSchemaType = z.infer<typeof RecipeIngredientSansImmutableSchema>
export type RecipeIngredientUpdateSchemaType = z.infer<typeof RecipeIngredientUpdateSchema>
