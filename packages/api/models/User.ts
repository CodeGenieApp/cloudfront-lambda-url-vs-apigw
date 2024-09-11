import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { USER_TABLE } from '../config'

assertHasRequiredEnvVars(['USER_TABLE'])

export const UserTable = new DynamoDbToolbox.Table({
  name: USER_TABLE,
  partitionKey: 'userId',
  DocumentClient: dynamoDbDocumentClient,
  indexes: {
    Email: {
      partitionKey: 'email',
    },
  },
})

export const UserEntity = new DynamoDbToolbox.Entity({
  name: 'User',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    userId: {
      partitionKey: true,
    },
    name: 'string',
    email: 'string',
    profilePicture: 'string',
    role: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  table: UserTable,
})

export const UserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  profilePicture: z.string().optional(),
  role: z.enum(['Admin', 'User']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const UserSansReadOnlySchema = UserSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const UserSansImmutableSchema = UserSansReadOnlySchema.omit({
  email: true,
  role: true,
})
export const UserUpdateSchema = UserSansImmutableSchema.partial()

export type UserSchemaType = z.infer<typeof UserSchema>
export type UserSansReadOnlySchemaType = z.infer<typeof UserSansReadOnlySchema>
export type UserSansImmutableSchemaType = z.infer<typeof UserSansImmutableSchema>
export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>
