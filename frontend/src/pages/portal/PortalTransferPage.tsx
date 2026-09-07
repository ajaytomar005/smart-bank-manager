import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMyAccounts } from '../../api/portalApi'
import { useInitiateTransfer, useMyBeneficiaries, useMyTransfers } from '../../api/transferApi'
import type { TransferStatus } from '../../types/transfer'

const transferSchema = z
  .object({
    sourceAccountId: z.coerce.number().min(1, 'Select a source account'),
    destinationType: z.enum(['own', 'beneficiary']),
    destinationAccountId: z.coerce.number().optional(),
    beneficiaryId: z.coerce.number().optional(),
    mode: z.enum(['INTERNAL', 'IMPS', 'NEFT', 'RTGS', 'UPI']),
    amount: z.coerce.number().min(0.01, 'Amount must be positive'),
    remarks: z.string().max(280).optional(),
  })
  .refine((v) => v.destinationType !== 'own' || v.destinationAccountId, {
    message: 'Select a destination account',
    path: ['destinationAccountId'],
  })
  .refine((v) => v.destinationType !== 'beneficiary' || v.beneficiaryId, {
    message: 'Select a beneficiary',
    path: ['beneficiaryId'],
  })

type TransferFormInput = z.input<typeof transferSchema>
type TransferFormValues = z.output<typeof transferSchema>

const statusColors: Record<TransferStatus, string> = {
  INITIATED: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

export function PortalTransferPage() {
  const { data: accounts } = useMyAccounts()
  const { data: beneficiaries } = useMyBeneficiaries()
  const { data: transfers, isLoading } = useMyTransfers()
  const initiateTransfer = useInitiateTransfer()
  const [destinationType, setDestinationType] = useState<'own' | 'beneficiary'>('own')

  const activeBeneficiaries = beneficiaries?.filter((b) => b.status !== 'REMOVED') ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormInput, unknown, TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { mode: 'INTERNAL', destinationType: 'own' },
  })

  function onSubmit(values: TransferFormValues) {
    initiateTransfer.mutate(
      {
        sourceAccountId: values.sourceAccountId,
        destinationAccountId: values.destinationType === 'own' ? values.destinationAccountId : undefined,
        beneficiaryId: values.destinationType === 'beneficiary' ? values.beneficiaryId : undefined,
        mode: values.mode,
        amount: values.amount,
        remarks: values.remarks,
      },
      { onSuccess: () => reset() },
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Transfer Money</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 grid max-w-2xl grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            From Account
          </label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('sourceAccountId')}
          >
            <option value="">Select account…</option>
            {accounts?.map((a) => (
              <option key={a.accountId} value={a.accountId}>
                #{a.accountId} · {a.accountType} · ₹{a.balance.toFixed(2)}
              </option>
            ))}
          </select>
          {errors.sourceAccountId && (
            <p className="mt-1 text-xs text-red-600">{errors.sourceAccountId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mode</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('mode')}
          >
            <option value="INTERNAL">Internal (instant)</option>
            <option value="IMPS">IMPS (instant, up to ₹5L)</option>
            <option value="NEFT">NEFT (batched, ~1-2 min)</option>
            <option value="RTGS">RTGS (instant, min ₹2L)</option>
            <option value="UPI">UPI (instant)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Send to</label>
          <div className="mb-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                checked={destinationType === 'own'}
                onChange={() => setDestinationType('own')}
              />
              My own account
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                checked={destinationType === 'beneficiary'}
                onChange={() => setDestinationType('beneficiary')}
              />
              Saved beneficiary
            </label>
          </div>
          <input type="hidden" value={destinationType} {...register('destinationType')} />

          {destinationType === 'own' && (
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('destinationAccountId')}
            >
              <option value="">Select account…</option>
              {accounts?.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  #{a.accountId} · {a.accountType}
                </option>
              ))}
            </select>
          )}
          {destinationType === 'beneficiary' && (
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('beneficiaryId')}
            >
              <option value="">Select beneficiary…</option>
              {activeBeneficiaries.map((b) => (
                <option key={b.beneficiaryId} value={b.beneficiaryId} disabled={b.status !== 'ACTIVE'}>
                  {b.nickname} {b.status !== 'ACTIVE' ? '(activating…)' : ''}
                </option>
              ))}
            </select>
          )}
          {(errors.destinationAccountId || errors.beneficiaryId) && (
            <p className="mt-1 text-xs text-red-600">
              {errors.destinationAccountId?.message ?? errors.beneficiaryId?.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('amount')}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Remarks (optional)
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('remarks')}
          />
        </div>

        {initiateTransfer.isError && (
          <p className="text-sm text-red-600 sm:col-span-2">
            Transfer failed. Check the amount, mode limits, and beneficiary status.
          </p>
        )}
        {initiateTransfer.isSuccess && (
          <p className="text-sm text-green-600 sm:col-span-2">Transfer submitted.</p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={initiateTransfer.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {initiateTransfer.isPending ? 'Sending…' : 'Send Money'}
          </button>
        </div>
      </form>

      <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Transfers</h3>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading transfers…</p>}
      {transfers?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No transfers yet.</p>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Initiated</th>
            </tr>
          </thead>
          <tbody>
            {transfers
              ?.slice()
              .sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime())
              .map((t) => (
                <tr key={t.transferId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{t.counterpartyLabel ?? '—'}</td>
                  <td className="px-4 py-3">{t.mode}</td>
                  <td className="px-4 py-3">₹{t.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(t.initiatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
