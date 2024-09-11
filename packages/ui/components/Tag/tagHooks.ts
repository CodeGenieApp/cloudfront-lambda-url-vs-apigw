'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListTagsParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listTags: ({ lastEvaluatedKey, filter }: ListTagsParams) =>
    axios.get('/tags', {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getTag: ({ tagId }) => axios.get(`/tags/${tagId}`),
  createTag: ({ data }) => axios.post('/tags', { tag: data }),
  updateTag: ({ tagId, data }) => axios.put(`/tags/${tagId}`, { tag: data }),
  deleteTag: ({ tagId }) => axios.delete(`/tags/${tagId}`),
}

const tagQueryKeys = {
  root: () => {
    return ['tags']
  },
  list: ({ page }: { page?: number } = {}) => {
    const queryKey: Array<any> = [...tagQueryKeys.root(), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ name }: { name?: string }) => {
    return [...tagQueryKeys.root(), 'search', { name }]
  },
  details: ({ tagId }: { tagId: string }) => [...tagQueryKeys.root(), 'details', { tagId }],
}

interface UseListTagsQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

export interface TagData {
  [k: string]: any
}

interface ListTagsApiResponse {
  data: Array<TagData>
  lastEvaluatedKey: string
}

export function useListTagsQuery({ page, lastEvaluatedKey }: UseListTagsQueryParams) {
  const queryClient = useQueryClient()
  const listTagsQuery = useQuery<ListTagsApiResponse>(
    tagQueryKeys.list({ page }),
    async () => {
      const apiResponse = await api.listTags({ lastEvaluatedKey })
      apiResponse.data.data.forEach((tag) => queryClient.setQueryData(tagQueryKeys.details({ tagId: tag.tagId }), { data: tag }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listTagsQuery
}

interface UseSearchTagsQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchTagsQuery({ name, lastEvaluatedKey }: UseSearchTagsQueryParams) {
  const searchTagsQuery = useQuery(
    tagQueryKeys.search({ name }),
    async () => {
      const filter =
        name ?
          {
            filters: [
              {
                property: 'name',
                value: name,
              },
            ],
          }
        : undefined
      const apiResponse = await api.listTags({ lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchTagsQuery
}

export function useGetTagQuery({ tagId }) {
  const getTagQuery = useQuery(
    tagQueryKeys.details({ tagId }),
    async () => {
      const apiResponse = await api.getTag({ tagId })
      return apiResponse.data
    },
    {
      enabled: Boolean(tagId),
    },
  )

  return getTagQuery
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient()
  const createTagMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createTag({ data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(tagQueryKeys.list({}))
        queryClient.setQueryData(tagQueryKeys.details({ tagId: response.data.data.tagId }), {
          data: response.data.data,
        })
        return response
      },
      onError(error) {
        notification.error({
          message: 'Create failed',
          description: error?.response?.data?.message || error?.message || 'Unknown error',
          placement: 'topRight',
        })
      },
    },
  )

  return createTagMutation
}

export function useUpdateTagMutation({ tagId }) {
  const queryClient = useQueryClient()
  const updateTagMutation = useMutation<any, any, any>(({ data }) => api.updateTag({ tagId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(tagQueryKeys.list({}))
      queryClient.setQueryData(tagQueryKeys.details({ tagId: response.data.data.tagId }), { data: response.data.data })

      return response
    },
    onError(error) {
      notification.error({
        message: 'Update failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    },
  })

  return updateTagMutation
}

export function useDeleteTagMutation({ tagId }) {
  const queryClient = useQueryClient()
  const deleteTagMutation = useMutation<any, any, any>(() => api.deleteTag({ tagId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: tagQueryKeys.details({ tagId }) }),
        queryClient.removeQueries({ queryKey: tagQueryKeys.details({ tagId }) }),
        queryClient.refetchQueries({ queryKey: tagQueryKeys.list() }),
      ])
    },
    onError(error) {
      notification.error({
        message: 'Delete failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    },
  })

  return deleteTagMutation
}
