import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { TAG_TABLE } from '../config'

assertHasRequiredEnvVars(['TAG_TABLE'])

export const TagTable = new DynamoDbToolbox.Table({
  name: TAG_TABLE,
  partitionKey: 'tagId',
  DocumentClient: dynamoDbDocumentClient,
})

export const TagEntity = new DynamoDbToolbox.Entity({
  name: 'Tag',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    tagId: {
      partitionKey: true,
    },
    name: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: TagTable,
})

export const TagSchema = z.object({
  name: z.string(),
  tagId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const TagSansReadOnlySchema = TagSchema.omit({
  tagId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const TagSansImmutableSchema = TagSansReadOnlySchema.omit({
})
export const TagUpdateSchema = TagSansImmutableSchema.partial()

export type TagSchemaType = z.infer<typeof TagSchema>
export type TagSansReadOnlySchemaType = z.infer<typeof TagSansReadOnlySchema>
export type TagSansImmutableSchemaType = z.infer<typeof TagSansImmutableSchema>
export type TagUpdateSchemaType = z.infer<typeof TagUpdateSchema>
