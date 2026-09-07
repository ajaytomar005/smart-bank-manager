import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { useThemeStore } from '../lib/themeStore'
import type { Role } from '../types/auth'
import { Logo } from './Logo'

export interface NavItem {
  to: string
  label: string
  roles?: Role[]
}

const staffNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Customers' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/account-requests', label: 'Account Requests', roles: ['TELLER', 'MANAGER', 'ADMIN'] },
  { to: '/loans', label: 'Loans' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/fraud-alerts', label: 'Fraud Alerts' },
  { to: '/disputes', label: 'Disputes', roles: ['COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN'] },
  { to: '/audit-log', label: 'Audit Log', roles: ['COMPLIANCE_OFFICER', 'MANAGER', 'ADMIN'] },
  { to: '/staff', label: 'Staff', roles: ['MANAGER', 'ADMIN'] },
  { to: '/reports', label: 'Reports', roles: ['MANAGER', 'ADMIN'] },
]

interface LayoutProps {
  children: ReactNode
  navItems?: NavItem[]
  loginPath?: string
}

export function Layout({ children, navItems = staffNavItems, loginPath = '/login' }: LayoutProps) {
  const { name, role, clearSession } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const visibleNavItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)))

  function handleLogout() {
    clearSession()
    navigate(loginPath)
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5 dark:border-slate-800">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 md:hidden"
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-56 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
        {sidebarContent}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 flex w-64 flex-col bg-white dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="text-slate-600 dark:text-slate-300"
          >
            ☰
          </button>
          <Logo size="sm" />
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
