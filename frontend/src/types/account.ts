export type AccountType = 'SAVINGS' | 'CURRENT'
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED'

export interface Account {
  accountId: number
  customerId: number
  accountType: AccountType
  balance: number
  status: AccountStatus
  openedAt: string
}

export interface OpenAccountRequest {
  customerId: number
  accountType: AccountType
  initialDeposit?: number
}
