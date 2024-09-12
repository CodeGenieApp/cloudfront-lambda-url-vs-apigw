import { Filter } from '@/common/filter'
import {
  RecipeIngredientTable,
  RecipeIngredientEntity,
  RecipeIngredientSchema,
  RecipeIngredientSansReadOnlySchema,
  RecipeIngredientSansReadOnlySchemaType,
  RecipeIngredientUpdateSchema,
  RecipeIngredientUpdateSchemaType,
} from '../models/RecipeIngredient'
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

export async function createRecipeIngredient({ recipeIngredient, recipeId, ingredientId = recipeIngredient.ingredientId || generateId(), asUser }) {
  const recipeIngredientSansReadOnly: RecipeIngredientSansReadOnlySchemaType = RecipeIngredientSansReadOnlySchema.parse(recipeIngredient)
  const recipeIngredientWithReadOnly = {
    ...recipeIngredientSansReadOnly,
    recipeId: recipeId,
    ingredientId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  RecipeIngredientSchema.parse(recipeIngredientWithReadOnly)

  debug('api.controller.recipeIngredient.create', { attributes: recipeIngredientWithReadOnly })

  await dynamoCreateItem({
    entity: RecipeIngredientEntity,
    attributes: recipeIngredientWithReadOnly,
  })

  return { data: recipeIngredientWithReadOnly }
}

export async function updateRecipeIngredient({ recipeId, ingredientId, asUser, recipeIngredient }) {
  await checkRecipeIngredientPermission({ recipeId, ingredientId, asUser })
  const recipeIngredientSansImmutable: RecipeIngredientUpdateSchemaType = RecipeIngredientUpdateSchema.parse(recipeIngredient)
  const recipeIngredientWithImmutable = {
    ...recipeIngredientSansImmutable,
    recipeId: recipeId,
    ingredientId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.recipeIngredient.update', { attributes: recipeIngredientWithImmutable })

  await RecipeIngredientEntity.update(recipeIngredientWithImmutable)

  return getRecipeIngredient({ recipeId, ingredientId })
}

export async function getRecipeIngredient({ recipeId, ingredientId }) {
  const recipeIngredient = await RecipeIngredientEntity.get({ recipeId, ingredientId })
  const recipeIngredientItem = recipeIngredient.Item

  if (!recipeIngredientItem) {
    throw new RecordNotFoundException({ recordType: 'Recipe Ingredient', recordId: ingredientId })
  }

  const data = recipeIngredientItem

  const [ingredient, createdByUser] = await Promise.all([
    recipeIngredientItem.ingredientId ? IngredientEntity.get({ ingredientId: recipeIngredientItem.ingredientId }) : null,
    recipeIngredientItem.createdByUserId ? UserEntity.get({ userId: recipeIngredientItem.createdByUserId }) : null,
  ])

  // @ts-ignore
  data.ingredient = ingredient?.Item
  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetRecipeIngredientsParams {
  ids?: Array<{ recipeId: string; ingredientId: string }>
}

export async function batchGetRecipeIngredients({ ids }: BatchGetRecipeIngredientsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const recipeIngredientsBatchGetOperations = uniqueIds.map((id) => RecipeIngredientEntity.getBatch(id))
  const recipeIngredients = await RecipeIngredientTable.batchGet(recipeIngredientsBatchGetOperations)

  return recipeIngredients.Responses[RecipeIngredientTable.name]
}

export interface ListRecipeIngredientsLastEvaluatedKey {
  recipeId: string
}

interface ListRecipeIngredientsParams {
  lastEvaluatedKey?: ListRecipeIngredientsLastEvaluatedKey
  filter?: Filter
  recipeId: string
}

export async function listRecipeIngredients({ lastEvaluatedKey, filter, recipeId }: ListRecipeIngredientsParams) {
  const recipeIngredientQueryResponse = await RecipeIngredientEntity.query(recipeId, { limit: DEFAULT_PAGE_SIZE, startKey: lastEvaluatedKey })
  const recipeIngredientQueryResponseItems = filterResults({ results: recipeIngredientQueryResponse.Items, filter })
  const recipeIngredientsHavingIngredientIds = recipeIngredientQueryResponseItems.filter((recipeIngredient) => recipeIngredient.ingredientId)
  const recipeIngredientsHavingCreatedByUserIds = recipeIngredientQueryResponseItems.filter((recipeIngredient) => recipeIngredient.createdByUserId)
  const ingredientIds = recipeIngredientsHavingIngredientIds.map((recipeIngredient) => ({ ingredientId: recipeIngredient.ingredientId! }))
  const createdByUserIds = recipeIngredientsHavingCreatedByUserIds.map((recipeIngredient) => ({ userId: recipeIngredient.createdByUserId! }))
  const [recipeIngredientsIngredients, recipeIngredientsCreatedByUsers] = await Promise.all([
    batchGetIngredients({ ids: ingredientIds }),
    batchGetUsers({ ids: createdByUserIds }),
  ])
  const recipeIngredients = recipeIngredientQueryResponseItems.map((recipeIngredient) => {
    const ingredient = recipeIngredientsIngredients.find((recipeIngredientIngredient) => recipeIngredientIngredient.ingredientId === recipeIngredient.ingredientId)
    const createdByUser = recipeIngredientsCreatedByUsers.find((recipeIngredientCreatedByUser) => recipeIngredientCreatedByUser.userId === recipeIngredient.createdByUserId)

    return {
      ...recipeIngredient,
      ingredient,
      createdByUser,
    }
  })

  debug('api.controller.recipeIngredient.list.result', { data: recipeIngredients })

  return {
    data: recipeIngredients,
    lastEvaluatedKey: recipeIngredientQueryResponse.LastEvaluatedKey,
  }
}

export async function deleteRecipeIngredient({ recipeId, ingredientId, asUser }) {
  await checkRecipeIngredientPermission({ recipeId, ingredientId, asUser })

  return RecipeIngredientEntity.delete({ recipeId, ingredientId })
}

interface CheckRecipeIngredientPermissionParams {
  recipeId: string
  ingredientId: string
  asUser: CognitoUser
}

async function checkRecipeIngredientPermission({ recipeId, ingredientId, asUser }: CheckRecipeIngredientPermissionParams) {
  const recipeIngredient = await getRecipeIngredient({ recipeId, ingredientId })
  checkPermission({ asUser, createdByUserId: recipeIngredient.data.createdByUserId, recordId: recipeIngredient.data.ingredientId, entityName: 'Recipe Ingredient' })
  return recipeIngredient
}
