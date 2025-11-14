import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useVets, type Vet } from '@/hooks/useVets'
import { VetCard } from '@/components/health/VetCard'
import { AddVetDialog } from '@/components/health/AddVetDialog'
import { EditVetDialog } from '@/components/health/EditVetDialog'
import { DeleteVetDialog } from '@/components/health/DeleteVetDialog'
import { Plus, Search, Stethoscope, Star, Building2 } from 'lucide-react'

export default function VetDirectoryPage() {
  const { data: vets, isLoading } = useVets()
  
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter vets by search query
  const filteredVets = useMemo(() => {
    if (!vets) return []
    if (!searchQuery.trim()) return vets

    const query = searchQuery.toLowerCase()
    return vets.filter(vet => 
      vet.clinic_name.toLowerCase().includes(query) ||
      (vet.vet_name && vet.vet_name.toLowerCase().includes(query)) ||
      (vet.address && vet.address.toLowerCase().includes(query))
    )
  }, [vets, searchQuery])

  // Get primary vet
  const primaryVet = useMemo(() => {
    const primary = vets?.find(v => v.is_primary)
    console.log('All vets:', vets)
    console.log('Primary vet:', primary)
    return primary
  }, [vets])

  // Separate primary and other vets
  const { primary, others } = useMemo(() => {
    const primary: Vet[] = []
    const others: Vet[] = []

    filteredVets.forEach(vet => {
      if (vet.is_primary) {
        primary.push(vet)
      } else {
        others.push(vet)
      }
    })

    return { primary, others }
  }, [filteredVets])

  const handleEdit = (vet: Vet) => {
    setSelectedVet(vet)
    setEditDialogOpen(true)
  }

  const handleDelete = (vet: Vet) => {
    setSelectedVet(vet)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Vet Directory
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your veterinary contacts and clinics
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Add Vet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vets</p>
                <p className="text-3xl font-bold text-blue-600">
                  {vets?.length || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Primary Vet</p>
                <p className="text-xl font-bold text-orange-600">
                  {primaryVet ? primaryVet.clinic_name : 'Not set'}
                </p>
                {primaryVet && primaryVet.vet_name && (
                  <p className="text-sm text-gray-500 mt-1">
                    {primaryVet.vet_name}
                  </p>
                )}
              </div>
              <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {vets && vets.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by clinic name, vet name, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Vets Grid */}
      {vets && vets.length > 0 ? (
        <div className="space-y-6">
          {/* Primary Vet Section */}
          {primary.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                Primary Veterinarian
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {primary.map(vet => (
                  <VetCard
                    key={vet.id}
                    vet={vet}
                    onEdit={() => handleEdit(vet)}
                    onDelete={() => handleDelete(vet)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Vets Section */}
          {others.length > 0 && (
            <div>
              {primary.length > 0 && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Other Veterinarians
                </h2>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {others.map(vet => (
                  <VetCard
                    key={vet.id}
                    vet={vet}
                    onEdit={() => handleEdit(vet)}
                    onDelete={() => handleDelete(vet)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredVets.length === 0 && searchQuery && (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No vets found matching "{searchQuery}"
              </p>
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            </Card>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No vets saved yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first vet to keep all your veterinary contacts in one place.
          </p>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Your First Vet
          </Button>
        </Card>
      )}

      {/* Dialogs */}
      <AddVetDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditVetDialog
        vet={selectedVet}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteVetDialog
        vet={selectedVet}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
