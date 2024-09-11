'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListRecipeIngredientsParams {
  recipeId: string
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listRecipeIngredients: ({ recipeId, lastEvaluatedKey, filter }: ListRecipeIngredientsParams) =>
    axios.get(`/recipes/${recipeId}/recipe-ingredients`, {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getRecipeIngredient: ({ recipeId, ingredientId }) => axios.get(`/recipes/${recipeId}/recipe-ingredients/${ingredientId}`),
  createRecipeIngredient: ({ recipeId, data }) => axios.post(`/recipes/${recipeId}/recipe-ingredients`, { recipeIngredient: data }),
  updateRecipeIngredient: ({ recipeId, ingredientId, data }) => axios.put(`/recipes/${recipeId}/recipe-ingredients/${ingredientId}`, { recipeIngredient: data }),
  deleteRecipeIngredient: ({ recipeId, ingredientId }) => axios.delete(`/recipes/${recipeId}/recipe-ingredients/${ingredientId}`),
}

const recipeIngredientQueryKeys = {
  root: ({ recipeId }: { recipeId: string }) => {
    return ['recipes', { recipeId }, 'recipe-ingredients']
  },
  list: ({ recipeId, page }: { recipeId: string; page?: number }) => {
    const queryKey: Array<any> = [...recipeIngredientQueryKeys.root({ recipeId }), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ recipeId, ingredientId }: { recipeId: string; ingredientId?: string }) => {
    return [...recipeIngredientQueryKeys.root({ recipeId }), 'search', { ingredientId }]
  },
  details: ({ recipeId, ingredientId }: { recipeId: string; ingredientId: string }) => [...recipeIngredientQueryKeys.root({ recipeId }), 'details', { ingredientId }],
}

interface UseListRecipeIngredientsQueryParams {
  recipeId: string
  page?: number
  lastEvaluatedKey?: string
}

export interface RecipeIngredientData {
  [k: string]: any
}

interface ListRecipeIngredientsApiResponse {
  data: Array<RecipeIngredientData>
  lastEvaluatedKey: string
}

export function useListRecipeIngredientsQuery({ recipeId, page, lastEvaluatedKey }: UseListRecipeIngredientsQueryParams) {
  const queryClient = useQueryClient()
  const listRecipeIngredientsQuery = useQuery<ListRecipeIngredientsApiResponse>(
    recipeIngredientQueryKeys.list({ recipeId, page }),
    async () => {
      const apiResponse = await api.listRecipeIngredients({ recipeId, lastEvaluatedKey })
      apiResponse.data.data.forEach((recipeIngredient) => queryClient.setQueryData(recipeIngredientQueryKeys.details({ recipeId, ingredientId: recipeIngredient.ingredientId }), { data: recipeIngredient }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listRecipeIngredientsQuery
}

interface UseSearchRecipeIngredientsQueryParams {
  recipeId: string
  ingredientId?: string
  lastEvaluatedKey?: string
}

export function useSearchRecipeIngredientsQuery({ recipeId, ingredientId, lastEvaluatedKey }: UseSearchRecipeIngredientsQueryParams) {
  const searchRecipeIngredientsQuery = useQuery(
    recipeIngredientQueryKeys.search({ recipeId, ingredientId }),
    async () => {
      const filter =
        ingredientId ?
          {
            filters: [
              {
                property: 'ingredientId',
                value: ingredientId,
              },
            ],
          }
        : undefined
      const apiResponse = await api.listRecipeIngredients({ recipeId, lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchRecipeIngredientsQuery
}

export function useGetRecipeIngredientQuery({ recipeId, ingredientId }) {
  const getRecipeIngredientQuery = useQuery(
    recipeIngredientQueryKeys.details({ recipeId, ingredientId }),
    async () => {
      const apiResponse = await api.getRecipeIngredient({ recipeId, ingredientId })
      return apiResponse.data
    },
    {
      enabled: Boolean(recipeId && ingredientId),
    },
  )

  return getRecipeIngredientQuery
}

export function useCreateRecipeIngredientMutation({ recipeId }) {
  const queryClient = useQueryClient()
  const createRecipeIngredientMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createRecipeIngredient({ recipeId, data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(recipeIngredientQueryKeys.list({ recipeId }))
        queryClient.setQueryData(recipeIngredientQueryKeys.details({ recipeId, ingredientId: response.data.data.ingredientId }), {
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

  return createRecipeIngredientMutation
}

export function useUpdateRecipeIngredientMutation({ recipeId, ingredientId }) {
  const queryClient = useQueryClient()
  const updateRecipeIngredientMutation = useMutation<any, any, any>(({ data }) => api.updateRecipeIngredient({ recipeId, ingredientId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(recipeIngredientQueryKeys.list({ recipeId }))
      queryClient.setQueryData(recipeIngredientQueryKeys.details({ recipeId, ingredientId: response.data.data.ingredientId }), { data: response.data.data })

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

  return updateRecipeIngredientMutation
}

export function useDeleteRecipeIngredientMutation({ recipeId, ingredientId }) {
  const queryClient = useQueryClient()
  const deleteRecipeIngredientMutation = useMutation<any, any, any>(() => api.deleteRecipeIngredient({ recipeId, ingredientId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: recipeIngredientQueryKeys.details({ recipeId, ingredientId }) }),
        queryClient.removeQueries({ queryKey: recipeIngredientQueryKeys.details({ recipeId, ingredientId }) }),
        queryClient.refetchQueries({ queryKey: recipeIngredientQueryKeys.list({ recipeId }) }),
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

  return deleteRecipeIngredientMutation
}
