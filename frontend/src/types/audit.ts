export interface AuditLogEntry {
  logId: number
  employeeId: number
  employeeName: string
  action: string
  entity: string
  timestamp: string
}
