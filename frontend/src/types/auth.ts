export type Role = 'MANAGER' | 'LOAN_OFFICER' | 'TELLER' | 'COMPLIANCE_OFFICER' | 'ADMIN' | 'CUSTOMER'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  role: Role
  name: string
}
