import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateHealthRecord } from '@/hooks/useHealthRecords'
import { usePets } from '@/hooks/usePets'
import { getVaccinesForSpecies, type CommonVaccine } from '@/data/common-vaccines'
import { calculateNextDueDate } from '@/utils/vaccination-utils'
import { toast } from 'sonner'
import { Loader2, Syringe } from 'lucide-react'

interface QuickAddVaccineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preSelectedPetId?: string
}

export function QuickAddVaccineDialog({ open, onOpenChange, preSelectedPetId }: QuickAddVaccineDialogProps) {
  const { data: pets } = usePets()
  const createRecord = useCreateHealthRecord()

  const [selectedPetId, setSelectedPetId] = useState<string>(preSelectedPetId || '')
  const [selectedVaccine, setSelectedVaccine] = useState<CommonVaccine | null>(null)
  const [dateAdministered, setDateAdministered] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [veterinarian, setVeterinarian] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [cost, setCost] = useState('')

  useEffect(() => {
    if (preSelectedPetId) {
      setSelectedPetId(preSelectedPetId)
    }
  }, [preSelectedPetId])

  const selectedPet = pets?.find(p => p.id === selectedPetId)
  const availableVaccines = selectedPet ? getVaccinesForSpecies(selectedPet.species) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPetId || !selectedVaccine || !dateAdministered) {
      toast.error('Please fill in all required fields')
      return
    }

    const nextDueDate = calculateNextDueDate(dateAdministered, selectedVaccine.frequency)

    try {
      await createRecord.mutateAsync({
        petId: selectedPetId,
        record_type: 'vaccination',
        title: selectedVaccine.name,
        date_administered: dateAdministered,
        next_due_date: nextDueDate,
        veterinarian: veterinarian || undefined,
        clinic_name: clinicName || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        notes: selectedVaccine.description,
      })

      toast.success('🎉 Vaccination added!', {
        description: `${selectedVaccine.name} for ${selectedPet?.name}. Next due: ${nextDueDate}`
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to add vaccination')
    }
  }

  const resetForm = () => {
    setSelectedPetId(preSelectedPetId || '')
    setSelectedVaccine(null)
    setDateAdministered(new Date().toISOString().split('T')[0])
    setVeterinarian('')
    setClinicName('')
    setCost('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md bg-white"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Quick Add Vaccine</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Add a common vaccine quickly
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Pet Selection */}
          <div>
            <Label>Pet *</Label>
            <Select value={selectedPetId} onValueChange={setSelectedPetId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select pet" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {pets?.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vaccine Selection */}
          {selectedPetId && (
            <div>
              <Label>Vaccine *</Label>
              <Select
                value={selectedVaccine?.name || ''}
                onValueChange={(name) => {
                  const vaccine = availableVaccines.find(v => v.name === name)
                  setSelectedVaccine(vaccine || null)
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select vaccine" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableVaccines.map((vaccine) => (
                    <SelectItem key={vaccine.name} value={vaccine.name}>
                      <div className="flex flex-col">
                        <span className="font-medium">{vaccine.name}</span>
                        <span className="text-xs text-gray-500">
                          {vaccine.category === 'core' ? '⭐ Core' : 'Non-core'} •
                          Every {vaccine.frequency} months
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVaccine && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedVaccine.description}
                </p>
              )}
            </div>
          )}

          {/* Date Administered */}
          <div>
            <Label>Date Administered *</Label>
            <Input
              type="date"
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Veterinarian</Label>
              <Input
                placeholder="Dr. Smith"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
              />
            </div>
            <div>
              <Label>Clinic</Label>
              <Input
                placeholder="Happy Paws"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Cost (USD)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          {/* Next Due Date Preview */}
          {selectedVaccine && dateAdministered && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                📅 Next due date will be: {calculateNextDueDate(dateAdministered, selectedVaccine.frequency)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on {selectedVaccine.frequency}-month frequency
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={!selectedPetId || !selectedVaccine || !dateAdministered || createRecord.isPending}
          >
            {createRecord.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : (
              '✅ Add Vaccination'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
