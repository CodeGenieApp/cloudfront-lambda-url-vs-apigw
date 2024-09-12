import { Filter } from '@/common/filter'
import {
  ShoppingListItemTable,
  ShoppingListItemEntity,
  ShoppingListItemSchema,
  ShoppingListItemSansReadOnlySchema,
  ShoppingListItemSansReadOnlySchemaType,
  ShoppingListItemUpdateSchema,
  ShoppingListItemUpdateSchemaType,
} from '../models/ShoppingListItem'
import { IngredientEntity } from '../models/Ingredient'
import { UserEntity } from '../models/User'
import { batchGetIngredients } from './ingredient'
import { batchGetUsers } from './user'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkPermission } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createShoppingListItem({ shoppingListItem, shoppingListId, ingredientId = shoppingListItem.ingredientId || generateId(), asUser }) {
  const shoppingListItemSansReadOnly: ShoppingListItemSansReadOnlySchemaType = ShoppingListItemSansReadOnlySchema.parse(shoppingListItem)
  const shoppingListItemWithReadOnly = {
    ...shoppingListItemSansReadOnly,
    shoppingListId: shoppingListId,
    ingredientId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  ShoppingListItemSchema.parse(shoppingListItemWithReadOnly)

  debug('api.controller.shoppingListItem.create', { attributes: shoppingListItemWithReadOnly })

  await dynamoCreateItem({
    entity: ShoppingListItemEntity,
    attributes: shoppingListItemWithReadOnly,
  })

  return { data: shoppingListItemWithReadOnly }
}

export async function updateShoppingListItem({ shoppingListId, ingredientId, asUser, shoppingListItem }) {
  await checkShoppingListItemPermission({ asUser, shoppingListId, ingredientId })
  const shoppingListItemSansImmutable: ShoppingListItemUpdateSchemaType = ShoppingListItemUpdateSchema.parse(shoppingListItem)
  const shoppingListItemWithImmutable = {
    ...shoppingListItemSansImmutable,
    shoppingListId: shoppingListId,
    ingredientId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.shoppingListItem.update', { attributes: shoppingListItemWithImmutable })

  await ShoppingListItemEntity.update(shoppingListItemWithImmutable)

  return getShoppingListItem({ asUser, shoppingListId, ingredientId })
}

export async function getShoppingListItem({ asUser, shoppingListId, ingredientId }) {
  await checkShoppingListItemPermission({ asUser, shoppingListId, ingredientId })
  const shoppingListItem = await ShoppingListItemEntity.get({ shoppingListId, ingredientId })
  const shoppingListItemItem = shoppingListItem.Item

  if (!shoppingListItemItem) {
    throw new RecordNotFoundException({ recordType: 'Shopping List Item', recordId: ingredientId })
  }

  const data = shoppingListItemItem

  const [ingredient, createdByUser] = await Promise.all([
    shoppingListItemItem.ingredientId ? IngredientEntity.get({ ingredientId: shoppingListItemItem.ingredientId }) : null,
    shoppingListItemItem.createdByUserId ? UserEntity.get({ userId: shoppingListItemItem.createdByUserId }) : null,
  ])

  // @ts-ignore
  data.ingredient = ingredient?.Item
  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetShoppingListItemsParams {
  ids?: Array<{ shoppingListId: string; ingredientId: string }>
}

export async function batchGetShoppingListItems({ ids }: BatchGetShoppingListItemsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const shoppingListItemsBatchGetOperations = uniqueIds.map((id) => ShoppingListItemEntity.getBatch(id))
  const shoppingListItems = await ShoppingListItemTable.batchGet(shoppingListItemsBatchGetOperations)

  return shoppingListItems.Responses[ShoppingListItemTable.name]
}

export interface ListShoppingListItemsLastEvaluatedKey {
  shoppingListId: string
}

interface ListShoppingListItemsParams {
  lastEvaluatedKey?: ListShoppingListItemsLastEvaluatedKey
  filter?: Filter
  shoppingListId: string
  asUser: CognitoUser
}

export async function listShoppingListItems({ lastEvaluatedKey, filter, shoppingListId, asUser }: ListShoppingListItemsParams) {
  const shoppingListItemQueryResponse = await ShoppingListItemEntity.query(shoppingListId, { limit: DEFAULT_PAGE_SIZE, startKey: lastEvaluatedKey })
  const shoppingListItemQueryResponseItems = filterResults({ results: shoppingListItemQueryResponse.Items, filter: {
      filters: [
        {
          property: 'createdByUserId',
          value: asUser.userId,
        },
      ],
    } })
  const shoppingListItemsHavingIngredientIds = shoppingListItemQueryResponseItems.filter((shoppingListItem) => shoppingListItem.ingredientId)
  const shoppingListItemsHavingCreatedByUserIds = shoppingListItemQueryResponseItems.filter((shoppingListItem) => shoppingListItem.createdByUserId)
  const ingredientIds = shoppingListItemsHavingIngredientIds.map((shoppingListItem) => ({ ingredientId: shoppingListItem.ingredientId! }))
  const createdByUserIds = shoppingListItemsHavingCreatedByUserIds.map((shoppingListItem) => ({ userId: shoppingListItem.createdByUserId! }))
  const [shoppingListItemsIngredients, shoppingListItemsCreatedByUsers] = await Promise.all([
    batchGetIngredients({ ids: ingredientIds }),
    batchGetUsers({ ids: createdByUserIds }),
  ])
  const shoppingListItems = shoppingListItemQueryResponseItems.map((shoppingListItem) => {
    const ingredient = shoppingListItemsIngredients.find((shoppingListItemIngredient) => shoppingListItemIngredient.ingredientId === shoppingListItem.ingredientId)
    const createdByUser = shoppingListItemsCreatedByUsers.find((shoppingListItemCreatedByUser) => shoppingListItemCreatedByUser.userId === shoppingListItem.createdByUserId)

    return {
      ...shoppingListItem,
      ingredient,
      createdByUser,
    }
  })

  debug('api.controller.shoppingListItem.list.result', { data: shoppingListItems })

  return {
    data: shoppingListItems,
    lastEvaluatedKey: shoppingListItemQueryResponse.LastEvaluatedKey,
  }
}

export async function deleteShoppingListItem({ shoppingListId, ingredientId, asUser }) {
  await checkShoppingListItemPermission({ asUser, shoppingListId, ingredientId })

  return ShoppingListItemEntity.delete({ shoppingListId, ingredientId })
}

interface CheckShoppingListItemPermissionParams {
  shoppingListId: string
  ingredientId: string
  asUser: CognitoUser
}

async function checkShoppingListItemPermission({ shoppingListId, ingredientId, asUser }: CheckShoppingListItemPermissionParams) {
  const shoppingListItem = await getShoppingListItem({ shoppingListId, ingredientId, asUser })
  checkPermission({ asUser, createdByUserId: shoppingListItem.data.createdByUserId, recordId: shoppingListItem.data.ingredientId, entityName: 'Shopping List Item' })
  return shoppingListItem
}
