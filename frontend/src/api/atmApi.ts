import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { AtmNearby, AtmServiceType, NearbyCount, PageResponse } from '../types/atm'

export interface NearbyAtmsParams {
  lat: number
  lng: number
  radiusMeters: number
  openNow?: boolean
  service?: AtmServiceType
  page: number
  pageSize: number
}

export function useNearbyAtms(params: NearbyAtmsParams | null) {
  return useQuery({
    queryKey: ['atms', 'nearby', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PageResponse<AtmNearby>>('/atms/nearby', { params })
      return data
    },
    enabled: params !== null,
    placeholderData: (prev) => prev,
  })
}

export function useNearbyAtmCount(lat: number | null, lng: number | null, radiusMeters: number) {
  return useQuery({
    queryKey: ['atms', 'nearby', 'count', lat, lng, radiusMeters],
    queryFn: async () => {
      const { data } = await apiClient.get<NearbyCount>('/atms/nearby/count', {
        params: { lat, lng, radiusMeters },
      })
      return data
    },
    enabled: lat !== null && lng !== null,
  })
}
