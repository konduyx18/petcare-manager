import { useState } from 'react'
import { Plus, HeartPulse, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddPetDialog } from '@/components/pets/AddPetDialog'
import { toast } from 'sonner'

export function QuickActions() {
  const [addPetOpen, setAddPetOpen] = useState(false)

  const handleAddPet = () => {
    setAddPetOpen(true)
  }

  const handleLogHealth = () => {
    toast.info('Health logging feature coming soon!')
  }

  const handleTrackSupply = () => {
    toast.info('Supply tracking feature coming soon!')
  }

  const actions = [
    {
      title: 'Add New Pet',
      description: 'Register a new pet to your care',
      icon: Plus,
      onClick: handleAddPet,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Log Health Record',
      description: 'Track vaccinations and checkups',
      icon: HeartPulse,
      onClick: handleLogHealth,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Track Supply',
      description: 'Monitor food and supplies',
      icon: Package,
      onClick: handleTrackSupply,
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  onClick={action.onClick}
                  variant="outline"
                  className="h-auto flex-col items-start gap-3 p-4 hover:shadow-md transition-all"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-gray-500 font-normal">{action.description}</p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <AddPetDialog open={addPetOpen} onOpenChange={setAddPetOpen} />
    </>
  )
}
