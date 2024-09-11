import { Filter } from '@/common/filter'
import {
  UserTable,
  UserEntity,
  UserSchema,
  UserSansReadOnlySchema,
  UserSansReadOnlySchemaType,
  UserUpdateSchema,
  UserUpdateSchemaType,
} from '../models/User'
import { generateId } from '../utils/id'
import { dynamoCreateItem, filterResults, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '@/common/pagination'
import { unique } from '@/common/unique'
import { debug } from '@/common/debug'
import { checkPermission, checkIsAdmin } from '../utils/check-permission'
import { CognitoUser } from '../types'
import { deleteImageFromS3, getFileTypeFromBase64, getImageUrlFromS3, getBucketUrl, uploadImageToS3 } from '../utils/s3'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'

export async function createUser({ user, userId = generateId(), asUser }) {
  checkIsAdmin({ user: asUser })
  const userSansReadOnly: UserSansReadOnlySchemaType = UserSansReadOnlySchema.parse(user)
  const userWithReadOnly = {
    ...userSansReadOnly,
    userId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  UserSchema.parse(userWithReadOnly)

  debug('api.controller.user.create', { attributes: userWithReadOnly })

  if (user.profilePicture) {
    const extension = getFileTypeFromBase64(user.profilePicture)
    const fileName = `users/${userId}/profile-picture.${extension}`
    await uploadImageToS3(user.profilePicture, fileName, extension)
    userWithReadOnly.profilePicture = fileName
  }

  await dynamoCreateItem({
    entity: UserEntity,
    attributes: userWithReadOnly,
  })

  if (userWithReadOnly.profilePicture) {
    userWithReadOnly.profilePicture = await getImageUrlFromS3(userWithReadOnly.profilePicture)
  }

  return { data: userWithReadOnly }
}

export async function updateUser({ userId, asUser, user }) {
  await checkUserPermission({ userId, asUser })
  const userSansImmutable: UserUpdateSchemaType = UserUpdateSchema.parse(user)
  const userWithImmutable = {
    ...userSansImmutable,
    userId: userId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.user.update', { attributes: userWithImmutable })

  if (user.profilePicture !== undefined) {
    const extension = getFileTypeFromBase64(user.profilePicture)
    const fileName = `users/${userId}/profile-picture.${extension}`

    if (!user.profilePicture) {
      await deleteImageFromS3(fileName)
      userWithImmutable.profilePicture = ''
    } else {
      await uploadImageToS3(user.profilePicture, fileName, extension)
      userWithImmutable.profilePicture = fileName
    }
  }

  await UserEntity.update(userWithImmutable)

  return getUser({ userId })
}

export async function getUser({ userId }) {
  const user = await UserEntity.get({ userId })
  const userItem = user.Item

  if (!userItem) {
    throw new RecordNotFoundException({ recordType: 'User', recordId: userId })
  }

  const data = userItem

  if (userItem.profilePicture) {
    // @ts-ignore
    data.profilePicture = await getImageUrlFromS3(userItem.profilePicture)
  }

  return { data }
}

interface BatchGetUsersParams {
  ids?: Array<{ userId: string }>
}

export async function batchGetUsers({ ids }: BatchGetUsersParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const usersBatchGetOperations = uniqueIds.map((id) => UserEntity.getBatch(id))
  const users = await UserTable.batchGet(usersBatchGetOperations)

  return users.Responses[UserTable.name]
}

export interface ListUsersLastEvaluatedKey {
  userId: string
}

interface ListUsersParams {
  lastEvaluatedKey?: ListUsersLastEvaluatedKey
  filter?: Filter
  index?: string
}

export async function listUsers({ lastEvaluatedKey, filter, index }: ListUsersParams = {}) {
  const userScanResponse =
    index ?
      await UserEntity.query('UserEntity', {
        limit: DEFAULT_PAGE_SIZE,
        startKey: lastEvaluatedKey,
        reverse: true,
        index,
      })
    : await scanAll({
        entity: UserEntity,
        scanOptions: {
          startKey: lastEvaluatedKey,
          index,
        },
        maxItems: DEFAULT_PAGE_SIZE,
        maxPages: 10,
        filter,
      })
  const userScanResponseItems = filterResults({ results: userScanResponse.Items, filter })
  const profilePicturesPreSignedUrls = await Promise.all(userScanResponseItems.filter((user) => user.profilePicture).map((user) =>
    getImageUrlFromS3(user.profilePicture!),
  ))
  const users = userScanResponseItems.map((user) => {
    const profilePictureUrl = profilePicturesPreSignedUrls.find((imageUrl) => imageUrl.startsWith(`${getBucketUrl()}${user.profilePicture}`))

    return {
      ...user,
      profilePicture: profilePictureUrl,
    }
  })

  debug('api.controller.user.list.result', { data: users })

  return {
    data: users,
    lastEvaluatedKey: userScanResponse.LastEvaluatedKey,
  }
}

export async function deleteUser({ userId, asUser }) {
  checkIsAdmin({ user: asUser })

  return UserEntity.delete({ userId })
}

export async function getUserByEmail({ email }) {
  const userQueryResponse = await UserEntity.query(email, { index: 'Email' })
  const userItems = userQueryResponse.Items

  if (!userItems?.length) {
    throw new RecordNotFoundException({ recordType: 'User', recordId: email })
  }

  if (userItems.length > 1) {
    throw new Error(`Multiple users found with email ${email}.`)
  }

  return userItems[0]!
}

export async function getCurrentUser(req) {
  if (!req) throw new Error('req is required')

  const currentUser = await getUser({
    userId: req.cognitoUser.userId,
  })

  if (!currentUser) throw new Error(`Couldn't find current user ${req.cognitoUser.userId}`)

  return currentUser
}

export function getIsUserAdmin({ user }) {
  return user.role === 'Admin'
}

interface CheckUserPermissionParams {
  userId: string
  asUser: CognitoUser
}

async function checkUserPermission({ userId, asUser }: CheckUserPermissionParams) {
  const user = await getUser({ userId })
  checkPermission({ asUser, createdByUserId: user.data.userId, recordId: user.data.userId, entityName: 'User' })
  return user
}
