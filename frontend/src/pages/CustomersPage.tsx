import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateCustomer, useCustomers } from '../api/customerApi'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  segment: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

export function CustomersPage() {
  const { data: customers, isLoading } = useCustomers()
  const createCustomer = useCreateCustomer()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) })

  function onSubmit(values: CustomerFormValues) {
    createCustomer.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Customers</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {showForm ? 'Cancel' : 'New Customer'}
        </button>
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Segment (optional)
            </label>
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              {...register('segment')}
            />
          </div>

          {createCustomer.isError && (
            <p className="text-sm text-red-600 sm:col-span-2">
              Could not create customer. Check the details and try again.
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createCustomer.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50"
            >
              {createCustomer.isPending ? 'Creating…' : 'Create Customer'}
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
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">KYC Status</th>
              <th className="px-4 py-3">Segment</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                  Loading customers…
                </td>
              </tr>
            )}
            {customers?.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                  No customers yet.
                </td>
              </tr>
            )}
            {customers?.map((customer) => (
              <tr key={customer.customerId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      customer.kycStatus === 'VERIFIED'
                        ? 'bg-green-100 text-green-700'
                        : customer.kycStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {customer.kycStatus}
                  </span>
                </td>
                <td className="px-4 py-3">{customer.segment ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
