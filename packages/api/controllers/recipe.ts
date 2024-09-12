import { Filter } from '@/common/filter'
import {
  RecipeTable,
  RecipeEntity,
  RecipeSchema,
  RecipeSansReadOnlySchema,
  RecipeSansReadOnlySchemaType,
  RecipeUpdateSchema,
  RecipeUpdateSchemaType,
} from '../models/Recipe'
import { UserEntity } from '../models/User'
import { batchGetTags } from './tag'
import { batchGetUsers } from './user'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkPermission } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { deleteImageFromS3, getFileTypeFromBase64, getImageUrlFromS3, getBucketUrl, uploadImageToS3 } from '../utils/s3'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createRecipe({ recipe, recipeId = generateId(), asUser }) {
  const recipeSansReadOnly: RecipeSansReadOnlySchemaType = RecipeSansReadOnlySchema.parse(recipe)
  const recipeWithReadOnly = {
    ...recipeSansReadOnly,
    recipeId: recipeId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  RecipeSchema.parse(recipeWithReadOnly)

  debug('api.controller.recipe.create', { attributes: recipeWithReadOnly })

  if (recipe.image) {
    const extension = getFileTypeFromBase64(recipe.image)
    const fileName = `recipes/${recipeId}/image.${extension}`
    await uploadImageToS3(recipe.image, fileName, extension)
    recipeWithReadOnly.image = fileName
  }

  await dynamoCreateItem({
    entity: RecipeEntity,
    attributes: recipeWithReadOnly,
  })

  if (recipeWithReadOnly.image) {
    recipeWithReadOnly.image = await getImageUrlFromS3(recipeWithReadOnly.image)
  }

  return { data: recipeWithReadOnly }
}

export async function updateRecipe({ recipeId, asUser, recipe }) {
  await checkRecipePermission({ recipeId, asUser })
  const recipeSansImmutable: RecipeUpdateSchemaType = RecipeUpdateSchema.parse(recipe)
  const recipeWithImmutable = {
    ...recipeSansImmutable,
    recipeId: recipeId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.recipe.update', { attributes: recipeWithImmutable })

  if (recipe.image !== undefined) {
    const extension = getFileTypeFromBase64(recipe.image)
    const fileName = `recipes/${recipeId}/image.${extension}`

    if (!recipe.image) {
      await deleteImageFromS3(fileName)
      recipeWithImmutable.image = ''
    } else {
      await uploadImageToS3(recipe.image, fileName, extension)
      recipeWithImmutable.image = fileName
    }
  }

  await RecipeEntity.update(recipeWithImmutable)

  return getRecipe({ recipeId })
}

export async function getRecipe({ recipeId }) {
  const recipe = await RecipeEntity.get({ recipeId })
  const recipeItem = recipe.Item

  if (!recipeItem) {
    throw new RecordNotFoundException({ recordType: 'Recipe', recordId: recipeId })
  }

  const data = recipeItem

  const [tags, createdByUser] = await Promise.all([
    batchGetTags({ ids: recipeItem.tags?.map((id) => ({ tagId: id })) }),
    recipeItem.createdByUserId ? UserEntity.get({ userId: recipeItem.createdByUserId }) : null,
  ])

  // @ts-ignore
  data.tags = tags
  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  if (recipeItem.image) {
    // @ts-ignore
    data.image = await getImageUrlFromS3(recipeItem.image)
  }

  return { data }
}

interface BatchGetRecipesParams {
  ids?: Array<{ recipeId: string }>
}

export async function batchGetRecipes({ ids }: BatchGetRecipesParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const recipesBatchGetOperations = uniqueIds.map((id) => RecipeEntity.getBatch(id))
  const recipes = await RecipeTable.batchGet(recipesBatchGetOperations)

  return recipes.Responses[RecipeTable.name]
}

export interface ListRecipesLastEvaluatedKey {
  recipeId: string
}

interface ListRecipesParams {
  lastEvaluatedKey?: ListRecipesLastEvaluatedKey
  filter?: Filter
}

export async function listRecipes({ lastEvaluatedKey, filter }: ListRecipesParams = {}) {
  const recipeScanResponse = await scanAll({
    entity: RecipeEntity,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter,
  })
  const recipeScanResponseItems = filterResults({ results: recipeScanResponse.Items, filter })
  const recipesHavingTags = recipeScanResponseItems.filter((recipe) => recipe.tags)
  const recipesHavingCreatedByUserIds = recipeScanResponseItems.filter((recipe) => recipe.createdByUserId)
  const tags = recipesHavingTags.flatMap((recipe) => recipe.tags.map((tagId) => ({ tagId })))
  const createdByUserIds = recipesHavingCreatedByUserIds.map((recipe) => ({ userId: recipe.createdByUserId! }))
  const [recipesTags, recipesCreatedByUsers] = await Promise.all([
    batchGetTags({ ids: tags }),
    batchGetUsers({ ids: createdByUserIds }),
  ])
  const imagesPreSignedUrls = await Promise.all(recipeScanResponseItems.filter((recipe) => recipe.image).map((recipe) =>
    getImageUrlFromS3(recipe.image!),
  ))
  const recipes = recipeScanResponseItems.map((recipe) => {
    const tags = recipesTags.filter((tag) => recipe.tags?.includes(tag.tagId))
    const createdByUser = recipesCreatedByUsers.find((recipeCreatedByUser) => recipeCreatedByUser.userId === recipe.createdByUserId)
    const imageUrl = imagesPreSignedUrls.find((imageUrl) => imageUrl.startsWith(`${getBucketUrl()}${recipe.image}`))

    return {
      ...recipe,
      tags,
      createdByUser,
      image: imageUrl,
    }
  })

  debug('api.controller.recipe.list.result', { data: recipes })

  return {
    data: recipes,
    lastEvaluatedKey: recipeScanResponse.LastEvaluatedKey,
  }
}

export async function deleteRecipe({ recipeId, asUser }) {
  await checkRecipePermission({ recipeId, asUser })

  return RecipeEntity.delete({ recipeId })
}

interface CheckRecipePermissionParams {
  recipeId: string
  asUser: CognitoUser
}

async function checkRecipePermission({ recipeId, asUser }: CheckRecipePermissionParams) {
  const recipe = await getRecipe({ recipeId })
  checkPermission({ asUser, createdByUserId: recipe.data.createdByUserId, recordId: recipe.data.recipeId, entityName: 'Recipe' })
  return recipe
}
