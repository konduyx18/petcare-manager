import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ConfirmPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for OAuth tokens in URL (access_token, refresh_token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        const access_token = hashParams.get('access_token') || queryParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token')
        
        console.log('OAuth callback check:', { 
          access_token: access_token ? 'present' : 'missing',
          refresh_token: refresh_token ? 'present' : 'missing',
          hash: window.location.hash,
          search: window.location.search
        })

        // If no OAuth tokens, redirect to login (user shouldn't be here)
        if (!access_token && !refresh_token) {
          console.log('No OAuth tokens found, redirecting to login')
          toast.info('Please sign in to continue')
          navigate({ to: '/login' })
          return
        }

        // Get the current session (OAuth tokens are automatically handled by Supabase)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          throw new Error('Failed to establish session')
        }

        if (!session) {
          throw new Error('No active session found')
        }

        console.log('OAuth session established:', session.user.email)
        setStatus('success')
        toast.success('Successfully signed in!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 2000)

      } catch (error: any) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error.message || 'Failed to complete sign in')
        toast.error(error.message)
      }
    }

    handleOAuthCallback()
  }, [navigate])

  const handleBackToLogin = () => {
    navigate({ to: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-pulse-slow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Completing sign in...</CardTitle>
            <CardDescription>
              Please wait a moment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-slide-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Success!</CardTitle>
            <CardDescription>
              You've been successfully signed in
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Redirecting to your dashboard...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Sign In Failed</CardTitle>
          <CardDescription>
            We couldn't complete your sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              {errorMessage}
            </p>
            <p className="text-xs text-red-700">
              The authentication session may have expired.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
            <p className="text-xs text-center text-gray-600">
              Try signing in again
            </p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
