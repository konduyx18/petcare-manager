import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { UserMenu } from './UserMenu'
import { Button } from '@/components/ui/button'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { Download } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()

  const handleInstall = async () => {
    await promptInstall()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-green-600">PetCare</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Install PWA Button */}
            {isInstallable && !isInstalled && (
              <Button
                onClick={handleInstall}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </Button>
            )}

            {/* User Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="mb-16 lg:mb-0 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
