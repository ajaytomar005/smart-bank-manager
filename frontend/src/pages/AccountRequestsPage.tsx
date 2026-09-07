import { useState } from 'react'
import {
  useAllAccountRequests,
  useDownloadDocument,
  useManagerDecide,
  useRequestDocuments,
  useTellerReview,
} from '../api/onboardingApi'
import { useAuthStore } from '../lib/authStore'
import type { AccountRequestStatus } from '../types/onboarding'

const statusColors: Record<AccountRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  TELLER_APPROVED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function AccountRequestsPage() {
  const role = useAuthStore((s) => s.role)
  const canView = role === 'TELLER' || role === 'MANAGER' || role === 'ADMIN'
  const canTellerReview = role === 'TELLER' || role === 'MANAGER' || role === 'ADMIN'
  const canManagerDecide = role === 'MANAGER' || role === 'ADMIN'

  const { data: requests, isLoading } = useAllAccountRequests(canView)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { data: documents } = useRequestDocuments(expandedId)
  const downloadDocument = useDownloadDocument()
  const tellerReview = useTellerReview()
  const managerDecide = useManagerDecide()
  const [notes, setNotes] = useState<Record<number, string>>({})

  if (!canView) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Account Requests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only Tellers, Managers, and Admins can review account opening requests.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Account Requests</h2>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading requests…</p>}
      {requests?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No account requests.</p>
      )}

      <div className="space-y-4">
        {requests?.map((r) => (
          <div
            key={r.requestId}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Request #{r.requestId} · {r.customerName} · {r.accountType}
                </p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  ₹{r.initialDeposit.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[r.status]}`}>
                  {r.status}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === r.requestId ? null : r.requestId)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {expandedId === r.requestId ? 'Hide' : 'Review'}
                </button>
              </div>
            </div>

            {r.tellerReviewedByName && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Teller: {r.tellerReviewedByName} — {r.tellerNotes ?? 'no notes'}
              </p>
            )}
            {r.managerDecidedByName && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manager: {r.managerDecidedByName} — {r.managerNotes ?? 'no notes'}
              </p>
            )}

            {expandedId === r.requestId && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  Documents
                </p>
                {documents?.length === 0 && (
                  <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">No documents uploaded.</p>
                )}
                <ul className="mb-4 space-y-1">
                  {documents?.map((doc) => (
                    <li key={doc.documentId} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {doc.documentType}: {doc.originalFilename}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          downloadDocument.mutate({
                            requestId: r.requestId,
                            documentId: doc.documentId,
                            filename: doc.originalFilename,
                          })
                        }
                        className="text-xs font-medium text-slate-800 hover:underline dark:text-slate-100"
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>

                {r.status === 'PENDING' && canTellerReview && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={notes[r.requestId] ?? ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [r.requestId]: e.target.value }))}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        tellerReview.mutate({
                          requestId: r.requestId,
                          request: { decision: 'APPROVE', notes: notes[r.requestId] },
                        })
                      }
                      className="rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                    >
                      Approve &amp; Forward to Manager
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        tellerReview.mutate({
                          requestId: r.requestId,
                          request: { decision: 'REJECT', notes: notes[r.requestId] },
                        })
                      }
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {r.status === 'TELLER_APPROVED' && canManagerDecide && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={notes[r.requestId] ?? ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [r.requestId]: e.target.value }))}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        managerDecide.mutate({
                          requestId: r.requestId,
                          request: { decision: 'APPROVE', notes: notes[r.requestId] },
                        })
                      }
                      className="rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                    >
                      Approve &amp; Open Account
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        managerDecide.mutate({
                          requestId: r.requestId,
                          request: { decision: 'REJECT', notes: notes[r.requestId] },
                        })
                      }
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
