import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ConfirmPage from '@/pages/auth/ConfirmPage'
import DashboardPage from '@/pages/DashboardPage'
import PetsPage from '@/pages/PetsPage'
import HealthPage from '@/pages/HealthPage'
import SuppliesPage from '@/pages/SuppliesPage'
import ShopPage from '@/pages/ShopPage'

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
        <PetsPage />
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
        <HealthPage />
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

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  confirmRoute,
  dashboardRoute,
  petsRoute,
  healthRoute,
  suppliesRoute,
  shopRoute,
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
