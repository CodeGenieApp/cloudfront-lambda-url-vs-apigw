import { Filter } from '@/common/filter'
import {
  RecipeRatingTable,
  RecipeRatingEntity,
  RecipeRatingSchema,
  RecipeRatingSansReadOnlySchema,
  RecipeRatingSansReadOnlySchemaType,
  RecipeRatingUpdateSchema,
  RecipeRatingUpdateSchemaType,
} from '../models/RecipeRating'
import { UserEntity } from '../models/User'
import { batchGetUsers } from './user'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkPermission } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createRecipeRating({ recipeRating, recipeId, recipeRatingId = recipeRating.recipeRatingId || generateId(), asUser }) {
  const recipeRatingSansReadOnly: RecipeRatingSansReadOnlySchemaType = RecipeRatingSansReadOnlySchema.parse(recipeRating)
  const recipeRatingWithReadOnly = {
    ...recipeRatingSansReadOnly,
    recipeId: recipeId,
    recipeRatingId,
    createdByUserId: asUser.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  RecipeRatingSchema.parse(recipeRatingWithReadOnly)

  debug('api.controller.recipeRating.create', { attributes: recipeRatingWithReadOnly })

  await dynamoCreateItem({
    entity: RecipeRatingEntity,
    attributes: recipeRatingWithReadOnly,
  })

  return { data: recipeRatingWithReadOnly }
}

export async function updateRecipeRating({ recipeId, recipeRatingId, asUser, recipeRating }) {
  await checkRecipeRatingPermission({ recipeId, recipeRatingId, asUser })
  const recipeRatingSansImmutable: RecipeRatingUpdateSchemaType = RecipeRatingUpdateSchema.parse(recipeRating)
  const recipeRatingWithImmutable = {
    ...recipeRatingSansImmutable,
    recipeId: recipeId,
    recipeRatingId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.recipeRating.update', { attributes: recipeRatingWithImmutable })

  await RecipeRatingEntity.update(recipeRatingWithImmutable)

  return getRecipeRating({ recipeId, recipeRatingId })
}

export async function getRecipeRating({ recipeId, recipeRatingId }) {
  const recipeRating = await RecipeRatingEntity.get({ recipeId, recipeRatingId })
  const recipeRatingItem = recipeRating.Item

  if (!recipeRatingItem) {
    throw new RecordNotFoundException({ recordType: 'Recipe Rating', recordId: recipeRatingId })
  }

  const data = recipeRatingItem
  const createdByUser = recipeRatingItem.createdByUserId ? await UserEntity.get({ userId: recipeRatingItem.createdByUserId }) : null

  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetRecipeRatingsParams {
  ids?: Array<{ recipeId: string; recipeRatingId: string }>
}

export async function batchGetRecipeRatings({ ids }: BatchGetRecipeRatingsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const recipeRatingsBatchGetOperations = uniqueIds.map((id) => RecipeRatingEntity.getBatch(id))
  const recipeRatings = await RecipeRatingTable.batchGet(recipeRatingsBatchGetOperations)

  return recipeRatings.Responses[RecipeRatingTable.name]
}

export interface ListRecipeRatingsLastEvaluatedKey {
  recipeId: string
}

interface ListRecipeRatingsParams {
  lastEvaluatedKey?: ListRecipeRatingsLastEvaluatedKey
  filter?: Filter
  recipeId: string
}

export async function listRecipeRatings({ lastEvaluatedKey, filter, recipeId }: ListRecipeRatingsParams) {
  const recipeRatingQueryResponse = await RecipeRatingEntity.query(recipeId, { limit: DEFAULT_PAGE_SIZE, startKey: lastEvaluatedKey })
  const recipeRatingQueryResponseItems = filterResults({ results: recipeRatingQueryResponse.Items, filter })
  const recipeRatingsHavingCreatedByUserIds = recipeRatingQueryResponseItems.filter((recipeRating) => recipeRating.createdByUserId)
  const recipeRatingsCreatedByUserIds = recipeRatingsHavingCreatedByUserIds.map((recipeRating) => ({ userId: recipeRating.createdByUserId! }))
  const recipeRatingsCreatedByUsers = await batchGetUsers({ ids: recipeRatingsCreatedByUserIds })
  const recipeRatings = recipeRatingQueryResponseItems.map((recipeRating) => {
    const createdByUser = recipeRatingsCreatedByUsers.find((recipeRatingCreatedByUser) => recipeRatingCreatedByUser.userId === recipeRating.createdByUserId)

    return {
      ...recipeRating,
      createdByUser,
    }
  })

  debug('api.controller.recipeRating.list.result', { data: recipeRatings })

  return {
    data: recipeRatings,
    lastEvaluatedKey: recipeRatingQueryResponse.LastEvaluatedKey,
  }
}

export async function deleteRecipeRating({ recipeId, recipeRatingId, asUser }) {
  await checkRecipeRatingPermission({ recipeId, recipeRatingId, asUser })

  return RecipeRatingEntity.delete({ recipeId, recipeRatingId })
}

interface CheckRecipeRatingPermissionParams {
  recipeId: string
  recipeRatingId: string
  asUser: CognitoUser
}

async function checkRecipeRatingPermission({ recipeId, recipeRatingId, asUser }: CheckRecipeRatingPermissionParams) {
  const recipeRating = await getRecipeRating({ recipeId, recipeRatingId })
  checkPermission({ asUser, createdByUserId: recipeRating.data.createdByUserId, recordId: recipeRating.data.recipeRatingId, entityName: 'Recipe Rating' })
  return recipeRating
}
