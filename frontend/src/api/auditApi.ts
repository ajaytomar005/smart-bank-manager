import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { AuditLogEntry } from '../types/audit'

export function useAuditLogs(enabled: boolean) {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get<AuditLogEntry[]>('/audit-logs')
      return data
    },
    enabled,
  })
}
