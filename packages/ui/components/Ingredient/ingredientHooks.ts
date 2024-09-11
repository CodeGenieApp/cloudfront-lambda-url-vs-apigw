'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListIngredientsParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listIngredients: ({ lastEvaluatedKey, filter }: ListIngredientsParams) =>
    axios.get('/ingredients', {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getIngredient: ({ ingredientId }) => axios.get(`/ingredients/${ingredientId}`),
  createIngredient: ({ data }) => axios.post('/ingredients', { ingredient: data }),
  updateIngredient: ({ ingredientId, data }) => axios.put(`/ingredients/${ingredientId}`, { ingredient: data }),
  deleteIngredient: ({ ingredientId }) => axios.delete(`/ingredients/${ingredientId}`),
}

const ingredientQueryKeys = {
  root: () => {
    return ['ingredients']
  },
  list: ({ page }: { page?: number } = {}) => {
    const queryKey: Array<any> = [...ingredientQueryKeys.root(), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ name }: { name?: string }) => {
    return [...ingredientQueryKeys.root(), 'search', { name }]
  },
  details: ({ ingredientId }: { ingredientId: string }) => [...ingredientQueryKeys.root(), 'details', { ingredientId }],
}

interface UseListIngredientsQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

export interface IngredientData {
  [k: string]: any
}

interface ListIngredientsApiResponse {
  data: Array<IngredientData>
  lastEvaluatedKey: string
}

export function useListIngredientsQuery({ page, lastEvaluatedKey }: UseListIngredientsQueryParams) {
  const queryClient = useQueryClient()
  const listIngredientsQuery = useQuery<ListIngredientsApiResponse>(
    ingredientQueryKeys.list({ page }),
    async () => {
      const apiResponse = await api.listIngredients({ lastEvaluatedKey })
      apiResponse.data.data.forEach((ingredient) => queryClient.setQueryData(ingredientQueryKeys.details({ ingredientId: ingredient.ingredientId }), { data: ingredient }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listIngredientsQuery
}

interface UseSearchIngredientsQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchIngredientsQuery({ name, lastEvaluatedKey }: UseSearchIngredientsQueryParams) {
  const searchIngredientsQuery = useQuery(
    ingredientQueryKeys.search({ name }),
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
      const apiResponse = await api.listIngredients({ lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchIngredientsQuery
}

export function useGetIngredientQuery({ ingredientId }) {
  const getIngredientQuery = useQuery(
    ingredientQueryKeys.details({ ingredientId }),
    async () => {
      const apiResponse = await api.getIngredient({ ingredientId })
      return apiResponse.data
    },
    {
      enabled: Boolean(ingredientId),
    },
  )

  return getIngredientQuery
}

export function useCreateIngredientMutation() {
  const queryClient = useQueryClient()
  const createIngredientMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createIngredient({ data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(ingredientQueryKeys.list({}))
        queryClient.setQueryData(ingredientQueryKeys.details({ ingredientId: response.data.data.ingredientId }), {
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

  return createIngredientMutation
}

export function useUpdateIngredientMutation({ ingredientId }) {
  const queryClient = useQueryClient()
  const updateIngredientMutation = useMutation<any, any, any>(({ data }) => api.updateIngredient({ ingredientId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(ingredientQueryKeys.list({}))
      queryClient.setQueryData(ingredientQueryKeys.details({ ingredientId: response.data.data.ingredientId }), { data: response.data.data })

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

  return updateIngredientMutation
}

export function useDeleteIngredientMutation({ ingredientId }) {
  const queryClient = useQueryClient()
  const deleteIngredientMutation = useMutation<any, any, any>(() => api.deleteIngredient({ ingredientId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: ingredientQueryKeys.details({ ingredientId }) }),
        queryClient.removeQueries({ queryKey: ingredientQueryKeys.details({ ingredientId }) }),
        queryClient.refetchQueries({ queryKey: ingredientQueryKeys.list() }),
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

  return deleteIngredientMutation
}
