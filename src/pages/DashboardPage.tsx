import { useAuth } from '@/hooks/useAuth'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default function DashboardPage() {
  const { user } = useAuth()

  // Extract first name from email or use full email
  const displayName = user?.email?.split('@')[0] || 'there'
  const firstName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your pets today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <StatsCards />
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <RecentActivity />
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
