import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type {
  AccountOpeningRequest,
  AccountOpeningRequestCreate,
  KycDocument,
  KycDocumentType,
  ReviewRequest,
} from '../types/onboarding'

// ---- Customer-facing ----

export function useMyAccountRequests() {
  return useQuery({
    queryKey: ['me', 'account-requests'],
    queryFn: async () => {
      const { data } = await apiClient.get<AccountOpeningRequest[]>('/me/account-requests')
      return data
    },
  })
}

export function useCreateAccountRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: AccountOpeningRequestCreate) => {
      const { data } = await apiClient.post<AccountOpeningRequest>('/me/account-requests', request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'account-requests'] }),
  })
}

export function useMyRequestDocuments(requestId: number | null) {
  return useQuery({
    queryKey: ['me', 'account-requests', requestId, 'documents'],
    queryFn: async () => {
      const { data } = await apiClient.get<KycDocument[]>(`/me/account-requests/${requestId}/documents`)
      return data
    },
    enabled: requestId !== null,
  })
}

export function useUploadMyDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      requestId,
      documentType,
      file,
    }: {
      requestId: number
      documentType: KycDocumentType
      file: File
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<KycDocument>(
        `/me/account-requests/${requestId}/documents?documentType=${documentType}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['me', 'account-requests', variables.requestId, 'documents'] }),
  })
}

// ---- Staff-facing ----

export function useAllAccountRequests(enabled: boolean) {
  return useQuery({
    queryKey: ['account-requests'],
    queryFn: async () => {
      const { data } = await apiClient.get<AccountOpeningRequest[]>('/account-requests')
      return data
    },
    enabled,
  })
}

export function useRequestDocuments(requestId: number | null) {
  return useQuery({
    queryKey: ['account-requests', requestId, 'documents'],
    queryFn: async () => {
      const { data } = await apiClient.get<KycDocument[]>(`/account-requests/${requestId}/documents`)
      return data
    },
    enabled: requestId !== null,
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({
      requestId,
      documentId,
      filename,
    }: {
      requestId: number
      documentId: number
      filename: string
    }) => {
      const response = await apiClient.get(`/account-requests/${requestId}/documents/${documentId}/file`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}

export function useTellerReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, request }: { requestId: number; request: ReviewRequest }) => {
      const { data } = await apiClient.patch<AccountOpeningRequest>(
        `/account-requests/${requestId}/teller-review`,
        request,
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account-requests'] }),
  })
}

export function useManagerDecide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, request }: { requestId: number; request: ReviewRequest }) => {
      const { data } = await apiClient.patch<AccountOpeningRequest>(
        `/account-requests/${requestId}/manager-approve`,
        request,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
