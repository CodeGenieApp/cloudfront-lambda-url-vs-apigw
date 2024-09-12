import { Filter } from '@/common/filter'
import {
  TagTable,
  TagEntity,
  TagSchema,
  TagSansReadOnlySchema,
  TagSansReadOnlySchemaType,
  TagUpdateSchema,
  TagUpdateSchemaType,
} from '../models/Tag'
import { UserEntity } from '../models/User'
import { batchGetUsers } from './user'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkIsAdmin } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createTag({ tag, tagId = generateId(), asUser }) {
  checkIsAdmin({ user: asUser })
  const tagSansReadOnly: TagSansReadOnlySchemaType = TagSansReadOnlySchema.parse(tag)
  const tagWithReadOnly = {
    ...tagSansReadOnly,
    tagId: tagId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  TagSchema.parse(tagWithReadOnly)

  debug('api.controller.tag.create', { attributes: tagWithReadOnly })

  await dynamoCreateItem({
    entity: TagEntity,
    attributes: tagWithReadOnly,
  })

  return { data: tagWithReadOnly }
}

export async function updateTag({ tagId, asUser, tag }) {
  checkIsAdmin({ user: asUser })
  const tagSansImmutable: TagUpdateSchemaType = TagUpdateSchema.parse(tag)
  const tagWithImmutable = {
    ...tagSansImmutable,
    tagId: tagId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.tag.update', { attributes: tagWithImmutable })

  await TagEntity.update(tagWithImmutable)

  return getTag({ tagId })
}

export async function getTag({ tagId }) {
  const tag = await TagEntity.get({ tagId })
  const tagItem = tag.Item

  if (!tagItem) {
    throw new RecordNotFoundException({ recordType: 'Tag', recordId: tagId })
  }

  const data = tagItem
  const createdByUser = tagItem.createdByUserId ? await UserEntity.get({ userId: tagItem.createdByUserId }) : null

  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetTagsParams {
  ids?: Array<{ tagId: string }>
}

export async function batchGetTags({ ids }: BatchGetTagsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const tagsBatchGetOperations = uniqueIds.map((id) => TagEntity.getBatch(id))
  const tags = await TagTable.batchGet(tagsBatchGetOperations)

  return tags.Responses[TagTable.name]
}

export interface ListTagsLastEvaluatedKey {
  tagId: string
}

interface ListTagsParams {
  lastEvaluatedKey?: ListTagsLastEvaluatedKey
  filter?: Filter
}

export async function listTags({ lastEvaluatedKey, filter }: ListTagsParams = {}) {
  const tagScanResponse = await scanAll({
    entity: TagEntity,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter,
  })
  const tagScanResponseItems = filterResults({ results: tagScanResponse.Items, filter })
  const tagsHavingCreatedByUserIds = tagScanResponseItems.filter((tag) => tag.createdByUserId)
  const createdByUserIds = tagsHavingCreatedByUserIds.map((tag) => ({ userId: tag.createdByUserId! }))
  const tagsCreatedByUsers = await batchGetUsers({ ids: createdByUserIds })
  const tags = tagScanResponseItems.map((tag) => {
    const createdByUser = tagsCreatedByUsers.find((tagCreatedByUser) => tagCreatedByUser.userId === tag.createdByUserId)

    return {
      ...tag,
      createdByUser,
    }
  })

  debug('api.controller.tag.list.result', { data: tags })

  return {
    data: tags,
    lastEvaluatedKey: tagScanResponse.LastEvaluatedKey,
  }
}

export async function deleteTag({ tagId, asUser }) {
  checkIsAdmin({ user: asUser })

  return TagEntity.delete({ tagId })
}
