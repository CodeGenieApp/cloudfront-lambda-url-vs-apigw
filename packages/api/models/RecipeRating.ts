import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { RECIPE_RATING_TABLE } from '../config'

assertHasRequiredEnvVars(['RECIPE_RATING_TABLE'])

export const RecipeRatingTable = new DynamoDbToolbox.Table({
  name: RECIPE_RATING_TABLE,
  partitionKey: 'recipeId',
  sortKey: 'recipeRatingId',
  DocumentClient: dynamoDbDocumentClient,
})

export const RecipeRatingEntity = new DynamoDbToolbox.Entity({
  name: 'RecipeRating',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    recipeId: {
      partitionKey: true,
    },
    recipeRatingId: {
      sortKey: true,
    },
    comment: 'string',
    createdByUserId: 'string',
    value: 'number',
    createdAt: 'string',
    updatedAt: 'string',
  },
  table: RecipeRatingTable,
})

export const RecipeRatingSchema = z.object({
  comment: z.string().optional(),
  createdByUserId: z.string(),
  recipeId: z.string(),
  recipeRatingId: z.string(),
  value: z.number().min(1).max(5).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const RecipeRatingSansReadOnlySchema = RecipeRatingSchema.omit({
  createdByUserId: true,
  recipeId: true,
  recipeRatingId: true,
  createdAt: true,
  updatedAt: true,
})

export const RecipeRatingSansImmutableSchema = RecipeRatingSansReadOnlySchema.omit({
})
export const RecipeRatingUpdateSchema = RecipeRatingSansImmutableSchema.partial()

export type RecipeRatingSchemaType = z.infer<typeof RecipeRatingSchema>
export type RecipeRatingSansReadOnlySchemaType = z.infer<typeof RecipeRatingSansReadOnlySchema>
export type RecipeRatingSansImmutableSchemaType = z.infer<typeof RecipeRatingSansImmutableSchema>
export type RecipeRatingUpdateSchemaType = z.infer<typeof RecipeRatingUpdateSchema>
