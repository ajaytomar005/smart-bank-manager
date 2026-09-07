import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Employee, EmployeeRequest, EmployeeStatus, Role } from '../types/employee'

export function useEmployees(enabled: boolean) {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await apiClient.get<Employee[]>('/employees')
      return data
    },
    enabled,
  })
}

export function useRoles(enabled: boolean) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await apiClient.get<Role[]>('/roles')
      return data
    },
    enabled,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: EmployeeRequest) => {
      const { data } = await apiClient.post<Employee>('/employees', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ employeeId, status }: { employeeId: number; status: EmployeeStatus }) => {
      const { data } = await apiClient.patch<Employee>(`/employees/${employeeId}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
