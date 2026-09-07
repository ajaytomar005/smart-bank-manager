import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCreateAccountRequest,
  useMyAccountRequests,
  useMyRequestDocuments,
  useUploadMyDocument,
} from '../../api/onboardingApi'
import type { AccountRequestStatus, KycDocumentType } from '../../types/onboarding'

const requestSchema = z.object({
  accountType: z.enum(['SAVINGS', 'CURRENT']),
  initialDeposit: z.coerce.number().min(0, 'Cannot be negative').optional(),
})

type RequestFormInput = z.input<typeof requestSchema>
type RequestFormValues = z.output<typeof requestSchema>

const statusColors: Record<AccountRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  TELLER_APPROVED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const statusLabels: Record<AccountRequestStatus, string> = {
  PENDING: 'Pending teller review',
  TELLER_APPROVED: 'Pending manager approval',
  APPROVED: 'Approved — account opened',
  REJECTED: 'Rejected',
}

export function PortalAccountRequestsPage() {
  const { data: requests, isLoading } = useMyAccountRequests()
  const createRequest = useCreateAccountRequest()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { accountType: 'SAVINGS' },
  })

  function onSubmit(values: RequestFormValues) {
    createRequest.mutate(values, {
      onSuccess: (r) => {
        reset()
        setShowForm(false)
        setExpandedId(r.requestId)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Open a New Account</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Account Type
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('accountType')}
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Initial Deposit (optional)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('initialDeposit')}
            />
            {errors.initialDeposit && (
              <p className="mt-1 text-xs text-red-600">{errors.initialDeposit.message}</p>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 sm:col-span-2">
            After submitting, you&apos;ll be able to upload KYC documents. A teller and manager will review
            your request before the account is opened.
          </p>

          {createRequest.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">Could not submit this request.</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createRequest.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {createRequest.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading requests…</p>}
      {requests?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No account requests yet.</p>
      )}

      <div className="space-y-4">
        {requests?.map((r) => (
          <Fragment key={r.requestId}>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Request #{r.requestId} · {r.accountType}
                  </p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    ₹{r.initialDeposit.toFixed(2)} initial deposit
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[r.status]}`}>
                    {statusLabels[r.status]}
                  </span>
                  {r.status !== 'APPROVED' && r.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === r.requestId ? null : r.requestId)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {expandedId === r.requestId ? 'Hide documents' : 'Manage documents'}
                    </button>
                  )}
                </div>
              </div>
              {r.status === 'REJECTED' && r.managerNotes && (
                <p className="mt-2 text-sm text-red-600">Reason: {r.managerNotes}</p>
              )}
              {r.status === 'APPROVED' && (
                <p className="mt-2 text-sm text-green-600">Account #{r.createdAccountId} is now active.</p>
              )}
            </div>

            {expandedId === r.requestId && <DocumentUploader requestId={r.requestId} />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const documentTypeLabels: Record<KycDocumentType, string> = {
  ID_PROOF: 'ID Proof',
  ADDRESS_PROOF: 'Address Proof',
  PHOTO: 'Photo',
  OTHER: 'Other',
}

function DocumentUploader({ requestId }: { requestId: number }) {
  const { data: documents, isLoading } = useMyRequestDocuments(requestId)
  const uploadDocument = useUploadMyDocument()
  const [documentType, setDocumentType] = useState<KycDocumentType>('ID_PROOF')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadDocument.mutate(
      { requestId, documentType, file },
      { onSuccess: () => fileInputRef.current && (fileInputRef.current.value = '') },
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
      <p className="mb-3 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        KYC Documents
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as KycDocumentType)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="ID_PROOF">ID Proof</option>
          <option value="ADDRESS_PROOF">Address Proof</option>
          <option value="PHOTO">Photo</option>
          <option value="OTHER">Other</option>
        </select>
        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="text-sm" />
        {uploadDocument.isPending && <span className="text-xs text-slate-500">Uploading…</span>}
        {uploadDocument.isError && <span className="text-xs text-red-600">Upload failed</span>}
      </div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading documents…</p>}
      {documents?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No documents uploaded yet.</p>
      )}
      <ul className="space-y-1">
        {documents?.map((doc) => (
          <li key={doc.documentId} className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">{documentTypeLabels[doc.documentType]}:</span> {doc.originalFilename}{' '}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({(doc.sizeBytes / 1024).toFixed(1)} KB)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
