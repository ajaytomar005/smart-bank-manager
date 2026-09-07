import { useMyAccounts, useMyDisputes, useMyLoans, useMyProfile } from '../../api/portalApi'

export function PortalOverviewPage() {
  const { data: profile } = useMyProfile()
  const { data: accounts, isLoading: accountsLoading } = useMyAccounts()
  const { data: loans, isLoading: loansLoading } = useMyLoans()
  const { data: disputes, isLoading: disputesLoading } = useMyDisputes()

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0
  const activeLoans = loans?.filter((l) => l.status === 'DISBURSED').length ?? 0
  const openDisputes = disputes?.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW').length ?? 0

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Welcome back{profile ? `, ${profile.name.split(' ')[0]}` : ''}
      </h2>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Here&apos;s a snapshot of your accounts with us.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Balance</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
            {accountsLoading ? '…' : `₹${totalBalance.toFixed(2)}`}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Accounts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
            {accountsLoading ? '…' : accounts?.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Loans</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
            {loansLoading ? '…' : activeLoans}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Open Disputes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">
            {disputesLoading ? '…' : openDisputes}
          </p>
        </div>
      </div>

      {profile?.kycStatus !== 'VERIFIED' && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
          Your KYC status is <strong>{profile?.kycStatus ?? '…'}</strong>. Some actions may be limited until
          verification is complete.
        </div>
      )}
    </div>
  )
}
