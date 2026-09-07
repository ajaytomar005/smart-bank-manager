import axios from 'axios'
import type { AuthResponse } from '../types/auth'
import { useAuthStore } from './authStore'

export const apiClient = axios.create({ baseURL: '/api' })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, role } = useAuthStore.getState()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const endpoint = role === 'CUSTOMER' ? '/api/auth/customer/refresh' : '/api/auth/refresh'
  const { data } = await axios.post<AuthResponse>(endpoint, { refreshToken })
  useAuthStore.getState().setSession(data)
  return data.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newAccessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch {
        const wasCustomer = useAuthStore.getState().role === 'CUSTOMER'
        useAuthStore.getState().clearSession()
        window.location.href = wasCustomer ? '/customer/login' : '/login'
      }
    }

    return Promise.reject(error)
  },
)
