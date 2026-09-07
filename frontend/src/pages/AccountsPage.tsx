import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAccounts, useFreezeAccount, useOpenAccount, useUnfreezeAccount } from '../api/accountApi'
import { useCustomers } from '../api/customerApi'
import { useAuthStore } from '../lib/authStore'

const accountSchema = z.object({
  customerId: z.coerce.number().min(1, 'Select a customer'),
  accountType: z.enum(['SAVINGS', 'CURRENT']),
  initialDeposit: z.coerce.number().min(0, 'Cannot be negative').optional(),
})

type AccountFormInput = z.input<typeof accountSchema>
type AccountFormValues = z.output<typeof accountSchema>

export function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts()
  const { data: customers } = useCustomers()
  const openAccount = useOpenAccount()
  const freezeAccount = useFreezeAccount()
  const unfreezeAccount = useUnfreezeAccount()
  const role = useAuthStore((s) => s.role)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormInput, unknown, AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { accountType: 'SAVINGS' },
  })

  function onSubmit(values: AccountFormValues) {
    openAccount.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  function customerLabel(customerId: number) {
    const customer = customers?.find((c) => c.customerId === customerId)
    return customer ? `${customer.name} (#${customer.customerId})` : `#${customerId}`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Accounts</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'Open Account'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Customer</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('customerId')}
            >
              <option value="">Select customer…</option>
              {customers?.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.name} (#{c.customerId})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{errors.customerId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Account Type</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('accountType')}
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Initial Deposit
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('initialDeposit')}
            />
            {errors.initialDeposit && (
              <p className="mt-1 text-xs text-red-600">{errors.initialDeposit.message}</p>
            )}
          </div>

          {openAccount.isError && (
            <p className="text-sm text-red-600 sm:col-span-3">Could not open account.</p>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={openAccount.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {openAccount.isPending ? 'Opening…' : 'Open Account'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              {role === 'MANAGER' && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  Loading accounts…
                </td>
              </tr>
            )}
            {accounts?.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  No accounts yet.
                </td>
              </tr>
            )}
            {accounts?.map((account) => (
              <tr key={account.accountId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">#{account.accountId}</td>
                <td className="px-4 py-3">{customerLabel(account.customerId)}</td>
                <td className="px-4 py-3">{account.accountType}</td>
                <td className="px-4 py-3">₹{account.balance.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      account.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : account.status === 'FROZEN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {account.status}
                  </span>
                </td>
                {role === 'MANAGER' && (
                  <td className="px-4 py-3">
                    {account.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => freezeAccount.mutate(account.accountId)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Freeze
                      </button>
                    )}
                    {account.status === 'FROZEN' && (
                      <button
                        type="button"
                        onClick={() => unfreezeAccount.mutate(account.accountId)}
                        className="rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Unfreeze
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
