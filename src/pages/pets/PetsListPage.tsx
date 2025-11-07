import { useState } from 'react'
import { Plus, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePets } from '@/hooks/usePets'
import { PetCard } from '@/components/pets/PetCard'
import { AddPetDialog } from '@/components/pets/AddPetDialog'

export default function PetsListPage() {
  const { data: pets, isLoading, error } = usePets()
  const [addPetOpen, setAddPetOpen] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <PawPrint className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600">
          Failed to load your pets. Please try again.
        </p>
      </div>
    )
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pets && pets.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-full">
              <PawPrint className="h-24 w-24 text-green-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            No pets yet! 🐾
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Add your first pet to get started with tracking their health, supplies, and more!
          </p>
          
          <Button
            onClick={() => setAddPetOpen(true)}
            size="lg"
            className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add Your First Pet!
          </Button>
        </div>
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
