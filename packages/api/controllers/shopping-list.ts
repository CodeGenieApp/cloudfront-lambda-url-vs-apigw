import { Filter } from '@/common/filter'
import {
  ShoppingListTable,
  ShoppingListEntity,
  ShoppingListSchema,
  ShoppingListSansReadOnlySchema,
  ShoppingListSansReadOnlySchemaType,
  ShoppingListUpdateSchema,
  ShoppingListUpdateSchemaType,
} from '../models/ShoppingList'
import { UserEntity } from '../models/User'
import { batchGetUsers } from './user'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkPermission } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createShoppingList({ shoppingList, shoppingListId = generateId(), asUser }) {
  const shoppingListSansReadOnly: ShoppingListSansReadOnlySchemaType = ShoppingListSansReadOnlySchema.parse(shoppingList)
  const shoppingListWithReadOnly = {
    ...shoppingListSansReadOnly,
    shoppingListId: shoppingListId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  ShoppingListSchema.parse(shoppingListWithReadOnly)

  debug('api.controller.shoppingList.create', { attributes: shoppingListWithReadOnly })

  await dynamoCreateItem({
    entity: ShoppingListEntity,
    attributes: shoppingListWithReadOnly,
  })

  return { data: shoppingListWithReadOnly }
}

export async function updateShoppingList({ shoppingListId, asUser, shoppingList }) {
  await checkShoppingListPermission({ asUser, shoppingListId })
  const shoppingListSansImmutable: ShoppingListUpdateSchemaType = ShoppingListUpdateSchema.parse(shoppingList)
  const shoppingListWithImmutable = {
    ...shoppingListSansImmutable,
    shoppingListId: shoppingListId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.shoppingList.update', { attributes: shoppingListWithImmutable })

  await ShoppingListEntity.update(shoppingListWithImmutable)

  return getShoppingList({ asUser, shoppingListId })
}

export async function getShoppingList({ asUser, shoppingListId }) {
  await checkShoppingListPermission({ asUser, shoppingListId })
  const shoppingList = await ShoppingListEntity.get({ shoppingListId })
  const shoppingListItem = shoppingList.Item

  if (!shoppingListItem) {
    throw new RecordNotFoundException({ recordType: 'Shopping List', recordId: shoppingListId })
  }

  const data = shoppingListItem
  const createdByUser = shoppingListItem.createdByUserId ? await UserEntity.get({ userId: shoppingListItem.createdByUserId }) : null

  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetShoppingListsParams {
  ids?: Array<{ shoppingListId: string }>
}

export async function batchGetShoppingLists({ ids }: BatchGetShoppingListsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const shoppingListsBatchGetOperations = uniqueIds.map((id) => ShoppingListEntity.getBatch(id))
  const shoppingLists = await ShoppingListTable.batchGet(shoppingListsBatchGetOperations)

  return shoppingLists.Responses[ShoppingListTable.name]
}

export interface ListShoppingListsLastEvaluatedKey {
  shoppingListId: string
}

interface ListShoppingListsParams {
  lastEvaluatedKey?: ListShoppingListsLastEvaluatedKey
  filter?: Filter
  asUser: CognitoUser
}

export async function listShoppingLists({ lastEvaluatedKey, filter, asUser }: ListShoppingListsParams) {
  const shoppingListScanResponse = await scanAll({
    entity: ShoppingListEntity,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter: {
      ...filter,
      filters: [
        ...(filter?.filters || []),
        {
          property: 'createdByUserId',
          value: asUser.userId,
        },
      ],
    },
  })
  const shoppingListScanResponseItems = filterResults({ results: shoppingListScanResponse.Items, filter: {
      filters: [
        {
          property: 'createdByUserId',
          value: asUser.userId,
        },
      ],
    } })
  const shoppingListsHavingCreatedByUserIds = shoppingListScanResponseItems.filter((shoppingList) => shoppingList.createdByUserId)
  const createdByUserIds = shoppingListsHavingCreatedByUserIds.map((shoppingList) => ({ userId: shoppingList.createdByUserId! }))
  const shoppingListsCreatedByUsers = await batchGetUsers({ ids: createdByUserIds })
  const shoppingLists = shoppingListScanResponseItems.map((shoppingList) => {
    const createdByUser = shoppingListsCreatedByUsers.find((shoppingListCreatedByUser) => shoppingListCreatedByUser.userId === shoppingList.createdByUserId)

    return {
      ...shoppingList,
      createdByUser,
    }
  })

  debug('api.controller.shoppingList.list.result', { data: shoppingLists })

  return {
    data: shoppingLists,
    lastEvaluatedKey: shoppingListScanResponse.LastEvaluatedKey,
  }
}

export async function deleteShoppingList({ shoppingListId, asUser }) {
  await checkShoppingListPermission({ asUser, shoppingListId })

  return ShoppingListEntity.delete({ shoppingListId })
}

interface CheckShoppingListPermissionParams {
  shoppingListId: string
  asUser: CognitoUser
}

async function checkShoppingListPermission({ shoppingListId, asUser }: CheckShoppingListPermissionParams) {
  const shoppingList = await getShoppingList({ shoppingListId, asUser })
  checkPermission({ asUser, createdByUserId: shoppingList.data.createdByUserId, recordId: shoppingList.data.shoppingListId, entityName: 'Shopping List' })
  return shoppingList
}
