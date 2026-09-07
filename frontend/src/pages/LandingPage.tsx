import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="px-6 py-6 sm:px-10">
        <Logo size="md" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="animate-fade-in-up mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            One bank. Every branch, in your pocket.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Choose how you'd like to sign in.
          </p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            to="/customer/login"
            className="animate-fade-in-up animate-delay-1 group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl transition-transform group-hover:scale-110 dark:bg-blue-950">
              🏦
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">I&apos;m a Customer</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              View accounts, transfer money, apply for loans, find ATMs, and manage your banking.
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-slate-800 transition-transform group-hover:translate-x-1 dark:text-slate-100">
              Sign in as a customer →
            </span>
          </Link>

          <Link
            to="/login"
            className="animate-fade-in-up animate-delay-2 group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-2xl transition-transform group-hover:scale-110 dark:bg-slate-800">
              💼
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">I&apos;m Bank Staff</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manager, Loan Officer, Teller, Compliance, or Admin — access the branch dashboard.
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-slate-800 transition-transform group-hover:translate-x-1 dark:text-slate-100">
              Sign in as staff →
            </span>
          </Link>
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Smart Bank Manager — a unified digital control center for your branch.
      </footer>
    </div>
  )
}
