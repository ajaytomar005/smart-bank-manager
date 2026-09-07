import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  /** 'staff' allows any non-customer role; 'customer' allows only CUSTOMER. Omit to allow any authenticated principal. */
  audience?: 'staff' | 'customer'
}

export function ProtectedRoute({ children, audience }: ProtectedRouteProps) {
  const { accessToken, role } = useAuthStore()

  if (!accessToken) {
    return <Navigate to={audience === 'customer' ? '/customer/login' : '/login'} replace />
  }
  if (audience === 'customer' && role !== 'CUSTOMER') {
    return <Navigate to="/login" replace />
  }
  if (audience === 'staff' && role === 'CUSTOMER') {
    return <Navigate to="/customer/login" replace />
  }
  return <>{children}</>
}
