import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listShoppingListItems, getShoppingListItem, createShoppingListItem, updateShoppingListItem, deleteShoppingListItem, ListShoppingListItemsLastEvaluatedKey } from '../controllers/shopping-list-item'
import type { Filter } from '@/common/filter'

const shoppingListItemRouter = asyncify(Router({ mergeParams: true }))

shoppingListItemRouter.get('/shopping-lists/:shoppingListId/shopping-list-items', async (req, res) => {
  const { shoppingListId } = req.params
  const lastEvaluatedKeyParsed: ListShoppingListItemsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const shoppingListItems = await listShoppingListItems({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    asUser: req.cognitoUser,
    shoppingListId,
  })

  res.json(shoppingListItems)
})

shoppingListItemRouter.get('/shopping-lists/:shoppingListId/shopping-list-items/:ingredientId', async (req, res) => {
  const { shoppingListId, ingredientId } = req.params
  const shoppingListItem = await getShoppingListItem({ shoppingListId, ingredientId, asUser: req.cognitoUser })

  return res.json(shoppingListItem)
})

shoppingListItemRouter.post('/shopping-lists/:shoppingListId/shopping-list-items', async (req, res) => {
  const { shoppingListId } = req.params
  const { shoppingListItem } = req.body
  const createdShoppingListItem = await createShoppingListItem({
    shoppingListId,
    shoppingListItem,
    asUser: req.cognitoUser,
  })

  res.json(createdShoppingListItem)
})

shoppingListItemRouter.put('/shopping-lists/:shoppingListId/shopping-list-items/:ingredientId', async (req, res) => {
  const { shoppingListId, ingredientId } = req.params
  const { shoppingListItem } = req.body
  const shoppingListItemItem = await updateShoppingListItem({
    shoppingListItem,
    shoppingListId,
    ingredientId,
    asUser: req.cognitoUser,
  })

  res.json(shoppingListItemItem)
})

shoppingListItemRouter.delete('/shopping-lists/:shoppingListId/shopping-list-items/:ingredientId', async (req, res) => {
  const { shoppingListId, ingredientId } = req.params
  await deleteShoppingListItem({
    asUser: req.cognitoUser,
    shoppingListId,
    ingredientId,
  })

  return res.json({})
})

export default shoppingListItemRouter
