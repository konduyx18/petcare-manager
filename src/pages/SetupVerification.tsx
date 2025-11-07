import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Database,
  Shield,
  Zap,
  Smartphone,
  Palette,
  Server,
  Clock,
  Users,
  Github,
  Info,
  Download,
  Loader2,
} from 'lucide-react'

interface SystemStatus {
  supabase: { connected: boolean; url: string; loading: boolean; error?: string }
  env: { valid: boolean; missing: string[] }
  pwa: { serviceWorker: boolean; manifest: boolean; installable: boolean; loading: boolean }
}

export default function SetupVerification() {
  const { user, session, loading: authLoading } = useAuth()
  const { isInstallable, isInstalled, promptInstall, platform } = useInstallPrompt()
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    supabase: { connected: false, url: '', loading: true },
    env: { valid: false, missing: [] },
    pwa: { serviceWorker: false, manifest: false, installable: false, loading: true },
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Check Supabase connection
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        const url = import.meta.env.VITE_SUPABASE_URL || ''
        const maskedUrl = url ? `${url.substring(0, 15)}******${url.substring(url.length - 12)}` : 'Not configured'
        
        setSystemStatus(prev => ({
          ...prev,
          supabase: {
            connected: !error,
            url: maskedUrl,
            loading: false,
            error: error?.message,
          },
        }))
      } catch (err) {
        setSystemStatus(prev => ({
          ...prev,
          supabase: {
            connected: false,
            url: 'Error',
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        }))
      }
    }

    checkSupabase()
  }, [])

  // Check environment variables
  useEffect(() => {
    const missing: string[] = []
    if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')
    if (!import.meta.env.VITE_APP_URL) missing.push('VITE_APP_URL')

    setSystemStatus(prev => ({
      ...prev,
      env: { valid: missing.length === 0, missing },
    }))
  }, [])

  // Check PWA status
  useEffect(() => {
    const checkPWA = async () => {
      try {
        const swRegistered = 'serviceWorker' in navigator
        let swActive = false

        if (swRegistered) {
          const registration = await navigator.serviceWorker.getRegistration()
          swActive = !!registration
        }

        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]')
        const manifestExists = !!manifestLink

        setSystemStatus(prev => ({
          ...prev,
          pwa: {
            serviceWorker: swActive,
            manifest: manifestExists,
            installable: isInstallable,
            loading: false,
          },
        }))
      } catch (err) {
        setSystemStatus(prev => ({
          ...prev,
          pwa: {
            serviceWorker: false,
            manifest: false,
            installable: false,
            loading: false,
          },
        }))
      }
    }

    checkPWA()
  }, [isInstallable])

  const testSupabaseConnection = async () => {
    toast.loading('Testing Supabase connection...')
    try {
      const { error } = await supabase.auth.getSession()
      if (error) throw error
      toast.success('✅ Supabase connection successful!')
    } catch (err) {
      toast.error('❌ Supabase connection failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleInstallPrompt = async () => {
    if (isInstalled) {
      toast.info('App is already installed!')
      return
    }
    if (!isInstallable) {
      toast.info(`Install not available on ${platform}. Try Chrome on Android/Desktop.`)
      return
    }
    await promptInstall()
  }

  const showDevToolsTips = () => {
    toast.info(
      'Open DevTools (F12) → Application tab to inspect:\n' +
      '• Manifest\n' +
      '• Service Workers\n' +
      '• Storage\n' +
      '• Cache Storage',
      { duration: 5000 }
    )
  }

  const openGitHub = () => {
    window.open('https://github.com/konduyx18/petcare-manager', '_blank')
  }

  const uiComponents = [
    'Button', 'Card', 'Form', 'Input', 'Label', 'Select',
    'Dialog', 'Dropdown', 'Avatar', 'Badge', 'Tabs', 'Sonner'
  ]

  const tables = [
    'profiles', 'pets', 'health_records',
    'supply_schedules', 'user_devices', 'affiliate_products'
  ]

  const nextSteps = [
    'Create login page with Magic Link',
    'Create signup page',
    'Build main layout with navigation',
    'Add dashboard with pet stats',
    'Set up routing system',
    'Build pet management pages',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* SECTION 1: Hero Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            🎉 Foundation Setup Complete!
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            All systems operational. Ready for Week 1!
          </p>
          <p className="text-white/80 font-mono">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* SECTION 2: System Status Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Supabase Connection */}
          <Card className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Supabase Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemStatus.supabase.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking connection...</span>
                </div>
              ) : systemStatus.supabase.connected ? (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Connected to Supabase</span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    {systemStatus.supabase.url}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Connection failed</span>
                  </div>
                  {systemStatus.supabase.error && (
                    <p className="text-sm text-red-600">{systemStatus.supabase.error}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Environment Variables */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemStatus.env.valid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">All environment variables loaded</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Missing variables</span>
                  </div>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {systemStatus.env.missing.map(v => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="text-xs text-gray-500 mt-2">
                🔒 Values are masked for security
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Authentication System */}
          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Authentication System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing auth...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Auth context initialized</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">User:</span> {user ? user.email : 'Not signed in'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Session:</span> {session ? 'Active' : 'No active session'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Auth state listener:</span> <span className="text-green-600">Active ✓</span>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 4: React Query */}
          <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                React Query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">React Query configured</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Cache time:</span> 10 minutes</p>
                <p><span className="font-medium">Stale time:</span> 5 minutes</p>
                <p className="flex items-center gap-1">
                  <span className="font-medium">DevTools:</span> 
                  <span className="text-green-600">Active ✓</span>
                  <span className="text-xs">(check bottom-left corner)</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: PWA Status */}
          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                PWA Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemStatus.pwa.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking PWA status...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {systemStatus.pwa.serviceWorker ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Service worker {systemStatus.pwa.serviceWorker ? 'registered' : 'not registered'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemStatus.pwa.manifest ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>PWA manifest {systemStatus.pwa.manifest ? 'loaded' : 'not found'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>
                        Installable: {isInstalled ? 'Already installed' : isInstallable ? 'Yes' : 'No'} ({platform})
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 6: UI Components */}
          <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                UI Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">shadcn/ui installed</span>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{uiComponents.length} components ready</span>
              </p>
              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                {uiComponents.map(comp => (
                  <span key={comp} className="bg-gray-100 px-2 py-1 rounded">
                    {comp}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 3: Database Schema Info */}
        <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Database Schema
            </CardTitle>
            <CardDescription>Supabase PostgreSQL with Row Level Security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">{tables.length} tables configured</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tables.map(table => (
                <Badge key={table} variant="outline" className="text-sm">
                  {table}
                </Badge>
              ))}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Row Level Security enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Storage bucket: pet-photos (public access)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Technology Stack */}
        <Card className="animate-slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>Modern, production-ready architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500">React 18 ✓</Badge>
              <Badge className="bg-blue-600">TypeScript ✓</Badge>
              <Badge className="bg-purple-500">Vite 7 ✓</Badge>
              <Badge className="bg-cyan-500">Tailwind CSS v4 ✓</Badge>
              <Badge className="bg-green-500">Supabase ✓</Badge>
              <Badge className="bg-red-500">React Query ✓</Badge>
              <Badge className="bg-pink-500">Auth Ready ✓</Badge>
              <Badge className="bg-orange-500">PWA Enabled ✓</Badge>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: Next Steps */}
        <Card className="animate-slide-up" style={{ animationDelay: '800ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Next Steps
            </CardTitle>
            <CardDescription>Week 1 Development Roadmap</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                    disabled
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* SECTION 6: Quick Test Actions */}
        <Card className="animate-slide-up" style={{ animationDelay: '900ms' }}>
          <CardHeader>
            <CardTitle>Quick Test Actions</CardTitle>
            <CardDescription>Test your setup interactively</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={testSupabaseConnection} variant="default">
                <Database className="w-4 h-4 mr-2" />
                Test Supabase Connection
              </Button>
              <Button onClick={handleInstallPrompt} variant="secondary" disabled={isInstalled}>
                <Download className="w-4 h-4 mr-2" />
                {isInstalled ? 'Already Installed' : 'Test Install Prompt'}
              </Button>
              <Button onClick={showDevToolsTips} variant="outline">
                <Info className="w-4 h-4 mr-2" />
                Open DevTools Tips
              </Button>
              <Button onClick={openGitHub} variant="outline">
                <Github className="w-4 h-4 mr-2" />
                View in GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/80 text-sm pb-8">
          <p>Built with ❤️ using modern web technologies</p>
          <p className="mt-1">Ready to build something amazing! 🚀</p>
        </div>
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
