import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAccounts } from '../api/accountApi'
import { useCreateTransaction, useTransactions } from '../api/transactionApi'

const transactionSchema = z.object({
  accountId: z.coerce.number().min(1, 'Select an account'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
})

type TransactionFormInput = z.input<typeof transactionSchema>
type TransactionFormValues = z.output<typeof transactionSchema>

export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions()
  const { data: accounts } = useAccounts()
  const createTransaction = useCreateTransaction()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'DEPOSIT' },
  })

  function onSubmit(values: TransactionFormValues) {
    createTransaction.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Transactions</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'New Transaction'}
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
                  #{a.accountId} · {a.accountType} · ₹{a.balance.toFixed(2)}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('type')}
            >
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('amount')}
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          {createTransaction.isError && (
            <p className="text-sm text-red-600 sm:col-span-3">
              Could not process this transaction. Check the account status and balance.
            </p>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={createTransaction.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {createTransaction.isPending ? 'Processing…' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Txn</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  Loading transactions…
                </td>
              </tr>
            )}
            {transactions?.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={6}>
                  No transactions yet.
                </td>
              </tr>
            )}
            {transactions
              ?.slice()
              .sort((a, b) => new Date(b.txnTime).getTime() - new Date(a.txnTime).getTime())
              .map((txn) => (
                <tr key={txn.txnId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">#{txn.txnId}</td>
                  <td className="px-4 py-3">#{txn.accountId}</td>
                  <td className="px-4 py-3">{txn.type}</td>
                  <td className="px-4 py-3">₹{txn.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(txn.txnTime).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
