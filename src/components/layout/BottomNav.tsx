import { Link, useRouterState } from '@tanstack/react-router'
import { Home, PawPrint, HeartPulse, ShoppingCart, Store } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/pets', label: 'Pets', icon: PawPrint },
  { path: '/health', label: 'Health', icon: HeartPulse },
  { path: '/supplies', label: 'Supplies', icon: ShoppingCart },
  { path: '/shop', label: 'Shop', icon: Store },
]

export function BottomNav() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/')
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg
                transition-colors duration-200 flex-1 max-w-[80px]
                ${isActive ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              <span className="text-xs truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
