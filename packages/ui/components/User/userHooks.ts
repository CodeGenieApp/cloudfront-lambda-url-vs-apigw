'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListUsersParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listUsers: ({ lastEvaluatedKey, filter }: ListUsersParams) =>
    axios.get('/users', {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getUser: ({ userId }) => axios.get(`/users/${userId}`),
  createUser: ({ data }) => axios.post('/users', { user: data }),
  updateUser: ({ userId, data }) => axios.put(`/users/${userId}`, { user: data }),
  deleteUser: ({ userId }) => axios.delete(`/users/${userId}`),
}

const userQueryKeys = {
  root: () => {
    return ['users']
  },
  list: ({ page }: { page?: number } = {}) => {
    const queryKey: Array<any> = [...userQueryKeys.root(), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ name }: { name?: string }) => {
    return [...userQueryKeys.root(), 'search', { name }]
  },
  details: ({ userId }: { userId: string }) => [...userQueryKeys.root(), 'details', { userId }],
}

interface UseListUsersQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

export interface UserData {
  [k: string]: any
}

interface ListUsersApiResponse {
  data: Array<UserData>
  lastEvaluatedKey: string
}

export function useListUsersQuery({ page, lastEvaluatedKey }: UseListUsersQueryParams) {
  const queryClient = useQueryClient()
  const listUsersQuery = useQuery<ListUsersApiResponse>(
    userQueryKeys.list({ page }),
    async () => {
      const apiResponse = await api.listUsers({ lastEvaluatedKey })
      apiResponse.data.data.forEach((user) => queryClient.setQueryData(userQueryKeys.details({ userId: user.userId }), { data: user }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listUsersQuery
}

interface UseSearchUsersQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchUsersQuery({ name, lastEvaluatedKey }: UseSearchUsersQueryParams) {
  const searchUsersQuery = useQuery(
    userQueryKeys.search({ name }),
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
      const apiResponse = await api.listUsers({ lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchUsersQuery
}

export function useGetUserQuery({ userId }) {
  const getUserQuery = useQuery(
    userQueryKeys.details({ userId }),
    async () => {
      const apiResponse = await api.getUser({ userId })
      return apiResponse.data
    },
    {
      enabled: Boolean(userId),
    },
  )

  return getUserQuery
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  const createUserMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createUser({ data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(userQueryKeys.list({}))
        queryClient.setQueryData(userQueryKeys.details({ userId: response.data.data.userId }), {
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

  return createUserMutation
}

export function useUpdateUserMutation({ userId }) {
  const queryClient = useQueryClient()
  const updateUserMutation = useMutation<any, any, any>(({ data }) => api.updateUser({ userId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(userQueryKeys.list({}))
      queryClient.setQueryData(userQueryKeys.details({ userId: response.data.data.userId }), { data: response.data.data })

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

  return updateUserMutation
}

export function useDeleteUserMutation({ userId }) {
  const queryClient = useQueryClient()
  const deleteUserMutation = useMutation<any, any, any>(() => api.deleteUser({ userId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: userQueryKeys.details({ userId }) }),
        queryClient.removeQueries({ queryKey: userQueryKeys.details({ userId }) }),
        queryClient.refetchQueries({ queryKey: userQueryKeys.list() }),
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

  return deleteUserMutation
}
