import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HealthTimeline } from '@/components/health/HealthTimeline'
import { AddHealthRecordDialog } from '@/components/health/AddHealthRecordDialog'
import { EditHealthRecordDialog } from '@/components/health/EditHealthRecordDialog'
import { DeleteHealthRecordDialog } from '@/components/health/DeleteHealthRecordDialog'
import { useAllHealthRecords } from '@/hooks/useHealthRecords'
import { usePets } from '@/hooks/usePets'
import { Plus, Search, Filter, Syringe, Pill, Stethoscope } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { HealthRecord } from '@/hooks/useHealthRecords'

export default function HealthHubPage() {
  const { data: records, isLoading } = useAllHealthRecords()
  const { data: pets } = usePets()
  const navigate = useNavigate()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filter records
  const filteredRecords = useMemo(() => {
    if (!records) return []

    return records.filter((record) => {
      // Filter by pet
      if (selectedPetId !== 'all' && record.pet_id !== selectedPetId) {
        return false
      }

      // Filter by type
      if (selectedType !== 'all' && record.record_type !== selectedType) {
        return false
      }

      // Search in title, notes, veterinarian
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = record.title.toLowerCase().includes(query)
        const matchesNotes = record.notes?.toLowerCase().includes(query)
        const matchesVet = record.veterinarian?.toLowerCase().includes(query)
        
        if (!matchesTitle && !matchesNotes && !matchesVet) {
          return false
        }
      }

      return true
    })
  }, [records, selectedPetId, selectedType, searchQuery])

  const handleEdit = (record: HealthRecord) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDelete = (recordId: string) => {
    const record = records?.find(r => r.id === recordId)
    if (record) {
      setSelectedRecord(record)
      setDeleteDialogOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const recordCount = filteredRecords.length
  const selectedPet = pets?.find(p => p.id === selectedPetId)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Hub</h1>
          <p className="text-gray-600 mt-1">
            {recordCount} {recordCount === 1 ? 'record' : 'records'}
            {selectedPetId !== 'all' && selectedPet && ` for ${selectedPet.name}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => navigate({ to: '/health/vaccinations' })}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Syringe className="h-5 w-5" />
            Vaccinations
          </Button>
          <Button
            onClick={() => navigate({ to: '/health/prescriptions' })}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Pill className="h-5 w-5" />
            Prescriptions
          </Button>
          <Button
            onClick={() => navigate({ to: '/health/vets' })}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Stethoscope className="h-5 w-5" />
            Vet Directory
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter and search health records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pet Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Pet
              </label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Pets" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Pets</SelectItem>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Record Type
              </label>
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="vaccination" className="text-xs">💉</TabsTrigger>
                  <TabsTrigger value="vet_visit" className="text-xs">🏥</TabsTrigger>
                  <TabsTrigger value="prescription" className="text-xs">💊</TabsTrigger>
                  <TabsTrigger value="procedure" className="text-xs">🩺</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value || '')}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filteredRecords.length > 0 ? (
        <HealthTimeline
          records={filteredRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No records found
          </h3>
          <p className="text-gray-600 mb-4">
            {records && records.length > 0
              ? 'Try adjusting your filters or search query'
              : 'Get started by adding your first health record!'}
          </p>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Health Record
          </Button>
        </Card>
      )}

      {/* Dialogs */}
      {pets && pets.length > 0 && (
        <AddHealthRecordDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          petId={selectedPetId !== 'all' ? selectedPetId : pets[0].id}
          petName={selectedPetId !== 'all' && selectedPet ? selectedPet.name : pets[0].name}
        />
      )}

      {selectedRecord && (
        <>
          <EditHealthRecordDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            record={selectedRecord}
            petName={selectedRecord.pet?.name || 'Unknown Pet'}
          />

          <DeleteHealthRecordDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            recordId={selectedRecord.id}
            recordTitle={selectedRecord.title}
          />
        </>
      )}
    </div>
  )
}
