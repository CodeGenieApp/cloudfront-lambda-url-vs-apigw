'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListRecipesParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listRecipes: ({ lastEvaluatedKey, filter }: ListRecipesParams) =>
    axios.get('/recipes', {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getRecipe: ({ recipeId }) => axios.get(`/recipes/${recipeId}`),
  createRecipe: ({ data }) => axios.post('/recipes', { recipe: data }),
  updateRecipe: ({ recipeId, data }) => axios.put(`/recipes/${recipeId}`, { recipe: data }),
  deleteRecipe: ({ recipeId }) => axios.delete(`/recipes/${recipeId}`),
}

const recipeQueryKeys = {
  root: () => {
    return ['recipes']
  },
  list: ({ page }: { page?: number } = {}) => {
    const queryKey: Array<any> = [...recipeQueryKeys.root(), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ title }: { title?: string }) => {
    return [...recipeQueryKeys.root(), 'search', { title }]
  },
  details: ({ recipeId }: { recipeId: string }) => [...recipeQueryKeys.root(), 'details', { recipeId }],
}

interface UseListRecipesQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

export interface RecipeData {
  [k: string]: any
}

interface ListRecipesApiResponse {
  data: Array<RecipeData>
  lastEvaluatedKey: string
}

export function useListRecipesQuery({ page, lastEvaluatedKey }: UseListRecipesQueryParams) {
  const queryClient = useQueryClient()
  const listRecipesQuery = useQuery<ListRecipesApiResponse>(
    recipeQueryKeys.list({ page }),
    async () => {
      const apiResponse = await api.listRecipes({ lastEvaluatedKey })
      apiResponse.data.data.forEach((recipe) => queryClient.setQueryData(recipeQueryKeys.details({ recipeId: recipe.recipeId }), { data: recipe }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listRecipesQuery
}

interface UseSearchRecipesQueryParams {
  title?: string
  lastEvaluatedKey?: string
}

export function useSearchRecipesQuery({ title, lastEvaluatedKey }: UseSearchRecipesQueryParams) {
  const searchRecipesQuery = useQuery(
    recipeQueryKeys.search({ title }),
    async () => {
      const filter =
        title ?
          {
            filters: [
              {
                property: 'title',
                value: title,
              },
            ],
          }
        : undefined
      const apiResponse = await api.listRecipes({ lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchRecipesQuery
}

export function useGetRecipeQuery({ recipeId }) {
  const getRecipeQuery = useQuery(
    recipeQueryKeys.details({ recipeId }),
    async () => {
      const apiResponse = await api.getRecipe({ recipeId })
      return apiResponse.data
    },
    {
      enabled: Boolean(recipeId),
    },
  )

  return getRecipeQuery
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient()
  const createRecipeMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createRecipe({ data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(recipeQueryKeys.list({}))
        queryClient.setQueryData(recipeQueryKeys.details({ recipeId: response.data.data.recipeId }), {
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

  return createRecipeMutation
}

export function useUpdateRecipeMutation({ recipeId }) {
  const queryClient = useQueryClient()
  const updateRecipeMutation = useMutation<any, any, any>(({ data }) => api.updateRecipe({ recipeId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(recipeQueryKeys.list({}))
      queryClient.setQueryData(recipeQueryKeys.details({ recipeId: response.data.data.recipeId }), { data: response.data.data })

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

  return updateRecipeMutation
}

export function useDeleteRecipeMutation({ recipeId }) {
  const queryClient = useQueryClient()
  const deleteRecipeMutation = useMutation<any, any, any>(() => api.deleteRecipe({ recipeId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: recipeQueryKeys.details({ recipeId }) }),
        queryClient.removeQueries({ queryKey: recipeQueryKeys.details({ recipeId }) }),
        queryClient.refetchQueries({ queryKey: recipeQueryKeys.list() }),
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

  return deleteRecipeMutation
}
