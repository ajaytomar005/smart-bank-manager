import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Beneficiary, BeneficiaryRequest, Transfer, TransferRequest } from '../types/transfer'

export function useMyBeneficiaries() {
  return useQuery({
    queryKey: ['me', 'beneficiaries'],
    queryFn: async () => {
      const { data } = await apiClient.get<Beneficiary[]>('/me/beneficiaries')
      return data
    },
  })
}

export function useAddBeneficiary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: BeneficiaryRequest) => {
      const { data } = await apiClient.post<Beneficiary>('/me/beneficiaries', request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'beneficiaries'] }),
  })
}

export function useRemoveBeneficiary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (beneficiaryId: number) => {
      await apiClient.delete(`/me/beneficiaries/${beneficiaryId}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'beneficiaries'] }),
  })
}

export function useMyTransfers() {
  return useQuery({
    queryKey: ['me', 'transfers'],
    queryFn: async () => {
      const { data } = await apiClient.get<Transfer[]>('/me/transfers')
      return data
    },
    refetchInterval: (query) => (query.state.data?.some((t) => t.status === 'PROCESSING') ? 5000 : false),
  })
}

export function useInitiateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: TransferRequest) => {
      const { data } = await apiClient.post<Transfer>('/me/transfers', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'transfers'] })
      queryClient.invalidateQueries({ queryKey: ['me', 'accounts'] })
    },
  })
}
