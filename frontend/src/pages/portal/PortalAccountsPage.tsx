import { useState } from 'react'
import { useMyAccounts, useMyAccountTransactions } from '../../api/portalApi'

export function PortalAccountsPage() {
  const { data: accounts, isLoading } = useMyAccounts()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { data: transactions, isLoading: txnsLoading } = useMyAccountTransactions(expandedId)

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">My Accounts</h2>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading accounts…</p>}
      {accounts?.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You don&apos;t have any accounts yet. Visit a branch to open one.
        </p>
      )}

      <div className="space-y-4">
        {accounts?.map((account) => (
          <div
            key={account.accountId}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {account.accountType} · #{account.accountId}
                </p>
                <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                  ₹{account.balance.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
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
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === account.accountId ? null : account.accountId)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {expandedId === account.accountId ? 'Hide history' : 'View history'}
                </button>
              </div>
            </div>

            {expandedId === account.accountId && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                {txnsLoading && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading transactions…</p>
                )}
                {transactions?.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet.</p>
                )}
                <table className="w-full text-left text-sm">
                  <tbody>
                    {transactions
                      ?.slice()
                      .sort((a, b) => new Date(b.txnTime).getTime() - new Date(a.txnTime).getTime())
                      .map((txn) => (
                        <tr key={txn.txnId} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">
                            {new Date(txn.txnTime).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4">{txn.type}</td>
                          <td className="py-2 text-right font-medium">₹{txn.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
