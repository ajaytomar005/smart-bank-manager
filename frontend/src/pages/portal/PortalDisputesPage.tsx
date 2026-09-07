import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMyDisputes, useRaiseMyDispute } from '../../api/portalApi'
import type { DisputeStatus } from '../../types/dispute'

const disputeSchema = z.object({
  txnId: z.coerce.number().optional(),
  reason: z.string().min(1, 'Reason is required'),
})

type DisputeFormInput = z.input<typeof disputeSchema>
type DisputeFormValues = z.output<typeof disputeSchema>

const statusColors: Record<DisputeStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export function PortalDisputesPage() {
  const { data: disputes, isLoading } = useMyDisputes()
  const raiseDispute = useRaiseMyDispute()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisputeFormInput, unknown, DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
  })

  function onSubmit(values: DisputeFormValues) {
    raiseDispute.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Disputes</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'Raise a Dispute'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Transaction ID (optional)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('txnId')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('reason')}
            />
            {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
          </div>

          {raiseDispute.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">Could not raise this dispute.</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={raiseDispute.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {raiseDispute.isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading disputes…</p>}
      {disputes?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">You have no disputes.</p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Dispute</th>
              <th className="px-4 py-3">Txn</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Raised</th>
              <th className="px-4 py-3">Resolution</th>
            </tr>
          </thead>
          <tbody>
            {disputes?.map((dispute) => (
              <tr key={dispute.disputeId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">#{dispute.disputeId}</td>
                <td className="px-4 py-3">{dispute.txnId ?? '—'}</td>
                <td className="px-4 py-3">{dispute.reason}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[dispute.status]}`}>
                    {dispute.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(dispute.raisedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {dispute.resolutionNotes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
