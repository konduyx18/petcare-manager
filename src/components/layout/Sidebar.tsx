import { Link, useRouterState } from '@tanstack/react-router'
import { Home, PawPrint, HeartPulse, ShoppingCart, Store, Settings } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/pets', label: 'My Pets', icon: PawPrint },
  { path: '/health', label: 'Health Hub', icon: HeartPulse },
  { path: '/supplies', label: 'Supplies', icon: ShoppingCart },
  { path: '/shop', label: 'Shop', icon: Store },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-green-600">PetCare</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/')
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
