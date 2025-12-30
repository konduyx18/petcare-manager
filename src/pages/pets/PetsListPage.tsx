import { useState } from 'react'
import { Plus, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePets } from '@/hooks/usePets'
import { PetCard } from '@/components/pets/PetCard'
import { AddPetDialog } from '@/components/pets/AddPetDialog'

export default function PetsListPage() {
  const { data: pets, isLoading } = usePets()
  const [addPetOpen, setAddPetOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PawPrint className="h-8 w-8 text-green-500" />
            My Pets
            {pets && pets.length > 0 && (
              <span className="text-2xl text-gray-500">({pets.length})</span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your furry (and feathered) friends
          </p>
        </div>
        <Button
          onClick={() => setAddPetOpen(true)}
          className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Pet
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <LoadingSpinner fullPage text="Loading your pets..." />
      )}

      {/* Empty State */}
      {!isLoading && pets && pets.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="No pets yet! 🐾"
          description="Add your first pet to get started with tracking their health, supplies, and more!"
          action={{
            label: "Add Your First Pet",
            onClick: () => setAddPetOpen(true)
          }}
        />
      )}

      {/* Pets Grid */}
      {!isLoading && pets && pets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}

      {/* Add Pet Dialog */}
      <AddPetDialog open={addPetOpen} onOpenChange={setAddPetOpen} />
    </div>
  )
}
