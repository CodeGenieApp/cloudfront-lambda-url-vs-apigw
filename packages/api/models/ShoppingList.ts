import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { SHOPPING_LIST_TABLE } from '../config'

assertHasRequiredEnvVars(['SHOPPING_LIST_TABLE'])

export const ShoppingListTable = new DynamoDbToolbox.Table({
  name: SHOPPING_LIST_TABLE,
  partitionKey: 'shoppingListId',
  DocumentClient: dynamoDbDocumentClient,
})

export const ShoppingListEntity = new DynamoDbToolbox.Entity({
  name: 'ShoppingList',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    shoppingListId: {
      partitionKey: true,
    },
    name: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: ShoppingListTable,
})

export const ShoppingListSchema = z.object({
  name: z.string(),
  shoppingListId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const ShoppingListSansReadOnlySchema = ShoppingListSchema.omit({
  shoppingListId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const ShoppingListSansImmutableSchema = ShoppingListSansReadOnlySchema.omit({
})
export const ShoppingListUpdateSchema = ShoppingListSansImmutableSchema.partial()

export type ShoppingListSchemaType = z.infer<typeof ShoppingListSchema>
export type ShoppingListSansReadOnlySchemaType = z.infer<typeof ShoppingListSansReadOnlySchema>
export type ShoppingListSansImmutableSchemaType = z.infer<typeof ShoppingListSansImmutableSchema>
export type ShoppingListUpdateSchemaType = z.infer<typeof ShoppingListUpdateSchema>
