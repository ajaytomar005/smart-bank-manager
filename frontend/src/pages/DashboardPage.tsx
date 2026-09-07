import { useDashboardSummary } from '../api/dashboardApi'

const cards = [
  { key: 'totalCustomers', label: 'Total Customers' },
  { key: 'totalAccounts', label: 'Total Accounts' },
  { key: 'frozenAccounts', label: 'Frozen Accounts' },
  { key: 'pendingKycReviews', label: 'Pending KYC Reviews' },
  { key: 'pendingLoanApprovals', label: 'Pending Loan Approvals' },
  { key: 'openFraudAlerts', label: 'Open Fraud Alerts' },
] as const

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary()

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Branch Dashboard</h2>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading summary…</p>}
      {isError && <p className="text-sm text-red-600">Failed to load dashboard summary.</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">{data[card.key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
