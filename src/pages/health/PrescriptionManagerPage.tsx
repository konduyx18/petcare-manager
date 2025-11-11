import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DosageSchedule } from '@/components/health/DosageSchedule'
import { AddHealthRecordDialog } from '@/components/health/AddHealthRecordDialog'
import { usePrescriptions } from '@/hooks/usePrescriptions'
import { usePets } from '@/hooks/usePets'
import { getRemainingDoses, parseFrequency } from '@/utils/prescription-utils'
import { Plus, Pill, Clock, Calendar, AlertCircle } from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import type { HealthRecord } from '@/hooks/useHealthRecords'

export default function PrescriptionManagerPage() {
  const { data: allPrescriptions, isLoading } = usePrescriptions()
  const { data: pets } = usePets()

  const [selectedPetId, setSelectedPetId] = useState<string>('all')
  const [selectedPrescription, setSelectedPrescription] = useState<HealthRecord | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Filter prescriptions by pet
  const filteredPrescriptions = useMemo(() => {
    if (selectedPetId === 'all') return allPrescriptions || []
    return allPrescriptions?.filter(p => p.pet_id === selectedPetId) || []
  }, [allPrescriptions, selectedPetId])

  // Group prescriptions by status
  const groupedPrescriptions = useMemo(() => {
    const active: HealthRecord[] = []
    const completed: HealthRecord[] = []
    const now = new Date().toISOString()

    filteredPrescriptions.forEach(p => {
      const details = p.prescription_details as any
      if (details?.end_date && details.end_date < now) {
        completed.push(p)
      } else {
        active.push(p)
      }
    })

    return { active, completed }
  }, [filteredPrescriptions])

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const selectedPet = pets?.find(p => p.id === selectedPetId)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            💊 Prescription Manager
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredPrescriptions.length} prescriptions tracked
            {selectedPetId !== 'all' && selectedPet && ` for ${selectedPet.name}`}
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Add Prescription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Prescriptions</p>
                <p className="text-3xl font-bold text-orange-600">
                  {groupedPrescriptions.active.length}
                </p>
              </div>
              <Pill className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doses Today</p>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateDosesToday(groupedPrescriptions.active)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {groupedPrescriptions.completed.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pet Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter by Pet</CardTitle>
            <Select value={selectedPetId} onValueChange={setSelectedPetId}>
              <SelectTrigger className="w-[200px] bg-white">
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
        </CardHeader>
      </Card>

      {/* Prescriptions List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Pill className="h-4 w-4" />
            Active ({groupedPrescriptions.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Calendar className="h-4 w-4" />
            Completed ({groupedPrescriptions.completed.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Prescriptions */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {groupedPrescriptions.active.length > 0 ? (
            groupedPrescriptions.active.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                isSelected={selectedPrescription?.id === prescription.id}
                onSelect={() => setSelectedPrescription(
                  selectedPrescription?.id === prescription.id ? null : prescription
                )}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Pill className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No active prescriptions
              </h3>
              <p className="text-gray-600 mb-4">
                Add a prescription to start tracking doses
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Prescription
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Completed Prescriptions */}
        <TabsContent value="completed" className="mt-6 space-y-4">
          {groupedPrescriptions.completed.length > 0 ? (
            groupedPrescriptions.completed.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                isSelected={false}
                onSelect={() => {}}
                isCompleted
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-600">No completed prescriptions</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Prescription Dialog */}
      {pets && pets.length > 0 && (
        <AddHealthRecordDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          petId={selectedPetId !== 'all' ? selectedPetId : pets[0].id}
          petName={selectedPetId !== 'all' && selectedPet ? selectedPet.name : pets[0].name}
        />
      )}
    </div>
  )
}

// Helper function to calculate doses today
function calculateDosesToday(prescriptions: HealthRecord[]): number {
  let count = 0

  prescriptions.forEach(p => {
    const details = p.prescription_details as any
    if (!details?.frequency) return

    const parsed = parseFrequency(details.frequency)
    if (!parsed) return

    // Rough estimate: times per day
    count += parsed.times_per_day
  })

  return Math.round(count)
}

// Prescription Card Component
function PrescriptionCard({
  prescription,
  isSelected,
  onSelect,
  isCompleted = false
}: {
  prescription: HealthRecord
  isSelected: boolean
  onSelect: () => void
  isCompleted?: boolean
}) {
  const details = prescription.prescription_details as any
  
  // FIX: Handle both single object and array format from Supabase
  // @ts-ignore - pets can be array or object from Supabase join
  const pet = Array.isArray(prescription.pets) 
    ? prescription.pets[0] 
    : prescription.pets

  console.log('PrescriptionCard rendering')
  console.log('prescription:', prescription)
  // @ts-ignore
  console.log('prescription.pets:', prescription.pets)
  console.log('resolved pet:', pet)
  console.log('pet name:', pet?.name)

  const remaining = details?.end_date
    ? getRemainingDoses(details.start_date, details.end_date, details.frequency)
    : null

  const isEndingSoon = details?.end_date && 
    !isPast(parseISO(details.end_date)) &&
    remaining !== null && remaining <= 5

  return (
    <Card className={`${isSelected ? 'ring-2 ring-orange-500' : ''} ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {pet?.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                🐾
              </div>
            )}
            <div>
              <CardTitle className="text-xl">
                {pet?.name ? (
                  <>
                    <span className="text-gray-600">{pet.name}</span>
                    {' - '}
                    <span className="text-gray-900">{prescription.title}</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600">Unknown Pet</span>
                    {' - '}
                    <span className="text-gray-900">{prescription.title}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {details?.medication_name || 'No medication name'}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {details?.dosage || 'No dosage'}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {details?.frequency || 'No frequency'}
                </Badge>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                )}
                {isEndingSoon && !isCompleted && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {remaining} doses left
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {!isCompleted && (
            <Button
              variant={isSelected ? "default" : "outline"}
              onClick={onSelect}
            >
              {isSelected ? 'Hide Schedule' : 'View Schedule'}
            </Button>
          )}
        </div>
      </CardHeader>

      {details && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Start Date</p>
              <p className="font-medium">
                {format(parseISO(details.start_date), 'MMM dd, yyyy')}
              </p>
            </div>
            {details.end_date && (
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="font-medium">
                  {format(parseISO(details.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {remaining !== null && (
              <div>
                <p className="text-gray-600">Remaining Doses</p>
                <p className="font-medium">{remaining}</p>
              </div>
            )}
            {prescription.veterinarian && (
              <div>
                <p className="text-gray-600">Prescribed By</p>
                <p className="font-medium">{prescription.veterinarian}</p>
              </div>
            )}
          </div>

          {prescription.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{prescription.notes}</p>
            </div>
          )}
        </CardContent>
      )}

      {/* Dosage Schedule */}
      {isSelected && !isCompleted && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <DosageSchedule prescription={prescription} />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
