import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/router'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          
          {/* Toast notifications */}
          <Toaster position="top-right" richColors />
          
          {/* React Query DevTools - only visible in development */}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
