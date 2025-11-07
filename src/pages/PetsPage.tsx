import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PawPrint, Plus } from 'lucide-react'

export default function PetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-600 mt-1">Manage your furry friends</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-green-600" />
            Your Pets
          </CardTitle>
          <CardDescription>
            Add and manage information about your pets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-4 max-w-sm">
              Start by adding your first pet to keep track of their health, supplies, and more.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Pet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
