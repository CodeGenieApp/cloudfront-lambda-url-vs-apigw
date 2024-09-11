import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listRecipeIngredients, getRecipeIngredient, createRecipeIngredient, updateRecipeIngredient, deleteRecipeIngredient, ListRecipeIngredientsLastEvaluatedKey } from '../controllers/recipe-ingredient'
import type { Filter } from '@/common/filter'

const recipeIngredientRouter = asyncify(Router({ mergeParams: true }))

recipeIngredientRouter.get('/recipes/:recipeId/recipe-ingredients', async (req, res) => {
  const { recipeId } = req.params
  const lastEvaluatedKeyParsed: ListRecipeIngredientsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const recipeIngredients = await listRecipeIngredients({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    recipeId,
  })

  res.json(recipeIngredients)
})

recipeIngredientRouter.get('/recipes/:recipeId/recipe-ingredients/:ingredientId', async (req, res) => {
  const { recipeId, ingredientId } = req.params
  const recipeIngredient = await getRecipeIngredient({ recipeId, ingredientId })

  return res.json(recipeIngredient)
})

recipeIngredientRouter.post('/recipes/:recipeId/recipe-ingredients', async (req, res) => {
  const { recipeId } = req.params
  const { recipeIngredient } = req.body
  const createdRecipeIngredient = await createRecipeIngredient({
    recipeId,
    recipeIngredient,
    asUser: req.cognitoUser,
  })

  res.json(createdRecipeIngredient)
})

recipeIngredientRouter.put('/recipes/:recipeId/recipe-ingredients/:ingredientId', async (req, res) => {
  const { recipeId, ingredientId } = req.params
  const { recipeIngredient } = req.body
  const recipeIngredientItem = await updateRecipeIngredient({
    recipeIngredient,
    recipeId,
    ingredientId,
    asUser: req.cognitoUser,
  })

  res.json(recipeIngredientItem)
})

recipeIngredientRouter.delete('/recipes/:recipeId/recipe-ingredients/:ingredientId', async (req, res) => {
  const { recipeId, ingredientId } = req.params
  await deleteRecipeIngredient({
    asUser: req.cognitoUser,
    recipeId,
    ingredientId,
  })

  return res.json({})
})

export default recipeIngredientRouter
