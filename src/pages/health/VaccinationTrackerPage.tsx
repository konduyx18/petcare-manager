import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VaccinationCalendar } from '@/components/health/VaccinationCalendar'
import { QuickAddVaccineDialog } from '@/components/health/QuickAddVaccineDialog'
import { EditHealthRecordDialog } from '@/components/health/EditHealthRecordDialog'
import { DeleteHealthRecordDialog } from '@/components/health/DeleteHealthRecordDialog'
import { useAllHealthRecords } from '@/hooks/useHealthRecords'
import { usePets } from '@/hooks/usePets'
import { getVaccinationStatus } from '@/utils/vaccination-utils'
import { Plus, Calendar as CalendarIcon, List, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import type { HealthRecord } from '@/hooks/useHealthRecords'

export default function VaccinationTrackerPage() {
  const { data: allRecords, isLoading } = useAllHealthRecords()
  const { data: pets } = usePets()

  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  // Filter only vaccinations
  const vaccinations = useMemo(() => {
    return allRecords?.filter(r => r.record_type === 'vaccination') || []
  }, [allRecords])

  // Group by status
  const groupedVaccinations = useMemo(() => {
    const overdue: HealthRecord[] = []
    const dueSoon: HealthRecord[] = []
    const upcoming: HealthRecord[] = []
    const current: HealthRecord[] = []

    vaccinations.forEach(v => {
      const status = getVaccinationStatus(v.next_due_date)
      if (status.status === 'overdue') overdue.push(v)
      else if (status.status === 'due-soon') dueSoon.push(v)
      else if (status.status === 'upcoming') upcoming.push(v)
      else current.push(v)
    })

    return { overdue, dueSoon, upcoming, current }
  }, [vaccinations])

  // Group by pet
  const vaccinationsByPet = useMemo(() => {
    const grouped = new Map<string, HealthRecord[]>()

    vaccinations.forEach(v => {
      const petId = v.pet_id
      if (!grouped.has(petId)) {
        grouped.set(petId, [])
      }
      grouped.get(petId)!.push(v)
    })

    return grouped
  }, [vaccinations])

  const handleEdit = (record: HealthRecord) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDelete = (recordId: string) => {
    const record = vaccinations.find(r => r.id === recordId)
    if (record) {
      setSelectedRecord(record)
      setDeleteDialogOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
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
            💉 Vaccination Tracker
          </h1>
          <p className="text-gray-600 mt-1">
            {vaccinations.length} vaccinations tracked
          </p>
        </div>
        <Button
          onClick={() => setQuickAddOpen(true)}
          className="gap-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Quick Add Vaccine
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">
                  {groupedVaccinations.overdue.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-3xl font-bold text-orange-600">
                  {groupedVaccinations.dueSoon.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">
                  {groupedVaccinations.upcoming.length}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-3xl font-bold text-green-600">
                  {groupedVaccinations.current.length}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-6 space-y-6">
          {/* Overdue Section */}
          {groupedVaccinations.overdue.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Vaccinations ({groupedVaccinations.overdue.length})
                </CardTitle>
                <CardDescription>These vaccines are past their due date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedVaccinations.overdue.map(v => (
                  <VaccinationRow
                    key={v.id}
                    vaccination={v}
                    onEdit={() => handleEdit(v)}
                    onDelete={() => handleDelete(v.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Due Soon Section */}
          {groupedVaccinations.dueSoon.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Due Soon ({groupedVaccinations.dueSoon.length})
                </CardTitle>
                <CardDescription>Due within 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedVaccinations.dueSoon.map(v => (
                  <VaccinationRow
                    key={v.id}
                    vaccination={v}
                    onEdit={() => handleEdit(v)}
                    onDelete={() => handleDelete(v.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* By Pet Section */}
          <Card>
            <CardHeader>
              <CardTitle>Vaccinations by Pet</CardTitle>
              <CardDescription>All vaccinations organized by pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from(vaccinationsByPet.entries()).map(([petId, petVaccinations]) => {
                const pet = pets?.find(p => p.id === petId)
                if (!pet) return null

                return (
                  <div key={petId} className="space-y-3">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                          🐾
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{pet.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{pet.species}</p>
                      </div>
                    </div>
                    {petVaccinations.map(v => (
                      <VaccinationRow
                        key={v.id}
                        vaccination={v}
                        onEdit={() => handleEdit(v)}
                        onDelete={() => handleDelete(v.id)}
                        showPetName={false}
                      />
                    ))}
                  </div>
                )
              })}

              {vaccinationsByPet.size === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No vaccinations tracked yet</p>
                  <Button onClick={() => setQuickAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Vaccination
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <VaccinationCalendar
            vaccinations={vaccinations}
            onSelectEvent={(v) => handleEdit(v)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <QuickAddVaccineDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      />

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

// Helper component for vaccination rows
function VaccinationRow({
  vaccination,
  onEdit,
  onDelete,
  showPetName = true
}: {
  vaccination: HealthRecord
  onEdit: () => void
  onDelete: () => void
  showPetName?: boolean
}) {
  const status = getVaccinationStatus(vaccination.next_due_date)

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">
            {showPetName && vaccination.pet && (
              <span className="text-gray-600">{vaccination.pet.name} - </span>
            )}
            {vaccination.title}
          </h4>
          <Badge
            variant="secondary"
            className={`
              ${status.color === 'red' ? 'bg-red-100 text-red-700' : ''}
              ${status.color === 'orange' ? 'bg-orange-100 text-orange-700' : ''}
              ${status.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
              ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
            `}
          >
            {status.message}
          </Badge>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Last: {format(new Date(vaccination.date_administered), 'MMM dd, yyyy')}
          {vaccination.next_due_date && (
            <>
              {' • '}
              Next: {format(new Date(vaccination.next_due_date), 'MMM dd, yyyy')}
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
