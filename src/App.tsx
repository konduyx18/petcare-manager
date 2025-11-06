import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-green-600 mb-2">
                  🐾 PetCare Manager
                </h1>
                <p className="text-gray-600 mb-6">
                  Setup Complete! Authentication ready.
                </p>
                
                <div className="space-y-3">
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105">
                    Let's Get Started! 🚀
                  </button>
                  
                  <div className="flex gap-2 justify-center flex-wrap">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      React ✓
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      TypeScript ✓
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Tailwind ✓
                    </span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                      React Query ✓
                    </span>
                    <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Auth ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* React Query DevTools - only visible in development */}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
