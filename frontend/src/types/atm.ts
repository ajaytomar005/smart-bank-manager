export type AtmStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
export type CashStatus = 'AVAILABLE' | 'LOW' | 'OUT_OF_CASH'
export type AtmServiceType = 'WITHDRAWAL' | 'DEPOSIT' | 'CARDLESS' | 'BALANCE_INQUIRY'

export interface AtmNearby {
  atmId: number
  name: string
  code: string
  address: string
  latitude: number
  longitude: number
  status: AtmStatus
  cashStatus: CashStatus
  is24x7: boolean
  openTime: string | null
  closeTime: string | null
  services: AtmServiceType[]
  openNow: boolean
  availableForWithdrawal: boolean
  distanceMeters: number
}

export interface PageResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface NearbyCount {
  availableCount: number
  totalNearby: number
}
