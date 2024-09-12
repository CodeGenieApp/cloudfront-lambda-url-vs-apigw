import { Filter } from '@/common/filter'
import {
  StepTable,
  StepEntity,
  StepSchema,
  StepSansReadOnlySchema,
  StepSansReadOnlySchemaType,
  StepUpdateSchema,
  StepUpdateSchemaType,
} from '../models/Step'
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

export async function createStep({ step, recipeId, stepId = step.stepId || generateId(), asUser }) {
  const stepSansReadOnly: StepSansReadOnlySchemaType = StepSansReadOnlySchema.parse(step)
  const stepWithReadOnly = {
    ...stepSansReadOnly,
    recipeId: recipeId,
    stepId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: asUser.userId,
  }

  StepSchema.parse(stepWithReadOnly)

  debug('api.controller.step.create', { attributes: stepWithReadOnly })

  await dynamoCreateItem({
    entity: StepEntity,
    attributes: stepWithReadOnly,
  })

  return { data: stepWithReadOnly }
}

export async function updateStep({ recipeId, stepId, asUser, step }) {
  await checkStepPermission({ recipeId, stepId, asUser })
  const stepSansImmutable: StepUpdateSchemaType = StepUpdateSchema.parse(step)
  const stepWithImmutable = {
    ...stepSansImmutable,
    recipeId: recipeId,
    stepId,
    updatedAt: new Date().toISOString(),
  }

  debug('api.controller.step.update', { attributes: stepWithImmutable })

  await StepEntity.update(stepWithImmutable)

  return getStep({ recipeId, stepId })
}

export async function getStep({ recipeId, stepId }) {
  const step = await StepEntity.get({ recipeId, stepId })
  const stepItem = step.Item

  if (!stepItem) {
    throw new RecordNotFoundException({ recordType: 'Step', recordId: stepId })
  }

  const data = stepItem
  const createdByUser = stepItem.createdByUserId ? await UserEntity.get({ userId: stepItem.createdByUserId }) : null

  // @ts-ignore
  data.createdByUser = createdByUser?.Item

  return { data }
}

interface BatchGetStepsParams {
  ids?: Array<{ recipeId: string; stepId: string }>
}

export async function batchGetSteps({ ids }: BatchGetStepsParams) {
  if (!ids?.length) {
    return []
  }
  const uniqueIds = unique(ids)
  const stepsBatchGetOperations = uniqueIds.map((id) => StepEntity.getBatch(id))
  const steps = await StepTable.batchGet(stepsBatchGetOperations)

  return steps.Responses[StepTable.name]
}

export interface ListStepsLastEvaluatedKey {
  recipeId: string
}

interface ListStepsParams {
  lastEvaluatedKey?: ListStepsLastEvaluatedKey
  filter?: Filter
  recipeId: string
}

export async function listSteps({ lastEvaluatedKey, filter, recipeId }: ListStepsParams) {
  const stepQueryResponse = await StepEntity.query(recipeId, { limit: DEFAULT_PAGE_SIZE, startKey: lastEvaluatedKey })
  const stepQueryResponseItems = filterResults({ results: stepQueryResponse.Items, filter })
  const stepsHavingCreatedByUserIds = stepQueryResponseItems.filter((step) => step.createdByUserId)
  const createdByUserIds = stepsHavingCreatedByUserIds.map((step) => ({ userId: step.createdByUserId! }))
  const stepsCreatedByUsers = await batchGetUsers({ ids: createdByUserIds })
  const steps = stepQueryResponseItems.map((step) => {
    const createdByUser = stepsCreatedByUsers.find((stepCreatedByUser) => stepCreatedByUser.userId === step.createdByUserId)

    return {
      ...step,
      createdByUser,
    }
  })

  debug('api.controller.step.list.result', { data: steps })

  return {
    data: steps,
    lastEvaluatedKey: stepQueryResponse.LastEvaluatedKey,
  }
}

export async function deleteStep({ recipeId, stepId, asUser }) {
  await checkStepPermission({ recipeId, stepId, asUser })

  return StepEntity.delete({ recipeId, stepId })
}

interface CheckStepPermissionParams {
  recipeId: string
  stepId: string
  asUser: CognitoUser
}

async function checkStepPermission({ recipeId, stepId, asUser }: CheckStepPermissionParams) {
  const step = await getStep({ recipeId, stepId })
  checkPermission({ asUser, createdByUserId: step.data.createdByUserId, recordId: step.data.stepId, entityName: 'Step' })
  return step
}
