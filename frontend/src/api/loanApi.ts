import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Emi, Loan, LoanDecisionRequest, LoanRequest } from '../types/loan'

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data } = await apiClient.get<Loan[]>('/loans')
      return data
    },
  })
}

export function useLoanEmis(loanId: number | null) {
  return useQuery({
    queryKey: ['loans', loanId, 'emis'],
    queryFn: async () => {
      const { data } = await apiClient.get<Emi[]>(`/loans/${loanId}/emis`)
      return data
    },
    enabled: loanId !== null,
  })
}

export function useApplyForLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: LoanRequest) => {
      const { data } = await apiClient.post<Loan>('/loans', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}

export function useDecideLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ loanId, request }: { loanId: number; request: LoanDecisionRequest }) => {
      const { data } = await apiClient.post<Loan>(`/loans/${loanId}/approve`, request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
  })
}
