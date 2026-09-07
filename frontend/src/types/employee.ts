export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export interface Employee {
  employeeId: number
  name: string
  email: string
  roleName: string
  status: EmployeeStatus
}

export interface EmployeeRequest {
  name: string
  email: string
  password: string
  roleId: number
}

export interface Role {
  roleId: number
  roleName: string
}
