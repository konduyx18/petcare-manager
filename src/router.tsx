import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ConfirmPage from '@/pages/auth/ConfirmPage'
import DashboardPage from '@/pages/DashboardPage'
import PetsListPage from '@/pages/pets/PetsListPage'
import PetDetailPage from '@/pages/pets/PetDetailPage'
import HealthHubPage from '@/pages/health/HealthHubPage'
import VaccinationTrackerPage from '@/pages/health/VaccinationTrackerPage'
import PrescriptionManagerPage from '@/pages/health/PrescriptionManagerPage'
import VetDirectoryPage from '@/pages/health/VetDirectoryPage'
import SuppliesPage from '@/pages/SuppliesPage'
import ShopPage from '@/pages/ShopPage'
import SettingsPage from '@/pages/SettingsPage'
import NotificationPreferencesPage from '@/pages/settings/NotificationPreferencesPage'

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
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

const confirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/confirm',
  component: ConfirmPage,
})

// Protected routes with AppLayout
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const petsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pets',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <PetsListPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const petDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pets/$petId',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <PetDetailPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <HealthHubPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const vaccinationTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/vaccinations',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <VaccinationTrackerPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const prescriptionManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/prescriptions',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <PrescriptionManagerPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const vetDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health/vets',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <VetDirectoryPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const suppliesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/supplies',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SuppliesPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <ShopPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    </ProtectedRoute>
  ),
})

const notificationPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/notifications',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <NotificationPreferencesPage />
      </AppLayout>
    </ProtectedRoute>
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
