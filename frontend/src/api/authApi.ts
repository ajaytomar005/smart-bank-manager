import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { useAuthStore } from '../lib/authStore'
import type { AuthResponse } from '../types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', request)
      return data
    },
    onSuccess: (data) => setSession(data),
  })
}

export function useCustomerLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/customer/login', request)
      return data
    },
    onSuccess: (data) => setSession(data),
  })
}

export interface CustomerRegisterRequest {
  name: string
  email: string
  phone: string
  password: string
}

export function useCustomerRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: async (request: CustomerRegisterRequest) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/customer/register', request)
      return data
    },
    onSuccess: (data) => setSession(data),
  })
}
