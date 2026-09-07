export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'

export interface Dispute {
  disputeId: number
  customerId: number
  txnId: number | null
  reason: string
  status: DisputeStatus
  resolutionNotes: string | null
  raisedAt: string
  resolvedAt: string | null
}

export interface RaiseDisputeRequest {
  txnId?: number
  reason: string
}

export interface ResolveDisputeRequest {
  status: DisputeStatus
  resolutionNotes?: string
}
