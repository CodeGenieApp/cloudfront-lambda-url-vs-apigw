'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListRecipeRatingsParams {
  recipeId: string
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listRecipeRatings: ({ recipeId, lastEvaluatedKey, filter }: ListRecipeRatingsParams) =>
    axios.get(`/recipes/${recipeId}/recipe-ratings`, {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getRecipeRating: ({ recipeId, recipeRatingId }) => axios.get(`/recipes/${recipeId}/recipe-ratings/${recipeRatingId}`),
  createRecipeRating: ({ recipeId, data }) => axios.post(`/recipes/${recipeId}/recipe-ratings`, { recipeRating: data }),
  updateRecipeRating: ({ recipeId, recipeRatingId, data }) => axios.put(`/recipes/${recipeId}/recipe-ratings/${recipeRatingId}`, { recipeRating: data }),
  deleteRecipeRating: ({ recipeId, recipeRatingId }) => axios.delete(`/recipes/${recipeId}/recipe-ratings/${recipeRatingId}`),
}

const recipeRatingQueryKeys = {
  root: ({ recipeId }: { recipeId: string }) => {
    return ['recipes', { recipeId }, 'recipe-ratings']
  },
  list: ({ recipeId, page }: { recipeId: string; page?: number }) => {
    const queryKey: Array<any> = [...recipeRatingQueryKeys.root({ recipeId }), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ recipeId, recipeRatingId }: { recipeId: string; recipeRatingId?: string }) => {
    return [...recipeRatingQueryKeys.root({ recipeId }), 'search', { recipeRatingId }]
  },
  details: ({ recipeId, recipeRatingId }: { recipeId: string; recipeRatingId: string }) => [...recipeRatingQueryKeys.root({ recipeId }), 'details', { recipeRatingId }],
}

interface UseListRecipeRatingsQueryParams {
  recipeId: string
  page?: number
  lastEvaluatedKey?: string
}

export interface RecipeRatingData {
  [k: string]: any
}

interface ListRecipeRatingsApiResponse {
  data: Array<RecipeRatingData>
  lastEvaluatedKey: string
}

export function useListRecipeRatingsQuery({ recipeId, page, lastEvaluatedKey }: UseListRecipeRatingsQueryParams) {
  const queryClient = useQueryClient()
  const listRecipeRatingsQuery = useQuery<ListRecipeRatingsApiResponse>(
    recipeRatingQueryKeys.list({ recipeId, page }),
    async () => {
      const apiResponse = await api.listRecipeRatings({ recipeId, lastEvaluatedKey })
      apiResponse.data.data.forEach((recipeRating) => queryClient.setQueryData(recipeRatingQueryKeys.details({ recipeId, recipeRatingId: recipeRating.recipeRatingId }), { data: recipeRating }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listRecipeRatingsQuery
}

interface UseSearchRecipeRatingsQueryParams {
  recipeId: string
  recipeRatingId?: string
  lastEvaluatedKey?: string
}

export function useSearchRecipeRatingsQuery({ recipeId, recipeRatingId, lastEvaluatedKey }: UseSearchRecipeRatingsQueryParams) {
  const searchRecipeRatingsQuery = useQuery(
    recipeRatingQueryKeys.search({ recipeId, recipeRatingId }),
    async () => {
      const filter =
        recipeRatingId ?
          {
            filters: [
              {
                property: 'recipeRatingId',
                value: recipeRatingId,
              },
            ],
          }
        : undefined
      const apiResponse = await api.listRecipeRatings({ recipeId, lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchRecipeRatingsQuery
}

export function useGetRecipeRatingQuery({ recipeId, recipeRatingId }) {
  const getRecipeRatingQuery = useQuery(
    recipeRatingQueryKeys.details({ recipeId, recipeRatingId }),
    async () => {
      const apiResponse = await api.getRecipeRating({ recipeId, recipeRatingId })
      return apiResponse.data
    },
    {
      enabled: Boolean(recipeId && recipeRatingId),
    },
  )

  return getRecipeRatingQuery
}

export function useCreateRecipeRatingMutation({ recipeId }) {
  const queryClient = useQueryClient()
  const createRecipeRatingMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createRecipeRating({ recipeId, data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(recipeRatingQueryKeys.list({ recipeId }))
        queryClient.setQueryData(recipeRatingQueryKeys.details({ recipeId, recipeRatingId: response.data.data.recipeRatingId }), {
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

  return createRecipeRatingMutation
}

export function useUpdateRecipeRatingMutation({ recipeId, recipeRatingId }) {
  const queryClient = useQueryClient()
  const updateRecipeRatingMutation = useMutation<any, any, any>(({ data }) => api.updateRecipeRating({ recipeId, recipeRatingId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(recipeRatingQueryKeys.list({ recipeId }))
      queryClient.setQueryData(recipeRatingQueryKeys.details({ recipeId, recipeRatingId: response.data.data.recipeRatingId }), { data: response.data.data })

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

  return updateRecipeRatingMutation
}

export function useDeleteRecipeRatingMutation({ recipeId, recipeRatingId }) {
  const queryClient = useQueryClient()
  const deleteRecipeRatingMutation = useMutation<any, any, any>(() => api.deleteRecipeRating({ recipeId, recipeRatingId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: recipeRatingQueryKeys.details({ recipeId, recipeRatingId }) }),
        queryClient.removeQueries({ queryKey: recipeRatingQueryKeys.details({ recipeId, recipeRatingId }) }),
        queryClient.refetchQueries({ queryKey: recipeRatingQueryKeys.list({ recipeId }) }),
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

  return deleteRecipeRatingMutation
}
