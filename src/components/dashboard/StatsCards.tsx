import { PawPrint, Bell, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  gradient: string
  isLoading?: boolean
}

function StatCard({ title, value, icon: Icon, gradient, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const { data: stats, isLoading, isError } = useDashboardStats()

  if (isError) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">Failed to load dashboard stats. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Pets',
      value: stats?.totalPets || 0,
      icon: PawPrint,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Upcoming Reminders',
      value: stats?.upcomingReminders || 0,
      icon: Bell,
      gradient: stats?.upcomingReminders && stats.upcomingReminders > 0
        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
        : 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Active Supplies',
      value: stats?.activeSupplies || 0,
      icon: ShoppingCart,
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          gradient={card.gradient}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
