import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useCustomerLogin, useCustomerRegister } from '../api/authApi'
import { Logo } from '../components/Logo'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export function CustomerLoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const login = useCustomerLogin()
  const register_ = useCustomerRegister()

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  function onLogin(values: LoginFormValues) {
    login.mutate(values, { onSuccess: () => navigate('/portal') })
  }

  function onRegister(values: RegisterFormValues) {
    register_.mutate(values, { onSuccess: () => navigate('/portal') })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 dark:from-slate-950 dark:to-slate-900">
      <Link to="/" className="animate-fade-in mb-8">
        <Logo size="lg" />
      </Link>

      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            New Customer
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <h1 className="mb-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Welcome back</h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Sign in to view accounts, loans, and more
            </p>

            <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {login.isError && <p className="text-sm text-red-600">Invalid email or password.</p>}

              <button
                type="submit"
                disabled={login.isPending}
                className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-slate-800 dark:text-slate-100">
              Create your account
            </h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Register now — you can apply to open a bank account once you&apos;re signed in.
            </p>

            <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="reg-email"
                >
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  autoComplete="tel"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...registerForm.register('phone')}
                />
                {registerForm.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="reg-password"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none dark:border-slate-700"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              {register_.isError && (
                <p className="text-sm text-red-600">
                  Could not create your account. That email may already be registered.
                </p>
              )}

              <button
                type="submit"
                disabled={register_.isPending}
                className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                {register_.isPending ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Bank staff?{' '}
          <Link to="/login" className="font-medium text-slate-800 hover:underline dark:text-slate-100">
            Sign in here
          </Link>
        </p>
      </div>

      <Link
        to="/"
        className="mt-6 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        ← Back
      </Link>
    </div>
  )
}
