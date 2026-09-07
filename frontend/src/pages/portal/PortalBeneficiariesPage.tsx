import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAddBeneficiary, useMyBeneficiaries, useRemoveBeneficiary } from '../../api/transferApi'
import type { BeneficiaryStatus } from '../../types/transfer'

const beneficiarySchema = z.object({
  nickname: z.string().min(1, 'Nickname is required'),
  beneficiaryType: z.enum(['INTERNAL_ACCOUNT', 'EXTERNAL_BANK', 'UPI']),
  internalAccountId: z.coerce.number().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
})

type BeneficiaryFormInput = z.input<typeof beneficiarySchema>
type BeneficiaryFormValues = z.output<typeof beneficiarySchema>

const statusColors: Record<BeneficiaryStatus, string> = {
  PENDING_ACTIVATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  REMOVED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export function PortalBeneficiariesPage() {
  const { data: beneficiaries, isLoading } = useMyBeneficiaries()
  const addBeneficiary = useAddBeneficiary()
  const removeBeneficiary = useRemoveBeneficiary()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormInput, unknown, BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: { beneficiaryType: 'UPI' },
  })

  const selectedType = watch('beneficiaryType')

  function onSubmit(values: BeneficiaryFormValues) {
    addBeneficiary.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Beneficiaries</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'Add Beneficiary'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nickname</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('nickname')}
            />
            {errors.nickname && <p className="mt-1 text-xs text-red-600">{errors.nickname.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('beneficiaryType')}
            >
              <option value="UPI">UPI</option>
              <option value="INTERNAL_ACCOUNT">This bank (account number)</option>
              <option value="EXTERNAL_BANK">Other bank (IMPS/NEFT/RTGS)</option>
            </select>
          </div>

          {selectedType === 'UPI' && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">UPI ID</label>
              <input
                placeholder="name@bank"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                {...register('upiId')}
              />
            </div>
          )}

          {selectedType === 'INTERNAL_ACCOUNT' && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Account ID
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                {...register('internalAccountId')}
              />
            </div>
          )}

          {selectedType === 'EXTERNAL_BANK' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Account Number
                </label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                  {...register('accountNumber')}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  IFSC Code
                </label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                  {...register('ifscCode')}
                />
              </div>
            </>
          )}

          {addBeneficiary.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">Could not add this beneficiary.</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={addBeneficiary.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {addBeneficiary.isPending ? 'Adding…' : 'Add Beneficiary'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading beneficiaries…</p>}
      {beneficiaries?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No beneficiaries yet.</p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Nickname</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries?.map((b) => (
              <tr key={b.beneficiaryId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{b.nickname}</td>
                <td className="px-4 py-3">{b.beneficiaryType.replace('_', ' ')}</td>
                <td className="px-4 py-3">{b.upiId ?? b.accountNumber ?? `Account #${b.internalAccountId}`}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[b.status]}`}>
                    {b.status === 'PENDING_ACTIVATION' ? 'Activating…' : b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => removeBeneficiary.mutate(b.beneficiaryId)}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
