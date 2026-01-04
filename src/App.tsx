import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/router'
import CookieConsent from 'react-cookie-consent'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          
          {/* Toast notifications */}
          <Toaster position="top-right" richColors />
          
          {/* React Query DevTools - only visible on desktop to avoid overlap with mobile bottom nav */}
          <div className="hidden lg:block">
            <ReactQueryDevtools initialIsOpen={false} />
          </div>

          {/* Cookie Consent Banner */}
          <CookieConsent
            location="bottom"
            buttonText="Accept"
            declineButtonText="Decline"
            enableDeclineButton
            cookieName="petcare-cookie-consent"
            style={{ 
              background: '#2B373B', 
              padding: '20px', 
              alignItems: 'center' 
            }}
            buttonStyle={{ 
              background: '#10b981', 
              color: '#fff', 
              fontSize: '14px', 
              fontWeight: '500', 
              borderRadius: '6px', 
              padding: '10px 20px' 
            }}
            declineButtonStyle={{ 
              background: '#ef4444', 
              color: '#fff', 
              fontSize: '14px', 
              fontWeight: '500', 
              borderRadius: '6px', 
              padding: '10px 20px' 
            }}
            expires={365}
          >
            We use cookies for analytics and to enhance your experience. By continuing to use PetCare Manager, you accept our{' '}
            <a href="/legal/privacy" className="underline hover:text-green-300">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/legal/terms" className="underline hover:text-green-300">
              Terms of Service
            </a>.
          </CookieConsent>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
