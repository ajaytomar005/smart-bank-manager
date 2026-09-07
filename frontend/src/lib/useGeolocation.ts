import { useCallback, useState } from 'react'

export interface Coordinates {
  lat: number
  lng: number
}

type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle')

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setStatus('granted')
      },
      () => {
        setStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }, [])

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng })
    setStatus('granted')
  }, [])

  return { coords, status, requestLocation, setManualLocation }
}
