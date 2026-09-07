export type FraudSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type FraudAlertStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'FALSE_POSITIVE'

export interface FraudAlert {
  alertId: number
  accountId: number
  reason: string
  severity: FraudSeverity
  status: FraudAlertStatus
  raisedAt: string
}

export interface FraudAlertRequest {
  accountId: number
  reason: string
  severity: FraudSeverity
}
