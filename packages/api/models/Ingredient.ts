import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { INGREDIENT_TABLE } from '../config'

assertHasRequiredEnvVars(['INGREDIENT_TABLE'])

export const IngredientTable = new DynamoDbToolbox.Table({
  name: INGREDIENT_TABLE,
  partitionKey: 'ingredientId',
  DocumentClient: dynamoDbDocumentClient,
})

export const IngredientEntity = new DynamoDbToolbox.Entity({
  name: 'Ingredient',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    ingredientId: {
      partitionKey: true,
    },
    name: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: IngredientTable,
})

export const IngredientSchema = z.object({
  ingredientId: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const IngredientSansReadOnlySchema = IngredientSchema.omit({
  ingredientId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const IngredientSansImmutableSchema = IngredientSansReadOnlySchema.omit({
})
export const IngredientUpdateSchema = IngredientSansImmutableSchema.partial()

export type IngredientSchemaType = z.infer<typeof IngredientSchema>
export type IngredientSansReadOnlySchemaType = z.infer<typeof IngredientSansReadOnlySchema>
export type IngredientSansImmutableSchemaType = z.infer<typeof IngredientSansImmutableSchema>
export type IngredientUpdateSchemaType = z.infer<typeof IngredientUpdateSchema>
