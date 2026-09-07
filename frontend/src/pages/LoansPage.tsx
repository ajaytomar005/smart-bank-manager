import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useApplyForLoan, useDecideLoan, useLoanEmis, useLoans } from '../api/loanApi'
import { useCustomers } from '../api/customerApi'
import { useAuthStore } from '../lib/authStore'
import type { ApprovalDecision, LoanStatus } from '../types/loan'

const loanSchema = z.object({
  customerId: z.coerce.number().min(1, 'Select a customer'),
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

export function LoansPage() {
  const { data: loans, isLoading } = useLoans()
  const { data: customers } = useCustomers()
  const applyForLoan = useApplyForLoan()
  const decideLoan = useDecideLoan()
  const role = useAuthStore((s) => s.role)
  const [showForm, setShowForm] = useState(false)
  const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null)
  const [decisionLoanId, setDecisionLoanId] = useState<number | null>(null)
  const [decisionReason, setDecisionReason] = useState('')

  const canDecide = role === 'LOAN_OFFICER' || role === 'MANAGER'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormInput, unknown, LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: { termMonths: 12 },
  })

  const { data: emis } = useLoanEmis(expandedLoanId)

  function onSubmit(values: LoanFormValues) {
    applyForLoan.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  function submitDecision(decision: ApprovalDecision) {
    if (decisionLoanId === null) return
    decideLoan.mutate(
      { loanId: decisionLoanId, request: { decision, reason: decisionReason || undefined } },
      {
        onSuccess: () => {
          setDecisionLoanId(null)
          setDecisionReason('')
        },
      },
    )
  }

  function customerLabel(customerId: number) {
    const customer = customers?.find((c) => c.customerId === customerId)
    return customer ? `${customer.name} (#${customer.customerId})` : `#${customerId}`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Loans</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'New Loan Application'}
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('interestRate')}
            />
            {errors.interestRate && (
              <p className="mt-1 text-xs text-red-600">{errors.interestRate.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Credit Score (optional)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('creditScore')}
            />
            {errors.creditScore && (
              <p className="mt-1 text-xs text-red-600">{errors.creditScore.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Term (months)</label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('termMonths')}
            />
            {errors.termMonths && (
              <p className="mt-1 text-xs text-red-600">{errors.termMonths.message}</p>
            )}
          </div>

          {applyForLoan.isError && (
            <p className="text-sm text-red-600 sm:col-span-3">Could not submit loan application.</p>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={applyForLoan.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {applyForLoan.isPending ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Loan</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3">Credit Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={8}>
                  Loading loans…
                </td>
              </tr>
            )}
            {loans?.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={8}>
                  No loan applications yet.
                </td>
              </tr>
            )}
            {loans?.map((loan) => (
              <Fragment key={loan.loanId}>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">#{loan.loanId}</td>
                  <td className="px-4 py-3">{customerLabel(loan.customerId)}</td>
                  <td className="px-4 py-3">₹{loan.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">{loan.interestRate}%</td>
                  <td className="px-4 py-3">{loan.termMonths} mo</td>
                  <td className="px-4 py-3">{loan.creditScore ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[loan.status]}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    {(loan.status === 'DISBURSED' || loan.status === 'APPROVED') && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLoanId(expandedLoanId === loan.loanId ? null : loan.loanId)
                        }
                        className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      >
                        {expandedLoanId === loan.loanId ? 'Hide EMIs' : 'View EMIs'}
                      </button>
                    )}
                    {canDecide && (loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW') && (
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionLoanId(loan.loanId)
                          setDecisionReason('')
                        }}
                        className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>

                {decisionLoanId === loan.loanId && (
                  <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          value={decisionReason}
                          onChange={(e) => setDecisionReason(e.target.value)}
                          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => submitDecision('APPROVED')}
                          disabled={decideLoan.isPending}
                          className="rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => submitDecision('REJECTED')}
                          disabled={decideLoan.isPending}
                          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisionLoanId(null)}
                          className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                      {decideLoan.isError && (
                        <p className="mt-2 text-sm text-red-600">
                          Could not record the decision. You may not be authorized for this loan
                          amount.
                        </p>
                      )}
                    </td>
                  </tr>
                )}

                {expandedLoanId === loan.loanId && (
                  <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <td className="px-4 py-3" colSpan={8}>
                      <p className="mb-2 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                        EMI Schedule
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {emis?.map((emi) => (
                          <div
                            key={emi.emiId}
                            className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                          >
                            <p className="font-medium text-slate-700 dark:text-slate-300">{emi.dueDate}</p>
                            <p className="text-slate-500 dark:text-slate-400">
                              ₹{emi.amount.toFixed(2)} · {emi.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
