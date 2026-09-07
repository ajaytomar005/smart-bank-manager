import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Account } from '../types/account'
import type { Customer } from '../types/customer'
import type { Dispute, RaiseDisputeRequest } from '../types/dispute'
import type { Emi, Loan } from '../types/loan'
import type { Transaction } from '../types/transaction'

export interface MyProfileUpdateRequest {
  name: string
  phone: string
  segment?: string
}

export interface MyLoanApplicationRequest {
  amount: number
  interestRate: number
  creditScore?: number
  termMonths: number
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<Customer>('/me/profile')
      return data
    },
  })
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: MyProfileUpdateRequest) => {
      const { data } = await apiClient.put<Customer>('/me/profile', request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'profile'] }),
  })
}

export function useMyAccounts() {
  return useQuery({
    queryKey: ['me', 'accounts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/me/accounts')
      return data
    },
  })
}

export function useMyAccountTransactions(accountId: number | null) {
  return useQuery({
    queryKey: ['me', 'accounts', accountId, 'transactions'],
    queryFn: async () => {
      const { data } = await apiClient.get<Transaction[]>(`/me/accounts/${accountId}/transactions`)
      return data
    },
    enabled: accountId !== null,
  })
}

export function useMyLoans() {
  return useQuery({
    queryKey: ['me', 'loans'],
    queryFn: async () => {
      const { data } = await apiClient.get<Loan[]>('/me/loans')
      return data
    },
  })
}

export function useMyLoanEmis(loanId: number | null) {
  return useQuery({
    queryKey: ['me', 'loans', loanId, 'emis'],
    queryFn: async () => {
      const { data } = await apiClient.get<Emi[]>(`/me/loans/${loanId}/emis`)
      return data
    },
    enabled: loanId !== null,
  })
}

export function useApplyForMyLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: MyLoanApplicationRequest) => {
      const { data } = await apiClient.post<Loan>('/me/loans', request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'loans'] }),
  })
}

export function useMyDisputes() {
  return useQuery({
    queryKey: ['me', 'disputes'],
    queryFn: async () => {
      const { data } = await apiClient.get<Dispute[]>('/me/disputes')
      return data
    },
  })
}

export function useRaiseMyDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: RaiseDisputeRequest) => {
      const { data } = await apiClient.post<Dispute>('/me/disputes', request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'disputes'] }),
  })
}
