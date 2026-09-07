import { useMemo, useState } from 'react'
import { useNearbyAtmCount, useNearbyAtms } from '../../api/atmApi'
import { AtmMap } from '../../components/AtmMap'
import { useGeolocation } from '../../lib/useGeolocation'
import type { AtmServiceType, CashStatus } from '../../types/atm'

const PAGE_SIZE = 10
const DEFAULT_RADIUS = 2000

const statusChipColors: Record<string, string> = {
  ONLINE: 'bg-green-100 text-green-700',
  OFFLINE: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
}

const cashChipColors: Record<CashStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  LOW: 'bg-yellow-100 text-yellow-700',
  OUT_OF_CASH: 'bg-red-100 text-red-700',
}

function directionsUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`
}

export function ATMsNearMePage() {
  const { coords, status, requestLocation, setManualLocation } = useGeolocation()
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS)
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [hasCashOnly, setHasCashOnly] = useState(false)
  const [serviceFilter, setServiceFilter] = useState<AtmServiceType | ''>('')
  const [page, setPage] = useState(0)

  const queryParams = useMemo(() => {
    if (!coords) return null
    return {
      lat: coords.lat,
      lng: coords.lng,
      radiusMeters,
      openNow: openNowOnly ? true : undefined,
      service: serviceFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    }
  }, [coords, radiusMeters, openNowOnly, serviceFilter, page])

  const { data: pageData, isLoading, isFetching } = useNearbyAtms(queryParams)
  const { data: countData } = useNearbyAtmCount(coords?.lat ?? null, coords?.lng ?? null, radiusMeters)

  const visibleAtms = useMemo(() => {
    const items = pageData?.items ?? []
    return hasCashOnly ? items.filter((a) => a.cashStatus !== 'OUT_OF_CASH') : items
  }, [pageData, hasCashOnly])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const lat = Number(manualLat)
    const lng = Number(manualLng)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setManualLocation(lat, lng)
      setPage(0)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">ATMs Near Me</h2>
        {coords && countData && (
          <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
            {countData.availableCount} ATM{countData.availableCount === 1 ? '' : 's'} open near you
          </span>
        )}
      </div>

      {status === 'idle' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Find ATMs near you with live cash availability.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Use My Location
          </button>
          <ManualLocationForm
            manualLat={manualLat}
            manualLng={manualLng}
            setManualLat={setManualLat}
            setManualLng={setManualLng}
            onSubmit={handleManualSubmit}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Getting your location…
        </div>
      )}

      {(status === 'denied' || status === 'unsupported') && !coords && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center dark:border-yellow-700 dark:bg-yellow-950">
          <p className="mb-4 text-sm text-yellow-800 dark:text-yellow-200">
            {status === 'denied'
              ? "We couldn't access your location. Enter it manually below."
              : 'Geolocation is not supported by your browser. Enter your location manually below.'}
          </p>
          <ManualLocationForm
            manualLat={manualLat}
            manualLng={manualLng}
            setManualLat={setManualLat}
            setManualLng={setManualLng}
            onSubmit={handleManualSubmit}
          />
        </div>
      )}

      {coords && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(e) => {
                  setOpenNowOnly(e.target.checked)
                  setPage(0)
                }}
              />
              Open now
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hasCashOnly}
                onChange={(e) => setHasCashOnly(e.target.checked)}
              />
              Has cash
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value as AtmServiceType | '')
                setPage(0)
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">All services</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="CARDLESS">Cardless</option>
              <option value="BALANCE_INQUIRY">Balance Inquiry</option>
            </select>
            <select
              value={radiusMeters}
              onChange={(e) => {
                setRadiusMeters(Number(e.target.value))
                setPage(0)
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
            <button
              type="button"
              onClick={requestLocation}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Refresh location
            </button>
          </div>

          <div className="mb-6">
            <AtmMap center={coords} atms={visibleAtms} />
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
                />
              ))}
            </div>
          )}

          {!isLoading && visibleAtms.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No ATMs within {(radiusMeters / 1000).toFixed(1)} km — try expanding the radius.
            </div>
          )}

          {!isLoading && visibleAtms.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ATM</th>
                    <th className="px-4 py-3">Distance</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Cash</th>
                    <th className="px-4 py-3">Directions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAtms.map((atm) => (
                    <tr key={atm.atmId} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{atm.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{atm.address}</p>
                      </td>
                      <td className="px-4 py-3">{(atm.distanceMeters / 1000).toFixed(2)} km</td>
                      <td className="px-4 py-3">{atm.is24x7 ? '24x7' : `${atm.openTime}–${atm.closeTime}`}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusChipColors[atm.status]}`}>
                          {atm.availableForWithdrawal ? 'Available' : atm.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${cashChipColors[atm.cashStatus]}`}>
                          {atm.cashStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={directionsUrl(atm.latitude, atm.longitude)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-slate-800 hover:underline dark:text-slate-100"
                        >
                          Directions →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pageData && pageData.total > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                  <button
                    type="button"
                    disabled={page === 0 || isFetching}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                  >
                    Previous
                  </button>
                  <span className="text-slate-500 dark:text-slate-400">
                    Page {page + 1} of {Math.ceil(pageData.total / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    disabled={(page + 1) * PAGE_SIZE >= pageData.total || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ManualLocationFormProps {
  manualLat: string
  manualLng: string
  setManualLat: (v: string) => void
  setManualLng: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function ManualLocationForm({ manualLat, manualLng, setManualLat, setManualLng, onSubmit }: ManualLocationFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <input
        type="text"
        placeholder="Latitude"
        value={manualLat}
        onChange={(e) => setManualLat(e.target.value)}
        className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <input
        type="text"
        placeholder="Longitude"
        value={manualLng}
        onChange={(e) => setManualLng(e.target.value)}
        className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Set Location
      </button>
    </form>
  )
}
