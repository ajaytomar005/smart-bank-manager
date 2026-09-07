import { useState } from 'react'
import { useDisputes, useResolveDispute } from '../api/disputeApi'
import { useAuthStore } from '../lib/authStore'
import type { DisputeStatus } from '../types/dispute'

const statusColors: Record<DisputeStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export function DisputesPage() {
  const role = useAuthStore((s) => s.role)
  const canView = role === 'COMPLIANCE_OFFICER' || role === 'MANAGER' || role === 'ADMIN'
  const { data: disputes, isLoading } = useDisputes(canView)
  const resolveDispute = useResolveDispute()
  const [notesByDispute, setNotesByDispute] = useState<Record<number, string>>({})

  if (!canView) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Disputes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only Compliance Officers, Managers, and Admins can view disputes.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Disputes</h2>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Dispute</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Txn</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  Loading disputes…
                </td>
              </tr>
            )}
            {disputes?.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  No disputes.
                </td>
              </tr>
            )}
            {disputes?.map((dispute) => (
              <tr key={dispute.disputeId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">#{dispute.disputeId}</td>
                <td className="px-4 py-3">#{dispute.customerId}</td>
                <td className="px-4 py-3">{dispute.txnId ?? '—'}</td>
                <td className="px-4 py-3">{dispute.reason}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[dispute.status]}`}>
                    {dispute.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {dispute.status === 'OPEN' || dispute.status === 'IN_REVIEW' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Resolution notes"
                        value={notesByDispute[dispute.disputeId] ?? ''}
                        onChange={(e) =>
                          setNotesByDispute((prev) => ({ ...prev, [dispute.disputeId]: e.target.value }))
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          resolveDispute.mutate({
                            disputeId: dispute.disputeId,
                            request: {
                              status: 'RESOLVED',
                              resolutionNotes: notesByDispute[dispute.disputeId],
                            },
                          })
                        }
                        className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          resolveDispute.mutate({
                            disputeId: dispute.disputeId,
                            request: {
                              status: 'REJECTED',
                              resolutionNotes: notesByDispute[dispute.disputeId],
                            },
                          })
                        }
                        className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {dispute.resolutionNotes ?? '—'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
