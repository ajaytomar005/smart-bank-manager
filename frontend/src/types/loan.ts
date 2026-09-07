export type LoanStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CLOSED'
export type RiskFlag = 'LOW' | 'MEDIUM' | 'HIGH'
export type ApprovalDecision = 'APPROVED' | 'REJECTED'
export type EmiStatus = 'PENDING' | 'PAID' | 'OVERDUE'

export interface Loan {
  loanId: number
  customerId: number
  amount: number
  interestRate: number
  creditScore: number | null
  riskFlag: RiskFlag | null
  status: LoanStatus
  termMonths: number
  createdAt: string
}

export interface LoanRequest {
  customerId: number
  amount: number
  interestRate: number
  creditScore?: number
  termMonths: number
}

export interface LoanDecisionRequest {
  decision: ApprovalDecision
  reason?: string
}

export interface Emi {
  emiId: number
  loanId: number
  amount: number
  dueDate: string
  status: EmiStatus
}
