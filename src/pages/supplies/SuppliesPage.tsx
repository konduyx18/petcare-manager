import { useState } from 'react'
import { Package, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePets } from '@/hooks/usePets'
import { useSupplySchedules } from '@/hooks/useSupplySchedules'
import SupplyCard from '@/components/supplies/SupplyCard'
import SupplyForm from '@/components/supplies/SupplyForm'

export default function SuppliesPage() {
  const [selectedPetId, setSelectedPetId] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: pets } = usePets()
  const { data: supplies, isLoading, error, refetch } = useSupplySchedules(
    selectedPetId === 'all' ? undefined : selectedPetId
  )

  // Filter by category
  const filteredSupplies = supplies?.filter(supply => {
    if (selectedCategory === 'all') return true
    return supply.category === selectedCategory
  }) || []

  // Calculate stats
  const totalSupplies = filteredSupplies.length
  const dueSoon = filteredSupplies.filter(s => 
    s.reminderStatus === 'urgent' || s.reminderStatus === 'soon'
  ).length
  const overdue = filteredSupplies.filter(s => s.reminderStatus === 'overdue').length

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supply Tracker</h1>
            <p className="text-muted-foreground mt-1">Never run out of pet essentials</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supply
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Supplies</p>
                <p className="text-2xl font-bold text-foreground">{totalSupplies}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">{dueSoon}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Pet Filter */}
        <div className="flex-1">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pets</SelectItem>
              {pets?.map(pet => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Medication">Medication</SelectItem>
              <SelectItem value="Treats">Treats</SelectItem>
              <SelectItem value="Grooming">Grooming</SelectItem>
              <SelectItem value="Toys">Toys</SelectItem>
              <SelectItem value="Supplements">Supplements</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Failed to load supplies</h3>
              <p className="text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredSupplies.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {supplies && supplies.length > 0 
                  ? 'No supplies match your filters' 
                  : 'Start tracking your pet supplies'}
              </h3>
              <p className="text-muted-foreground mt-1">
                {supplies && supplies.length > 0
                  ? 'Try adjusting your filters to see more supplies'
                  : 'Add your first supply to get reminders when it\'s time to reorder'}
              </p>
            </div>
            {(!supplies || supplies.length === 0) && (
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Supply
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Supply Cards Grid */}
      {!isLoading && !error && filteredSupplies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredSupplies.map(supply => (
            <div 
              key={supply.id}
              className="animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${filteredSupplies.indexOf(supply) * 50}ms` }}
            >
              <SupplyCard supply={supply} />
            </div>
          ))}
        </div>
      )}

      {/* Add Supply Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Supply</DialogTitle>
          </DialogHeader>
          <SupplyForm 
            onSuccess={() => setShowAddDialog(false)}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
