import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listRecipeRatings, getRecipeRating, createRecipeRating, updateRecipeRating, deleteRecipeRating, ListRecipeRatingsLastEvaluatedKey } from '../controllers/recipe-rating'
import type { Filter } from '@/common/filter'

const recipeRatingRouter = asyncify(Router({ mergeParams: true }))

recipeRatingRouter.get('/recipes/:recipeId/recipe-ratings', async (req, res) => {
  const { recipeId } = req.params
  const lastEvaluatedKeyParsed: ListRecipeRatingsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const recipeRatings = await listRecipeRatings({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    recipeId,
  })

  res.json(recipeRatings)
})

recipeRatingRouter.get('/recipes/:recipeId/recipe-ratings/:recipeRatingId', async (req, res) => {
  const { recipeId, recipeRatingId } = req.params
  const recipeRating = await getRecipeRating({ recipeId, recipeRatingId })

  return res.json(recipeRating)
})

recipeRatingRouter.post('/recipes/:recipeId/recipe-ratings', async (req, res) => {
  const { recipeId } = req.params
  const { recipeRating } = req.body
  const createdRecipeRating = await createRecipeRating({
    recipeId,
    recipeRating,
    asUser: req.cognitoUser,
  })

  res.json(createdRecipeRating)
})

recipeRatingRouter.put('/recipes/:recipeId/recipe-ratings/:recipeRatingId', async (req, res) => {
  const { recipeId, recipeRatingId } = req.params
  const { recipeRating } = req.body
  const recipeRatingItem = await updateRecipeRating({
    recipeRating,
    recipeId,
    recipeRatingId,
    asUser: req.cognitoUser,
  })

  res.json(recipeRatingItem)
})

recipeRatingRouter.delete('/recipes/:recipeId/recipe-ratings/:recipeRatingId', async (req, res) => {
  const { recipeId, recipeRatingId } = req.params
  await deleteRecipeRating({
    asUser: req.cognitoUser,
    recipeId,
    recipeRatingId,
  })

  return res.json({})
})

export default recipeRatingRouter
