export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'

export interface Transaction {
  txnId: number
  accountId: number
  type: TransactionType
  amount: number
  status: TransactionStatus
  txnTime: string
}

export interface TransactionRequest {
  accountId: number
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
}
