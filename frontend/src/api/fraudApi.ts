import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { FraudAlert, FraudAlertRequest, FraudAlertStatus } from '../types/fraud'

export function useFraudAlerts(enabled: boolean) {
  return useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get<FraudAlert[]>('/fraud/alerts')
      return data
    },
    enabled,
  })
}

export function useRaiseFraudAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: FraudAlertRequest) => {
      const { data } = await apiClient.post<FraudAlert>('/fraud/alerts', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}

export function useUpdateFraudAlertStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ alertId, status }: { alertId: number; status: FraudAlertStatus }) => {
      const { data } = await apiClient.patch<FraudAlert>(`/fraud/alerts/${alertId}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}
