import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listShoppingLists, getShoppingList, createShoppingList, updateShoppingList, deleteShoppingList, ListShoppingListsLastEvaluatedKey } from '../controllers/shopping-list'
import type { Filter } from '@/common/filter'

const shoppingListRouter = asyncify(Router({ mergeParams: true }))

shoppingListRouter.get('/shopping-lists', async (req, res) => {
  const lastEvaluatedKeyParsed: ListShoppingListsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const shoppingLists = await listShoppingLists({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    asUser: req.cognitoUser,
  })

  res.json(shoppingLists)
})

shoppingListRouter.get('/shopping-lists/:shoppingListId', async (req, res) => {
  const { shoppingListId } = req.params
  const shoppingList = await getShoppingList({ shoppingListId, asUser: req.cognitoUser })

  return res.json(shoppingList)
})

shoppingListRouter.post('/shopping-lists', async (req, res) => {
  const { shoppingList } = req.body
  const createdShoppingList = await createShoppingList({
    shoppingList,
    asUser: req.cognitoUser,
  })

  res.json(createdShoppingList)
})

shoppingListRouter.put('/shopping-lists/:shoppingListId', async (req, res) => {
  const { shoppingListId } = req.params
  const { shoppingList } = req.body
  const shoppingListItem = await updateShoppingList({
    shoppingList,
    shoppingListId,
    asUser: req.cognitoUser,
  })

  res.json(shoppingListItem)
})

shoppingListRouter.delete('/shopping-lists/:shoppingListId', async (req, res) => {
  const { shoppingListId } = req.params
  await deleteShoppingList({
    asUser: req.cognitoUser,
    shoppingListId,
  })

  return res.json({})
})

export default shoppingListRouter
