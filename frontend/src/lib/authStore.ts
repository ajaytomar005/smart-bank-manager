import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  email: string | null
  role: AuthResponse['role'] | null
  name: string | null
  setSession: (auth: AuthResponse) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      email: null,
      role: null,
      name: null,
      setSession: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          email: auth.email,
          role: auth.role,
          name: auth.name,
        }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, email: null, role: null, name: null }),
    }),
    { name: 'smart-bank-auth' },
  ),
)
