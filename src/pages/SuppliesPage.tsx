import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'

export default function SuppliesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplies</h1>
        <p className="text-gray-600 mt-1">Manage pet supplies and set reorder reminders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Supply Management
          </CardTitle>
          <CardDescription>
            Coming soon: Track supplies and get reorder notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplies Coming Soon</h3>
            <p className="text-gray-600 max-w-sm">
              Keep track of food, toys, medications, and other supplies. Get reminders when it's time to reorder.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
