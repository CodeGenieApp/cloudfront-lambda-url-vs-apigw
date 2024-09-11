import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient, ListIngredientsLastEvaluatedKey } from '../controllers/ingredient'
import type { Filter } from '@/common/filter'

const ingredientRouter = asyncify(Router({ mergeParams: true }))

ingredientRouter.get('/ingredients', async (req, res) => {
  const lastEvaluatedKeyParsed: ListIngredientsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const ingredients = await listIngredients({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
  })

  res.json(ingredients)
})

ingredientRouter.get('/ingredients/:ingredientId', async (req, res) => {
  const { ingredientId } = req.params
  const ingredient = await getIngredient({ ingredientId })

  return res.json(ingredient)
})

ingredientRouter.post('/ingredients', async (req, res) => {
  const { ingredient } = req.body
  const createdIngredient = await createIngredient({
    ingredient,
    asUser: req.cognitoUser,
  })

  res.json(createdIngredient)
})

ingredientRouter.put('/ingredients/:ingredientId', async (req, res) => {
  const { ingredientId } = req.params
  const { ingredient } = req.body
  const ingredientItem = await updateIngredient({
    ingredient,
    ingredientId,
    asUser: req.cognitoUser,
  })

  res.json(ingredientItem)
})

ingredientRouter.delete('/ingredients/:ingredientId', async (req, res) => {
  const { ingredientId } = req.params
  await deleteIngredient({
    asUser: req.cognitoUser,
    ingredientId,
  })

  return res.json({})
})

export default ingredientRouter
