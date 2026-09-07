import { useAuditLogs } from '../api/auditApi'
import { useAuthStore } from '../lib/authStore'

export function AuditLogPage() {
  const role = useAuthStore((s) => s.role)
  const canView = role === 'COMPLIANCE_OFFICER' || role === 'MANAGER' || role === 'ADMIN'
  const { data: logs, isLoading, isError } = useAuditLogs(canView)

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Audit Log</h2>

      {(!canView || isError) && (
        <p className="text-sm text-red-600">
          You do not have permission to view the audit log.
        </p>
      )}

      {canView && !isError && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={4}>
                    Loading audit log…
                  </td>
                </tr>
              )}
              {logs?.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={4}>
                    No activity recorded yet.
                  </td>
                </tr>
              )}
              {logs?.map((log) => (
                <tr key={log.logId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{log.employeeName}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="px-4 py-3">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
