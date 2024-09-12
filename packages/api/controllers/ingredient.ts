import { Filter } from '@/common/filter'
import {
  IngredientTable,
  IngredientEntity,
  IngredientSchema,
  IngredientSansReadOnlySchema,
  IngredientSansReadOnlySchemaType,
  IngredientUpdateSchema,
  IngredientUpdateSchemaType,
} from '../models/Ingredient'
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

export async function createIngredient({ ingredient, ingredientId = generateId(), asUser }) {
  const ingredientSansReadOnly: IngredientSansReadOnlySchemaType = IngredientSansReadOnlySchema.parse(ingredient)
  const ingredientWithReadOnly = {
    ...ingredientSansReadOnly,
    ingredientId: ingredientId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  IngredientSchema.parse(ingredientWithReadOnly)

  debug('api.controller.ingredient.create', { attributes: ingredientWithReadOnly })

  await dynamoCreateItem({
    entity: IngredientEntity,
    attributes: ingredientWithReadOnly,
  })

  return { data: ingredientWithReadOnly }
}

export async function updateIngredient({ ingredientId, asUser, ingredient }) {
  await checkIngredientPermission({ ingredientId, asUser })
  const ingredientSansImmutable: IngredientUpdateSchemaType = IngredientUpdateSchema.parse(ingredient)
  const ingredientWithImmutable = {
    ...ingredientSansImmutable,
    ingredientId: ingredientId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.ingredient.update', { attributes: ingredientWithImmutable })

  await IngredientEntity.update(ingredientWithImmutable)

  return getIngredient({ ingredientId })
}

export async function getIngredient({ ingredientId }) {
  const ingredient = await IngredientEntity.get({ ingredientId })
  const ingredientItem = ingredient.Item

  if (!ingredientItem) {
    throw new RecordNotFoundException({ recordType: 'Ingredient', recordId: ingredientId })
  }

  const data = ingredientItem
  const createdByUser = ingredientItem.createdByUserId ? await UserEntity.get({ userId: ingredientItem.createdByUserId }) : null

  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetIngredientsParams {
  ids?: Array<{ ingredientId: string }>
}

export async function batchGetIngredients({ ids }: BatchGetIngredientsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const ingredientsBatchGetOperations = uniqueIds.map((id) => IngredientEntity.getBatch(id))
  const ingredients = await IngredientTable.batchGet(ingredientsBatchGetOperations)

  return ingredients.Responses[IngredientTable.name]
}

export interface ListIngredientsLastEvaluatedKey {
  ingredientId: string
}

interface ListIngredientsParams {
  lastEvaluatedKey?: ListIngredientsLastEvaluatedKey
  filter?: Filter
}

export async function listIngredients({ lastEvaluatedKey, filter }: ListIngredientsParams = {}) {
  const ingredientScanResponse = await scanAll({
    entity: IngredientEntity,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter,
  })
  const ingredientScanResponseItems = filterResults({ results: ingredientScanResponse.Items, filter })
  const ingredientsHavingCreatedByUserIds = ingredientScanResponseItems.filter((ingredient) => ingredient.createdByUserId)
  const createdByUserIds = ingredientsHavingCreatedByUserIds.map((ingredient) => ({ userId: ingredient.createdByUserId! }))
  const ingredientsCreatedByUsers = await batchGetUsers({ ids: createdByUserIds })
  const ingredients = ingredientScanResponseItems.map((ingredient) => {
    const createdByUser = ingredientsCreatedByUsers.find((ingredientCreatedByUser) => ingredientCreatedByUser.userId === ingredient.createdByUserId)

    return {
      ...ingredient,
      createdByUser,
    }
  })

  debug('api.controller.ingredient.list.result', { data: ingredients })

  return {
    data: ingredients,
    lastEvaluatedKey: ingredientScanResponse.LastEvaluatedKey,
  }
}

export async function deleteIngredient({ ingredientId, asUser }) {
  await checkIngredientPermission({ ingredientId, asUser })

  return IngredientEntity.delete({ ingredientId })
}

interface CheckIngredientPermissionParams {
  ingredientId: string
  asUser: CognitoUser
}

async function checkIngredientPermission({ ingredientId, asUser }: CheckIngredientPermissionParams) {
  const ingredient = await getIngredient({ ingredientId })
  checkPermission({ asUser, createdByUserId: ingredient.data.createdByUserId, recordId: ingredient.data.ingredientId, entityName: 'Ingredient' })
  return ingredient
}
