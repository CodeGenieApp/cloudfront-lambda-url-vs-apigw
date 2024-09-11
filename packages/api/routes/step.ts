import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listSteps, getStep, createStep, updateStep, deleteStep, ListStepsLastEvaluatedKey } from '../controllers/step'
import type { Filter } from '@/common/filter'

const stepRouter = asyncify(Router({ mergeParams: true }))

stepRouter.get('/recipes/:recipeId/steps', async (req, res) => {
  const { recipeId } = req.params
  const lastEvaluatedKeyParsed: ListStepsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const steps = await listSteps({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    recipeId,
  })

  res.json(steps)
})

stepRouter.get('/recipes/:recipeId/steps/:stepId', async (req, res) => {
  const { recipeId, stepId } = req.params
  const step = await getStep({ recipeId, stepId })

  return res.json(step)
})

stepRouter.post('/recipes/:recipeId/steps', async (req, res) => {
  const { recipeId } = req.params
  const { step } = req.body
  const createdStep = await createStep({
    recipeId,
    step,
    asUser: req.cognitoUser,
  })

  res.json(createdStep)
})

stepRouter.put('/recipes/:recipeId/steps/:stepId', async (req, res) => {
  const { recipeId, stepId } = req.params
  const { step } = req.body
  const stepItem = await updateStep({
    step,
    recipeId,
    stepId,
    asUser: req.cognitoUser,
  })

  res.json(stepItem)
})

stepRouter.delete('/recipes/:recipeId/steps/:stepId', async (req, res) => {
  const { recipeId, stepId } = req.params
  await deleteStep({
    asUser: req.cognitoUser,
    recipeId,
    stepId,
  })

  return res.json({})
})

export default stepRouter
