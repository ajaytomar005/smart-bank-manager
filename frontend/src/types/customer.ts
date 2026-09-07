export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface Customer {
  customerId: number
  name: string
  email: string
  phone: string
  kycStatus: KycStatus
  segment: string | null
  createdAt: string
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone: string
  segment?: string
}
