import { useExportReport, type ReportType } from '../api/reportApi'
import { useAuthStore } from '../lib/authStore'

const reports: { type: ReportType; label: string; description: string }[] = [
  { type: 'CUSTOMERS', label: 'Customers', description: 'All customer profiles and KYC status' },
  { type: 'ACCOUNTS', label: 'Accounts', description: 'All accounts, balances, and status' },
  { type: 'LOANS', label: 'Loans', description: 'All loan applications and their outcomes' },
  { type: 'TRANSACTIONS', label: 'Transactions', description: 'All deposits and withdrawals' },
]

export function ReportsPage() {
  const role = useAuthStore((s) => s.role)
  const canExport = role === 'MANAGER' || role === 'ADMIN'
  const exportReport = useExportReport()

  if (!canExport) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only Managers and Admins can export reports.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Reports &amp; Analytics</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <div
            key={report.type}
            className="flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{report.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{report.description}</p>
            </div>
            <button
              type="button"
              onClick={() => exportReport.mutate(report.type)}
              disabled={exportReport.isPending}
              className="mt-4 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              Export Excel
            </button>
          </div>
        ))}
      </div>
      {exportReport.isError && (
        <p className="mt-4 text-sm text-red-600">Could not export the report. Please try again.</p>
      )}
    </div>
  )
}
