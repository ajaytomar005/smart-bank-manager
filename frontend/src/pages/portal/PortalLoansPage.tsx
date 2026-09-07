import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useApplyForMyLoan, useMyLoanEmis, useMyLoans } from '../../api/portalApi'
import type { LoanStatus } from '../../types/loan'

const loanSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  interestRate: z.coerce.number().min(0, 'Cannot be negative'),
  creditScore: z.coerce.number().min(300).max(900).optional(),
  termMonths: z.coerce.number().min(1).max(360),
})

type LoanFormInput = z.input<typeof loanSchema>
type LoanFormValues = z.output<typeof loanSchema>

const statusColors: Record<LoanStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  DISBURSED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export function PortalLoansPage() {
  const { data: loans, isLoading } = useMyLoans()
  const applyForLoan = useApplyForMyLoan()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { data: emis } = useMyLoanEmis(expandedId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormInput, unknown, LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: { termMonths: 12 },
  })

  function onSubmit(values: LoanFormValues) {
    applyForLoan.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">My Loans</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'Apply for a Loan'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
        >
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
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('interestRate')}
            />
            {errors.interestRate && (
              <p className="mt-1 text-xs text-red-600">{errors.interestRate.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Your Credit Score (optional)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('creditScore')}
            />
            {errors.creditScore && (
              <p className="mt-1 text-xs text-red-600">{errors.creditScore.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Term (months)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              {...register('termMonths')}
            />
            {errors.termMonths && (
              <p className="mt-1 text-xs text-red-600">{errors.termMonths.message}</p>
            )}
          </div>

          {applyForLoan.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">Could not submit your application.</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={applyForLoan.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {applyForLoan.isPending ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading loans…</p>}
      {loans?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">You have no loans yet.</p>
      )}

      <div className="space-y-4">
        {loans?.map((loan) => (
          <Fragment key={loan.loanId}>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loan #{loan.loanId} · {loan.termMonths} months · {loan.interestRate}%
                  </p>
                  <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    ₹{loan.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[loan.status]}`}>
                    {loan.status}
                  </span>
                  {(loan.status === 'DISBURSED' || loan.status === 'APPROVED') && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === loan.loanId ? null : loan.loanId)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {expandedId === loan.loanId ? 'Hide EMIs' : 'View EMIs'}
                    </button>
                  )}
                </div>
              </div>

              {expandedId === loan.loanId && (
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-4">
                  {emis?.map((emi) => (
                    <div
                      key={emi.emiId}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800"
                    >
                      <p className="font-medium text-slate-700 dark:text-slate-300">{emi.dueDate}</p>
                      <p className="text-slate-500 dark:text-slate-400">
                        ₹{emi.amount.toFixed(2)} · {emi.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
