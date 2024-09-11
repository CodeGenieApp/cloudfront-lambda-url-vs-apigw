import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { RECIPE_TABLE } from '../config'

assertHasRequiredEnvVars(['RECIPE_TABLE'])

export const RecipeTable = new DynamoDbToolbox.Table({
  name: RECIPE_TABLE,
  partitionKey: 'recipeId',
  DocumentClient: dynamoDbDocumentClient,
})

export const RecipeEntity = new DynamoDbToolbox.Entity({
  name: 'Recipe',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    recipeId: {
      partitionKey: true,
    },
    createdDate: 'string',
    description: 'string',
    image: 'string',
    tags: 'list',
    title: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: RecipeTable,
})

export const RecipeSchema = z.object({
  createdDate: z.string().datetime(),
  description: z.string(),
  image: z.string().optional(),
  recipeId: z.string(),
  tags: z.string().array().optional(),
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const RecipeSansReadOnlySchema = RecipeSchema.omit({
  recipeId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const RecipeSansImmutableSchema = RecipeSansReadOnlySchema.omit({
})
export const RecipeUpdateSchema = RecipeSansImmutableSchema.partial()

export type RecipeSchemaType = z.infer<typeof RecipeSchema>
export type RecipeSansReadOnlySchemaType = z.infer<typeof RecipeSansReadOnlySchema>
export type RecipeSansImmutableSchemaType = z.infer<typeof RecipeSansImmutableSchema>
export type RecipeUpdateSchemaType = z.infer<typeof RecipeUpdateSchema>
