import type { AccountType } from './account'

export type AccountRequestStatus = 'PENDING' | 'TELLER_APPROVED' | 'APPROVED' | 'REJECTED'
export type KycDocumentType = 'ID_PROOF' | 'ADDRESS_PROOF' | 'PHOTO' | 'OTHER'
export type ReviewDecision = 'APPROVE' | 'REJECT'

export interface AccountOpeningRequest {
  requestId: number
  customerId: number
  customerName: string
  accountType: AccountType
  initialDeposit: number
  status: AccountRequestStatus
  tellerReviewedByName: string | null
  tellerReviewedAt: string | null
  tellerNotes: string | null
  managerDecidedByName: string | null
  managerDecidedAt: string | null
  managerNotes: string | null
  createdAccountId: number | null
  requestedAt: string
}

export interface AccountOpeningRequestCreate {
  accountType: AccountType
  initialDeposit?: number
}

export interface KycDocument {
  documentId: number
  requestId: number
  documentType: KycDocumentType
  originalFilename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export interface ReviewRequest {
  decision: ReviewDecision
  notes?: string
}
