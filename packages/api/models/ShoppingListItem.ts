import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { SHOPPING_LIST_ITEM_TABLE } from '../config'

assertHasRequiredEnvVars(['SHOPPING_LIST_ITEM_TABLE'])

export const ShoppingListItemTable = new DynamoDbToolbox.Table({
  name: SHOPPING_LIST_ITEM_TABLE,
  partitionKey: 'shoppingListId',
  sortKey: 'ingredientId',
  DocumentClient: dynamoDbDocumentClient,
})

export const ShoppingListItemEntity = new DynamoDbToolbox.Entity({
  name: 'ShoppingListItem',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    shoppingListId: {
      partitionKey: true,
    },
    ingredientId: {
      sortKey: true,
    },
    qty: 'number',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: ShoppingListItemTable,
})

export const ShoppingListItemSchema = z.object({
  ingredientId: z.string(),
  qty: z.number().optional(),
  shoppingListId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const ShoppingListItemSansReadOnlySchema = ShoppingListItemSchema.omit({
  shoppingListId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const ShoppingListItemSansImmutableSchema = ShoppingListItemSansReadOnlySchema.omit({
  ingredientId: true,
})
export const ShoppingListItemUpdateSchema = ShoppingListItemSansImmutableSchema.partial()

export type ShoppingListItemSchemaType = z.infer<typeof ShoppingListItemSchema>
export type ShoppingListItemSansReadOnlySchemaType = z.infer<typeof ShoppingListItemSansReadOnlySchema>
export type ShoppingListItemSansImmutableSchemaType = z.infer<typeof ShoppingListItemSansImmutableSchema>
export type ShoppingListItemUpdateSchemaType = z.infer<typeof ShoppingListItemUpdateSchema>
