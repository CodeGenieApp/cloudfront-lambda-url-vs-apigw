'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListShoppingListItemsParams {
  shoppingListId: string
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listShoppingListItems: ({ shoppingListId, lastEvaluatedKey, filter }: ListShoppingListItemsParams) =>
    axios.get(`/shopping-lists/${shoppingListId}/shopping-list-items`, {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getShoppingListItem: ({ shoppingListId, ingredientId }) => axios.get(`/shopping-lists/${shoppingListId}/shopping-list-items/${ingredientId}`),
  createShoppingListItem: ({ shoppingListId, data }) => axios.post(`/shopping-lists/${shoppingListId}/shopping-list-items`, { shoppingListItem: data }),
  updateShoppingListItem: ({ shoppingListId, ingredientId, data }) => axios.put(`/shopping-lists/${shoppingListId}/shopping-list-items/${ingredientId}`, { shoppingListItem: data }),
  deleteShoppingListItem: ({ shoppingListId, ingredientId }) => axios.delete(`/shopping-lists/${shoppingListId}/shopping-list-items/${ingredientId}`),
}

const shoppingListItemQueryKeys = {
  root: ({ shoppingListId }: { shoppingListId: string }) => {
    return ['shopping-lists', { shoppingListId }, 'shopping-list-items']
  },
  list: ({ shoppingListId, page }: { shoppingListId: string; page?: number }) => {
    const queryKey: Array<any> = [...shoppingListItemQueryKeys.root({ shoppingListId }), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ shoppingListId, ingredientId }: { shoppingListId: string; ingredientId?: string }) => {
    return [...shoppingListItemQueryKeys.root({ shoppingListId }), 'search', { ingredientId }]
  },
  details: ({ shoppingListId, ingredientId }: { shoppingListId: string; ingredientId: string }) => [...shoppingListItemQueryKeys.root({ shoppingListId }), 'details', { ingredientId }],
}

interface UseListShoppingListItemsQueryParams {
  shoppingListId: string
  page?: number
  lastEvaluatedKey?: string
}

export interface ShoppingListItemData {
  [k: string]: any
}

interface ListShoppingListItemsApiResponse {
  data: Array<ShoppingListItemData>
  lastEvaluatedKey: string
}

export function useListShoppingListItemsQuery({ shoppingListId, page, lastEvaluatedKey }: UseListShoppingListItemsQueryParams) {
  const queryClient = useQueryClient()
  const listShoppingListItemsQuery = useQuery<ListShoppingListItemsApiResponse>(
    shoppingListItemQueryKeys.list({ shoppingListId, page }),
    async () => {
      const apiResponse = await api.listShoppingListItems({ shoppingListId, lastEvaluatedKey })
      apiResponse.data.data.forEach((shoppingListItem) => queryClient.setQueryData(shoppingListItemQueryKeys.details({ shoppingListId, ingredientId: shoppingListItem.ingredientId }), { data: shoppingListItem }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listShoppingListItemsQuery
}

interface UseSearchShoppingListItemsQueryParams {
  shoppingListId: string
  ingredientId?: string
  lastEvaluatedKey?: string
}

export function useSearchShoppingListItemsQuery({ shoppingListId, ingredientId, lastEvaluatedKey }: UseSearchShoppingListItemsQueryParams) {
  const searchShoppingListItemsQuery = useQuery(
    shoppingListItemQueryKeys.search({ shoppingListId, ingredientId }),
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
      const apiResponse = await api.listShoppingListItems({ shoppingListId, lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchShoppingListItemsQuery
}

export function useGetShoppingListItemQuery({ shoppingListId, ingredientId }) {
  const getShoppingListItemQuery = useQuery(
    shoppingListItemQueryKeys.details({ shoppingListId, ingredientId }),
    async () => {
      const apiResponse = await api.getShoppingListItem({ shoppingListId, ingredientId })
      return apiResponse.data
    },
    {
      enabled: Boolean(shoppingListId && ingredientId),
    },
  )

  return getShoppingListItemQuery
}

export function useCreateShoppingListItemMutation({ shoppingListId }) {
  const queryClient = useQueryClient()
  const createShoppingListItemMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createShoppingListItem({ shoppingListId, data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(shoppingListItemQueryKeys.list({ shoppingListId }))
        queryClient.setQueryData(shoppingListItemQueryKeys.details({ shoppingListId, ingredientId: response.data.data.ingredientId }), {
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

  return createShoppingListItemMutation
}

export function useUpdateShoppingListItemMutation({ shoppingListId, ingredientId }) {
  const queryClient = useQueryClient()
  const updateShoppingListItemMutation = useMutation<any, any, any>(({ data }) => api.updateShoppingListItem({ shoppingListId, ingredientId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(shoppingListItemQueryKeys.list({ shoppingListId }))
      queryClient.setQueryData(shoppingListItemQueryKeys.details({ shoppingListId, ingredientId: response.data.data.ingredientId }), { data: response.data.data })

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

  return updateShoppingListItemMutation
}

export function useDeleteShoppingListItemMutation({ shoppingListId, ingredientId }) {
  const queryClient = useQueryClient()
  const deleteShoppingListItemMutation = useMutation<any, any, any>(() => api.deleteShoppingListItem({ shoppingListId, ingredientId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: shoppingListItemQueryKeys.details({ shoppingListId, ingredientId }) }),
        queryClient.removeQueries({ queryKey: shoppingListItemQueryKeys.details({ shoppingListId, ingredientId }) }),
        queryClient.refetchQueries({ queryKey: shoppingListItemQueryKeys.list({ shoppingListId }) }),
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

  return deleteShoppingListItemMutation
}
