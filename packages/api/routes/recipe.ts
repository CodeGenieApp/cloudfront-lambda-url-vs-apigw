import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, ListRecipesLastEvaluatedKey } from '../controllers/recipe'
import type { Filter } from '@/common/filter'

const recipeRouter = asyncify(Router({ mergeParams: true }))

recipeRouter.get('/recipes', async (req, res) => {
  const lastEvaluatedKeyParsed: ListRecipesLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const recipes = await listRecipes({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
  })

  res.json(recipes)
})

recipeRouter.get('/recipes/:recipeId', async (req, res) => {
  const { recipeId } = req.params
  const recipe = await getRecipe({ recipeId })

  return res.json(recipe)
})

recipeRouter.post('/recipes', async (req, res) => {
  const { recipe } = req.body
  const createdRecipe = await createRecipe({
    recipe,
    asUser: req.cognitoUser,
  })

  res.json(createdRecipe)
})

recipeRouter.put('/recipes/:recipeId', async (req, res) => {
  const { recipeId } = req.params
  const { recipe } = req.body
  const recipeItem = await updateRecipe({
    recipe,
    recipeId,
    asUser: req.cognitoUser,
  })

  res.json(recipeItem)
})

recipeRouter.delete('/recipes/:recipeId', async (req, res) => {
  const { recipeId } = req.params
  await deleteRecipe({
    asUser: req.cognitoUser,
    recipeId,
  })

  return res.json({})
})

export default recipeRouter
