'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListStepsParams {
  recipeId: string
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listSteps: ({ recipeId, lastEvaluatedKey, filter }: ListStepsParams) =>
    axios.get(`/recipes/${recipeId}/steps`, {
      params: {
        lastEvaluatedKey,
        filter,
      },
    }),
  getStep: ({ recipeId, stepId }) => axios.get(`/recipes/${recipeId}/steps/${stepId}`),
  createStep: ({ recipeId, data }) => axios.post(`/recipes/${recipeId}/steps`, { step: data }),
  updateStep: ({ recipeId, stepId, data }) => axios.put(`/recipes/${recipeId}/steps/${stepId}`, { step: data }),
  deleteStep: ({ recipeId, stepId }) => axios.delete(`/recipes/${recipeId}/steps/${stepId}`),
}

const stepQueryKeys = {
  root: ({ recipeId }: { recipeId: string }) => {
    return ['recipes', { recipeId }, 'steps']
  },
  list: ({ recipeId, page }: { recipeId: string; page?: number }) => {
    const queryKey: Array<any> = [...stepQueryKeys.root({ recipeId }), 'list']

    if (page) {
      queryKey.push({ page })
    }

    return queryKey
  },
  search: ({ recipeId, stepId }: { recipeId: string; stepId?: string }) => {
    return [...stepQueryKeys.root({ recipeId }), 'search', { stepId }]
  },
  details: ({ recipeId, stepId }: { recipeId: string; stepId: string }) => [...stepQueryKeys.root({ recipeId }), 'details', { stepId }],
}

interface UseListStepsQueryParams {
  recipeId: string
  page?: number
  lastEvaluatedKey?: string
}

export interface StepData {
  [k: string]: any
}

interface ListStepsApiResponse {
  data: Array<StepData>
  lastEvaluatedKey: string
}

export function useListStepsQuery({ recipeId, page, lastEvaluatedKey }: UseListStepsQueryParams) {
  const queryClient = useQueryClient()
  const listStepsQuery = useQuery<ListStepsApiResponse>(
    stepQueryKeys.list({ recipeId, page }),
    async () => {
      const apiResponse = await api.listSteps({ recipeId, lastEvaluatedKey })
      apiResponse.data.data.forEach((step) => queryClient.setQueryData(stepQueryKeys.details({ recipeId, stepId: step.stepId }), { data: step }))
      return apiResponse.data
    },
    {
      keepPreviousData: true,
    },
  )

  return listStepsQuery
}

interface UseSearchStepsQueryParams {
  recipeId: string
  stepId?: string
  lastEvaluatedKey?: string
}

export function useSearchStepsQuery({ recipeId, stepId, lastEvaluatedKey }: UseSearchStepsQueryParams) {
  const searchStepsQuery = useQuery(
    stepQueryKeys.search({ recipeId, stepId }),
    async () => {
      const filter =
        stepId ?
          {
            filters: [
              {
                property: 'stepId',
                value: stepId,
              },
            ],
          }
        : undefined
      const apiResponse = await api.listSteps({ recipeId, lastEvaluatedKey, filter })
      return apiResponse.data
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30s
    },
  )

  return searchStepsQuery
}

export function useGetStepQuery({ recipeId, stepId }) {
  const getStepQuery = useQuery(
    stepQueryKeys.details({ recipeId, stepId }),
    async () => {
      const apiResponse = await api.getStep({ recipeId, stepId })
      return apiResponse.data
    },
    {
      enabled: Boolean(recipeId && stepId),
    },
  )

  return getStepQuery
}

export function useCreateStepMutation({ recipeId }) {
  const queryClient = useQueryClient()
  const createStepMutation = useMutation<any, any, any>(
    async ({ data }) => {
      return api.createStep({ recipeId, data })
    },
    {
      onSuccess(response) {
        queryClient.invalidateQueries(stepQueryKeys.list({ recipeId }))
        queryClient.setQueryData(stepQueryKeys.details({ recipeId, stepId: response.data.data.stepId }), {
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

  return createStepMutation
}

export function useUpdateStepMutation({ recipeId, stepId }) {
  const queryClient = useQueryClient()
  const updateStepMutation = useMutation<any, any, any>(({ data }) => api.updateStep({ recipeId, stepId, data }), {
    onSuccess(response) {
      queryClient.refetchQueries(stepQueryKeys.list({ recipeId }))
      queryClient.setQueryData(stepQueryKeys.details({ recipeId, stepId: response.data.data.stepId }), { data: response.data.data })

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

  return updateStepMutation
}

export function useDeleteStepMutation({ recipeId, stepId }) {
  const queryClient = useQueryClient()
  const deleteStepMutation = useMutation<any, any, any>(() => api.deleteStep({ recipeId, stepId }), {
    onSuccess(response) {
      return Promise.all([
        queryClient.cancelQueries({ queryKey: stepQueryKeys.details({ recipeId, stepId }) }),
        queryClient.removeQueries({ queryKey: stepQueryKeys.details({ recipeId, stepId }) }),
        queryClient.refetchQueries({ queryKey: stepQueryKeys.list({ recipeId }) }),
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

  return deleteStepMutation
}
