import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import { listTags, getTag, createTag, updateTag, deleteTag, ListTagsLastEvaluatedKey } from '../controllers/tag'
import type { Filter } from '@/common/filter'

const tagRouter = asyncify(Router({ mergeParams: true }))

tagRouter.get('/tags', async (req, res) => {
  const lastEvaluatedKeyParsed: ListTagsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const tags = await listTags({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
  })

  res.json(tags)
})

tagRouter.get('/tags/:tagId', async (req, res) => {
  const { tagId } = req.params
  const tag = await getTag({ tagId })

  return res.json(tag)
})

tagRouter.post('/tags', async (req, res) => {
  const { tag } = req.body
  const createdTag = await createTag({
    tag,
    asUser: req.cognitoUser,
  })

  res.json(createdTag)
})

tagRouter.put('/tags/:tagId', async (req, res) => {
  const { tagId } = req.params
  const { tag } = req.body
  const tagItem = await updateTag({
    tag,
    tagId,
    asUser: req.cognitoUser,
  })

  res.json(tagItem)
})

tagRouter.delete('/tags/:tagId', async (req, res) => {
  const { tagId } = req.params
  await deleteTag({
    asUser: req.cognitoUser,
    tagId,
  })

  return res.json({})
})

export default tagRouter
