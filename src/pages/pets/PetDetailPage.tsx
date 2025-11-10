import { useParams, useNavigate } from '@tanstack/react-router'
import { usePetDetail } from '@/hooks/usePetDetail'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EditPetDialog } from '@/components/pets/EditPetDialog'
import { DeletePetDialog } from '@/components/pets/DeletePetDialog'
import { PetOverview } from '@/components/pets/PetOverview'
import { AddHealthRecordDialog } from '@/components/health/AddHealthRecordDialog'
import { EditHealthRecordDialog } from '@/components/health/EditHealthRecordDialog'
import { DeleteHealthRecordDialog } from '@/components/health/DeleteHealthRecordDialog'
import { HealthTimeline } from '@/components/health/HealthTimeline'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { ArrowLeft, Edit, Trash2, Calendar, Heart, Package, Plus } from 'lucide-react'
import { calculateAge, getSpeciesBadgeColor, getSpeciesEmoji } from '@/utils/pet-utils'
import type { HealthRecord } from '@/hooks/useHealthRecords'

export default function PetDetailPage() {
  const { petId } = useParams({ from: '/pets/$petId' })
  const navigate = useNavigate()
  const { data, isLoading, error } = usePetDetail(petId)
  const { data: healthRecords } = useHealthRecords(petId)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addHealthRecordOpen, setAddHealthRecordOpen] = useState(false)
  const [editHealthRecordOpen, setEditHealthRecordOpen] = useState(false)
  const [deleteHealthRecordOpen, setDeleteHealthRecordOpen] = useState(false)
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<HealthRecord | null>(null)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-lg text-gray-600">Pet not found</p>
        <Button onClick={() => navigate({ to: '/pets' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pets
        </Button>
      </div>
    )
  }

  const { pet, stats } = data

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/pets' })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pets
      </Button>

      {/* Pet Header */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 md:p-8 border-2 border-green-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl shadow-lg border-4 border-white">
                {getSpeciesEmoji(pet.species)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {pet.name}
                  </h1>
                  <Badge className={`bg-gradient-to-r ${getSpeciesBadgeColor(pet.species)} text-white px-3 py-1 text-sm`}>
                    {getSpeciesEmoji(pet.species)} {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {pet.breed && (
                <div>
                  <span className="font-medium">Breed:</span> {pet.breed}
                </div>
              )}
              {pet.date_of_birth && (
                <div>
                  <span className="font-medium">Age:</span> {calculateAge(pet.date_of_birth)}
                </div>
              )}
              {pet.weight_lbs && (
                <div>
                  <span className="font-medium">Weight:</span> {pet.weight_lbs} lbs
                </div>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-green-200 bg-white/80">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-gray-600">Health Records</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.healthRecordsCount}</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-white/80">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-gray-600">Upcoming</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingRemindersCount}</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-white/80">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-gray-600">Supplies</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSuppliesCount}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PetOverview pet={pet} />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Health Records</CardTitle>
                <CardDescription>
                  Complete medical history for {pet.name}
                </CardDescription>
              </div>
              <Button onClick={() => setAddHealthRecordOpen(true)} className="gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600">
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </CardHeader>
          </Card>

          {healthRecords && healthRecords.length > 0 ? (
            <div className="mt-6">
              <HealthTimeline
                records={healthRecords}
                onEdit={(record) => {
                  setSelectedHealthRecord(record)
                  setEditHealthRecordOpen(true)
                }}
                onDelete={(recordId) => {
                  const record = healthRecords.find(r => r.id === recordId)
                  if (record) {
                    setSelectedHealthRecord(record)
                    setDeleteHealthRecordOpen(true)
                  }
                }}
              />
            </div>
          ) : (
            <Card className="mt-6 p-12 text-center">
              <p className="text-gray-600 mb-4">No health records yet for {pet.name}</p>
              <Button onClick={() => setAddHealthRecordOpen(true)} className="gap-2">
                <Plus className="mr-2 h-4 w-4" />
                Add First Record
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Schedules</CardTitle>
              <CardDescription>Coming soon - Never run out of pet supplies</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Coming soon - Complete history of your pet's care</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditPetDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />
      <DeletePetDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open && !data) {
            // If pet was deleted, navigate back to pets list
            navigate({ to: '/pets' })
          }
        }}
        pet={pet}
      />
      <AddHealthRecordDialog
        open={addHealthRecordOpen}
        onOpenChange={setAddHealthRecordOpen}
        petId={petId}
        petName={pet.name}
      />
      {selectedHealthRecord && (
        <>
          <EditHealthRecordDialog
            open={editHealthRecordOpen}
            onOpenChange={setEditHealthRecordOpen}
            record={selectedHealthRecord}
            petName={pet.name}
          />
          <DeleteHealthRecordDialog
            open={deleteHealthRecordOpen}
            onOpenChange={setDeleteHealthRecordOpen}
            recordId={selectedHealthRecord.id}
            recordTitle={selectedHealthRecord.title}
          />
        </>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
