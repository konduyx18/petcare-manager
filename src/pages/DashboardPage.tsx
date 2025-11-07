import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { LogOut, User, Mail, Shield, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            🐾 Welcome to PetCare Manager!
          </h1>
          <p className="text-lg text-white/90">
            Your pet care dashboard is ready
          </p>
        </div>

        {/* User Info Card */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>You're successfully signed in!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Authentication:</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Magic Link
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Protected Route Confirmation */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Protected Route Working!
            </CardTitle>
            <CardDescription>
              This page is only accessible to authenticated users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Authentication verified:</strong> The ProtectedRoute component successfully 
                checked your authentication status and allowed access to this page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Features we're building for you</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Add and manage your pets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Track vaccination schedules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Set supply reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Store health records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Upload pet photos</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}
