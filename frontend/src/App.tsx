import { Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './components/CustomerLayout'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AccountRequestsPage } from './pages/AccountRequestsPage'
import { AccountsPage } from './pages/AccountsPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { CustomerLoginPage } from './pages/CustomerLoginPage'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { DisputesPage } from './pages/DisputesPage'
import { FraudAlertsPage } from './pages/FraudAlertsPage'
import { LandingPage } from './pages/LandingPage'
import { LoansPage } from './pages/LoansPage'
import { LoginPage } from './pages/LoginPage'
import { ATMsNearMePage } from './pages/portal/ATMsNearMePage'
import { PortalAccountRequestsPage } from './pages/portal/PortalAccountRequestsPage'
import { PortalAccountsPage } from './pages/portal/PortalAccountsPage'
import { PortalBeneficiariesPage } from './pages/portal/PortalBeneficiariesPage'
import { PortalDisputesPage } from './pages/portal/PortalDisputesPage'
import { PortalLoansPage } from './pages/portal/PortalLoansPage'
import { PortalOverviewPage } from './pages/portal/PortalOverviewPage'
import { PortalProfilePage } from './pages/portal/PortalProfilePage'
import { PortalTransferPage } from './pages/portal/PortalTransferPage'
import { ReportsPage } from './pages/ReportsPage'
import { StaffPage } from './pages/StaffPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { useAuthStore } from './lib/authStore'

function CatchAll() {
  const role = useAuthStore((s) => s.role)
  return <Navigate to={role === 'CUSTOMER' ? '/portal' : role ? '/dashboard' : '/'} replace />
}

function HomeRoute() {
  const { accessToken, role } = useAuthStore()
  if (!accessToken) return <LandingPage />
  return <Navigate to={role === 'CUSTOMER' ? '/portal' : '/dashboard'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/customer/login" element={<CustomerLoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <CustomersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <AccountsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account-requests"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <AccountRequestsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <LoansPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <TransactionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fraud-alerts"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <FraudAlertsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <DisputesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <AuditLogPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <StaffPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute audience="staff">
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/portal"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalOverviewPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/accounts"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalAccountsPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/account-requests"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalAccountRequestsPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/transfer"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalTransferPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/beneficiaries"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalBeneficiariesPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/loans"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalLoansPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/atms"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <ATMsNearMePage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/disputes"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalDisputesPage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/profile"
        element={
          <ProtectedRoute audience="customer">
            <CustomerLayout>
              <PortalProfilePage />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<CatchAll />} />
    </Routes>
  )
}

export default App
