import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateEmployee, useEmployees, useRoles, useUpdateEmployeeStatus } from '../api/employeeApi'
import { useAuthStore } from '../lib/authStore'

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.coerce.number().min(1, 'Select a role'),
})

type EmployeeFormInput = z.input<typeof employeeSchema>
type EmployeeFormValues = z.output<typeof employeeSchema>

export function StaffPage() {
  const role = useAuthStore((s) => s.role)
  const canView = role === 'MANAGER' || role === 'ADMIN'
  const canManage = role === 'ADMIN'
  const { data: employees, isLoading } = useEmployees(canView)
  const { data: roles } = useRoles(canManage)
  const createEmployee = useCreateEmployee()
  const updateStatus = useUpdateEmployeeStatus()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormInput, unknown, EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  })

  function onSubmit(values: EmployeeFormValues) {
    createEmployee.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  if (!canView) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">Staff</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only Managers and Admins can view staff records.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Staff</h2>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {showForm ? 'Cancel' : 'New Employee'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Temporary Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('roleId')}
            >
              <option value="">Select role…</option>
              {roles?.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </option>
              ))}
            </select>
            {errors.roleId && <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p>}
          </div>

          {createEmployee.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">Could not create this employee.</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createEmployee.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {createEmployee.isPending ? 'Creating…' : 'Create Employee'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              {canManage && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                  Loading staff…
                </td>
              </tr>
            )}
            {employees?.map((employee) => (
              <tr key={employee.employeeId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.roleName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      employee.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({
                          employeeId: employee.employeeId,
                          status: employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                        })
                      }
                      className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      {employee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
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
