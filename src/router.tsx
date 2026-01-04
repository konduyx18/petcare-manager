import { lazy, Suspense } from 'react'
import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback'

// Lazy load all pages for code splitting
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))
const ConfirmPage = lazy(() => import('@/pages/auth/ConfirmPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const PetsListPage = lazy(() => import('@/pages/pets/PetsListPage'))
const PetDetailPage = lazy(() => import('@/pages/pets/PetDetailPage'))
const HealthHubPage = lazy(() => import('@/pages/health/HealthHubPage'))
const VaccinationTrackerPage = lazy(() => import('@/pages/health/VaccinationTrackerPage'))
const PrescriptionManagerPage = lazy(() => import('@/pages/health/PrescriptionManagerPage'))
const VetDirectoryPage = lazy(() => import('@/pages/health/VetDirectoryPage'))
const SuppliesPage = lazy(() => import('@/pages/supplies/SuppliesPage'))
const ShopPage = lazy(() => import('@/pages/shop/ShopPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotificationPreferencesPage = lazy(() => import('@/pages/settings/NotificationPreferencesPage'))
const DataExportPage = lazy(() => import('@/pages/settings/DataExportPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AffiliateProductsManager = lazy(() => import('@/pages/admin/AffiliateProductsManager'))
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('@/pages/legal/TermsOfServicePage'))

// Root route
const rootRoute = createRootRoute()

// Index route - redirect to login
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})

// Auth routes (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LoginPage />
    </Suspense>
  ),
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <SignupPage />
    </Suspense>
  ),
})

const confirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/confirm',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ConfirmPage />
    </Suspense>
  ),
})

// Protected routes with AppLayout
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const petsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pets',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <PetsListPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const petDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pets/$petId',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <PetDetailPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <HealthHubPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const vaccinationTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/vaccinations',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <VaccinationTrackerPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const prescriptionManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/prescriptions',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <PrescriptionManagerPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const vetDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/vets',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <VetDirectoryPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const suppliesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/supplies',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <SuppliesPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <ShopPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <SettingsPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const notificationPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/notifications',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <NotificationPreferencesPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const dataExportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/export',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AppLayout>
          <DataExportPage />
        </AppLayout>
      </ProtectedRoute>
    </Suspense>
  ),
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AdminRoute>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </AdminRoute>
      </ProtectedRoute>
    </Suspense>
  ),
})

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/products',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AdminRoute>
          <AppLayout>
            <AffiliateProductsManager />
          </AppLayout>
        </AdminRoute>
      </ProtectedRoute>
    </Suspense>
  ),
})

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/privacy',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <AppLayout>
        <PrivacyPolicyPage />
      </AppLayout>
    </Suspense>
  ),
})

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/terms',
  component: () => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <AppLayout>
        <TermsOfServicePage />
      </AppLayout>
    </Suspense>
  ),
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  confirmRoute,
  dashboardRoute,
  petsRoute,
  petDetailRoute,
  healthRoute,
  vaccinationTrackerRoute,
  prescriptionManagerRoute,
  vetDirectoryRoute,
  suppliesRoute,
  shopRoute,
  settingsRoute,
  notificationPreferencesRoute,
  dataExportRoute,
  adminDashboardRoute,
  adminProductsRoute,
  privacyPolicyRoute,
  termsOfServiceRoute,
])

// Create router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
