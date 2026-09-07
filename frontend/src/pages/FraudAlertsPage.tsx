import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAccounts } from '../api/accountApi'
import { useFraudAlerts, useRaiseFraudAlert, useUpdateFraudAlertStatus } from '../api/fraudApi'
import { useAuthStore } from '../lib/authStore'
import type { FraudAlertStatus } from '../types/fraud'

const alertSchema = z.object({
  accountId: z.coerce.number().min(1, 'Select an account'),
  reason: z.string().min(1, 'Reason is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
})

type AlertFormInput = z.input<typeof alertSchema>
type AlertFormValues = z.output<typeof alertSchema>

const severityColors: Record<string, string> = {
  LOW: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const statusColors: Record<FraudAlertStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  REVIEWED: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  FALSE_POSITIVE: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export function FraudAlertsPage() {
  const role = useAuthStore((s) => s.role)
  const canView = role === 'COMPLIANCE_OFFICER' || role === 'MANAGER' || role === 'ADMIN'
  const { data: alerts, isLoading } = useFraudAlerts(canView)
  const { data: accounts } = useAccounts()
  const raiseAlert = useRaiseFraudAlert()
  const updateStatus = useUpdateFraudAlertStatus()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertFormInput, unknown, AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: { severity: 'MEDIUM' },
  })

  function onSubmit(values: AlertFormValues) {
    raiseAlert.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Fraud &amp; Risk Alerts</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'Raise Alert'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('accountId')}
            >
              <option value="">Select account…</option>
              {accounts?.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  #{a.accountId} · {a.accountType}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Severity</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('severity')}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('reason')}
            />
            {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
          </div>

          {raiseAlert.isError && (
            <p className="text-sm text-red-600 sm:col-span-3">Could not raise this alert.</p>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={raiseAlert.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {raiseAlert.isPending ? 'Raising…' : 'Raise Alert'}
            </button>
          </div>
        </form>
      )}

      {!canView && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You can raise alerts, but only Compliance Officers, Managers, and Admins can view the
          alert queue.
        </p>
      )}

      {canView && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Raised</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={7}>
                    Loading alerts…
                  </td>
                </tr>
              )}
              {alerts?.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={7}>
                    No fraud alerts.
                  </td>
                </tr>
              )}
              {alerts?.map((alert) => (
                <tr key={alert.alertId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">#{alert.alertId}</td>
                  <td className="px-4 py-3">#{alert.accountId}</td>
                  <td className="px-4 py-3">{alert.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${severityColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[alert.status]}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(alert.raisedAt).toLocaleString()}
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    {alert.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus.mutate({ alertId: alert.alertId, status: 'REVIEWED' })
                        }
                        className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && alert.status !== 'FALSE_POSITIVE' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus.mutate({ alertId: alert.alertId, status: 'RESOLVED' })
                          }
                          className="rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus.mutate({ alertId: alert.alertId, status: 'FALSE_POSITIVE' })
                          }
                          className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        >
                          False Positive
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
