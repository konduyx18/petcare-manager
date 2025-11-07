import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate({ to: '/login' })
  }

  const handleSettings = () => {
    // TODO: Add /settings route to router
    toast.info('Settings page coming soon!')
  }

  // Get user's display name and initials
  const fullName = user?.user_metadata?.full_name || user?.email || 'User'
  const email = user?.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center h-9 w-9 rounded-full bg-green-600 text-white font-medium text-sm cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors">
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{fullName}</p>
            <p className="text-xs leading-none text-gray-500">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
