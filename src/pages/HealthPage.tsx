import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse } from 'lucide-react'

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Hub</h1>
        <p className="text-gray-600 mt-1">Track vaccinations, vet visits, and health records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-green-600" />
            Health Records
          </CardTitle>
          <CardDescription>
            Coming soon: Track your pets' health information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HeartPulse className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Hub Coming Soon</h3>
            <p className="text-gray-600 max-w-sm">
              Track vaccinations, vet appointments, medications, and health records for all your pets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
