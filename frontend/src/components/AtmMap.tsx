import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { AtmNearby } from '../types/atm'
import type { Coordinates } from '../lib/useGeolocation'

function markerColor(atm: AtmNearby): string {
  if (atm.availableForWithdrawal) return '#16a34a' // green
  if (atm.status !== 'ONLINE' || atm.cashStatus === 'OUT_OF_CASH') return '#dc2626' // red
  return '#d97706' // amber
}

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.6);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

interface AtmMapProps {
  center: Coordinates
  atms: AtmNearby[]
}

export function AtmMap({ center, atms }: AtmMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      scrollWheelZoom
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {atms.map((atm) => (
        <Marker key={atm.atmId} position={[atm.latitude, atm.longitude]} icon={makeIcon(markerColor(atm))}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{atm.name}</p>
              <p>{(atm.distanceMeters / 1000).toFixed(2)} km away</p>
              <p>{atm.is24x7 ? 'Open 24x7' : `${atm.openTime ?? '—'} – ${atm.closeTime ?? '—'}`}</p>
              <p>{atm.services.join(', ')}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
