import { PawPrint, HeartPulse, Package, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Activity {
  id: string
  type: 'pet' | 'health' | 'supply'
  title: string
  timestamp: string
  icon: React.ElementType
  iconColor: string
}

// Mock data for MVP - will be replaced with real data later
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'pet',
    title: 'Added pet: Max',
    timestamp: '2 hours ago',
    icon: PawPrint,
    iconColor: 'text-green-600 bg-green-50',
  },
  {
    id: '2',
    type: 'health',
    title: 'Logged vaccination for Bella',
    timestamp: '1 day ago',
    icon: HeartPulse,
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    id: '3',
    type: 'supply',
    title: 'Added supply schedule for dog food',
    timestamp: '2 days ago',
    icon: Package,
    iconColor: 'text-purple-600 bg-purple-50',
  },
  {
    id: '4',
    type: 'health',
    title: 'Scheduled checkup for Charlie',
    timestamp: '3 days ago',
    icon: Clock,
    iconColor: 'text-orange-600 bg-orange-50',
  },
  {
    id: '5',
    type: 'pet',
    title: 'Added pet: Luna',
    timestamp: '5 days ago',
    icon: PawPrint,
    iconColor: 'text-green-600 bg-green-50',
  },
]

function ActivitySkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

export function RecentActivity() {
  const isLoading = false // Will be connected to real data later

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest pet care actions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : mockActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Start by adding a pet!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
            
            {/* Activity items */}
            <div className="space-y-6">
              {mockActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Icon with background */}
                    <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${activity.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
