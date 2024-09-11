'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListShoppingListsParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listShoppingLists: ({ lastEvaluatedKey, filter }: ListShoppingListsParams) =>
    axios.get('/shopping-lists', {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getShoppingList: ({ shoppingListId }) => axios.get(`/shopping-lists/${shoppingListId}`),
  createShoppingList: ({ data }) => axios.post('/shopping-lists', { shoppingList: data }),
  updateShoppingList: ({ shoppingListId, data }) => axios.put(`/shopping-lists/${shoppingListId}`, { shoppingList: data }),
  deleteShoppingList: ({ shoppingListId }) => axios.delete(`/shopping-lists/${shoppingListId}`),
}

const shoppingListQueryKeys = {
  root: () => {
    return ['shopping-lists']
  },
  list: ({ page }: { page?: number } = {}) => {
    const queryKey: Array<any> = [...shoppingListQueryKeys.root(), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ name }: { name?: string }) => {
    return [...shoppingListQueryKeys.root(), 'search', { name }]
  },
  details: ({ shoppingListId }: { shoppingListId: string }) => [...shoppingListQueryKeys.root(), 'details', { shoppingListId }],
}

interface UseListShoppingListsQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

export interface ShoppingListData {
  [k: string]: any
}

interface ListShoppingListsApiResponse {
  data: Array<ShoppingListData>
  lastEvaluatedKey: string
}

export function useListShoppingListsQuery({ page, lastEvaluatedKey }: UseListShoppingListsQueryParams) {
  const queryClient = useQueryClient()
  const listShoppingListsQuery = useQuery<ListShoppingListsApiResponse>(
    shoppingListQueryKeys.list({ page }),
    async () => {
      const apiResponse = await api.listShoppingLists({ lastEvaluatedKey })
      apiResponse.data.data.forEach((shoppingList) => queryClient.setQueryData(shoppingListQueryKeys.details({ shoppingListId: shoppingList.shoppingListId }), { data: shoppingList }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listShoppingListsQuery
}

interface UseSearchShoppingListsQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchShoppingListsQuery({ name, lastEvaluatedKey }: UseSearchShoppingListsQueryParams) {
  const searchShoppingListsQuery = useQuery(
    shoppingListQueryKeys.search({ name }),
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
      const apiResponse = await api.listShoppingLists({ lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchShoppingListsQuery
}

export function useGetShoppingListQuery({ shoppingListId }) {
  const getShoppingListQuery = useQuery(
    shoppingListQueryKeys.details({ shoppingListId }),
    async () => {
      const apiResponse = await api.getShoppingList({ shoppingListId })
      return apiResponse.data
    },
    {
      enabled: Boolean(shoppingListId),
    },
  )

  return getShoppingListQuery
}

export function useCreateShoppingListMutation() {
  const queryClient = useQueryClient()
  const createShoppingListMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createShoppingList({ data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(shoppingListQueryKeys.list({}))
        queryClient.setQueryData(shoppingListQueryKeys.details({ shoppingListId: response.data.data.shoppingListId }), {
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

  return createShoppingListMutation
}

export function useUpdateShoppingListMutation({ shoppingListId }) {
  const queryClient = useQueryClient()
  const updateShoppingListMutation = useMutation<any, any, any>(({ data }) => api.updateShoppingList({ shoppingListId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(shoppingListQueryKeys.list({}))
      queryClient.setQueryData(shoppingListQueryKeys.details({ shoppingListId: response.data.data.shoppingListId }), { data: response.data.data })

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

  return updateShoppingListMutation
}

export function useDeleteShoppingListMutation({ shoppingListId }) {
  const queryClient = useQueryClient()
  const deleteShoppingListMutation = useMutation<any, any, any>(() => api.deleteShoppingList({ shoppingListId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: shoppingListQueryKeys.details({ shoppingListId }) }),
        queryClient.removeQueries({ queryKey: shoppingListQueryKeys.details({ shoppingListId }) }),
        queryClient.refetchQueries({ queryKey: shoppingListQueryKeys.list() }),
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

  return deleteShoppingListMutation
}
