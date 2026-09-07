import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Account, OpenAccountRequest } from '../types/account'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/accounts')
      return data
    },
  })
}

export function useOpenAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: OpenAccountRequest) => {
      const { data } = await apiClient.post<Account>('/accounts', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}

export function useFreezeAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (accountId: number) => {
      const { data } = await apiClient.patch<Account>(`/accounts/${accountId}/freeze`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}

export function useUnfreezeAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (accountId: number) => {
      const { data } = await apiClient.patch<Account>(`/accounts/${accountId}/unfreeze`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}
