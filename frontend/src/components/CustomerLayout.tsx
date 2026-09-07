import type { ReactNode } from 'react'
import { Layout, type NavItem } from './Layout'

const customerNavItems: NavItem[] = [
  { to: '/portal', label: 'Overview' },
  { to: '/portal/accounts', label: 'My Accounts' },
  { to: '/portal/account-requests', label: 'Open New Account' },
  { to: '/portal/transfer', label: 'Transfer Money' },
  { to: '/portal/beneficiaries', label: 'Beneficiaries' },
  { to: '/portal/loans', label: 'My Loans' },
  { to: '/portal/atms', label: 'ATMs Near Me' },
  { to: '/portal/disputes', label: 'Disputes' },
  { to: '/portal/profile', label: 'Profile' },
]

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <Layout navItems={customerNavItems} loginPath="/customer/login">
      {children}
    </Layout>
  )
}
