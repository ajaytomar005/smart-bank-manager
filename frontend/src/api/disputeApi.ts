import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Dispute, ResolveDisputeRequest } from '../types/dispute'

export function useDisputes(enabled: boolean) {
  return useQuery({
    queryKey: ['disputes'],
    queryFn: async () => {
      const { data } = await apiClient.get<Dispute[]>('/disputes')
      return data
    },
    enabled,
  })
}

export function useResolveDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ disputeId, request }: { disputeId: number; request: ResolveDisputeRequest }) => {
      const { data } = await apiClient.patch<Dispute>(`/disputes/${disputeId}/resolve`, request)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disputes'] }),
  })
}
