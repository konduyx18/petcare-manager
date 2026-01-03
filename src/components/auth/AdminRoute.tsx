import { Navigate } from '@tanstack/react-router'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: isAdmin, isLoading } = useIsAdmin()

  if (isLoading) {
    return <LoadingSpinner fullPage text="Checking permissions..." />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
