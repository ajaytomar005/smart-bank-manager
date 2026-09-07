import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export type ReportType = 'CUSTOMERS' | 'ACCOUNTS' | 'LOANS' | 'TRANSACTIONS'

export function useExportReport() {
  return useMutation({
    mutationFn: async (type: ReportType) => {
      const response = await apiClient.get('/reports/export', {
        params: { type },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `${type.toLowerCase()}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
