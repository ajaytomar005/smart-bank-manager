import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMyProfile, useUpdateMyProfile } from '../../api/portalApi'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  segment: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const kycColors: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function PortalProfilePage() {
  const { data: profile, isLoading } = useMyProfile()
  const updateProfile = useUpdateMyProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, phone: profile.phone, segment: profile.segment ?? '' })
    }
  }, [profile, reset])

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values)
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile…</p>
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">My Profile</h2>

      {profile && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">KYC status:</span>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${kycColors[profile.kycStatus]}`}>
            {profile.kycStatus}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-lg grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            disabled
            value={profile?.email ?? ''}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('phone')}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Segment (optional)
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            {...register('segment')}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Updating your profile will reset your KYC status to Pending until it&apos;s re-verified.
        </p>

        {updateProfile.isError && (
          <p className="text-sm text-red-600">Could not update your profile.</p>
        )}
        {updateProfile.isSuccess && (
          <p className="text-sm text-green-600">Profile updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
