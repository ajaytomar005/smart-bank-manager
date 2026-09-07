export type BeneficiaryType = 'INTERNAL_ACCOUNT' | 'EXTERNAL_BANK' | 'UPI'
export type BeneficiaryStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'REMOVED'
export type TransferMode = 'INTERNAL' | 'IMPS' | 'NEFT' | 'RTGS' | 'UPI'
export type TransferStatus = 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Beneficiary {
  beneficiaryId: number
  nickname: string
  beneficiaryType: BeneficiaryType
  internalAccountId: number | null
  accountNumber: string | null
  ifscCode: string | null
  upiId: string | null
  status: BeneficiaryStatus
  createdAt: string
  activatesAt: string
}

export interface BeneficiaryRequest {
  nickname: string
  beneficiaryType: BeneficiaryType
  internalAccountId?: number
  accountNumber?: string
  ifscCode?: string
  upiId?: string
}

export interface Transfer {
  transferId: number
  sourceAccountId: number
  destinationAccountId: number | null
  beneficiaryId: number | null
  counterpartyLabel: string | null
  mode: TransferMode
  amount: number
  remarks: string | null
  status: TransferStatus
  failureReason: string | null
  initiatedAt: string
  completedAt: string | null
}

export interface TransferRequest {
  sourceAccountId: number
  destinationAccountId?: number
  beneficiaryId?: number
  mode: TransferMode
  amount: number
  remarks?: string
}
