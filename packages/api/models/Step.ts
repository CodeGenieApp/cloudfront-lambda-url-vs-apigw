import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { z } from 'zod'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { STEP_TABLE } from '../config'

assertHasRequiredEnvVars(['STEP_TABLE'])

export const StepTable = new DynamoDbToolbox.Table({
  name: STEP_TABLE,
  partitionKey: 'recipeId',
  sortKey: 'stepId',
  DocumentClient: dynamoDbDocumentClient,
})

export const StepEntity = new DynamoDbToolbox.Entity({
  name: 'Step',
  created: 'createdAt',
  modified: 'updatedAt',
  createdAlias: 'createdAt',
  modifiedAlias: 'updatedAt',
  attributes: {
    recipeId: {
      partitionKey: true,
    },
    stepId: {
      sortKey: true,
    },
    instructions: 'string',
    stepNumber: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    createdByUserId: 'string',
  },
  table: StepTable,
})

export const StepSchema = z.object({
  instructions: z.string().optional(),
  stepId: z.string(),
  stepNumber: z.string().optional(),
  recipeId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByUserId: z.string(),
})

export const StepSansReadOnlySchema = StepSchema.omit({
  stepId: true,
  recipeId: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
})

export const StepSansImmutableSchema = StepSansReadOnlySchema.omit({
})
export const StepUpdateSchema = StepSansImmutableSchema.partial()

export type StepSchemaType = z.infer<typeof StepSchema>
export type StepSansReadOnlySchemaType = z.infer<typeof StepSansReadOnlySchema>
export type StepSansImmutableSchemaType = z.infer<typeof StepSansImmutableSchema>
export type StepUpdateSchemaType = z.infer<typeof StepUpdateSchema>
