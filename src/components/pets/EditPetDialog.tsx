import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PetForm } from './PetForm'
import { useUpdatePet } from '@/hooks/usePets'
import { toast } from 'sonner'
import { PawPrint, Sparkles } from 'lucide-react'
import { uploadPetPhoto, deletePetPhotos } from '@/utils/upload-image'
import type { PetFormData } from '@/lib/validations/pet.schema'

interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
  breed: string | null
  date_of_birth: string | null
  weight_lbs: number | null
  microchip_number: string | null
  photo_url: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

interface EditPetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: Pet
}

export function EditPetDialog({ open, onOpenChange, pet }: EditPetDialogProps) {
  const updatePet = useUpdatePet()

  const handleSubmit = async (data: PetFormData, photo: File | null) => {
    try {
      // If new photo provided, upload it
      let photoUrl = pet.photo_url
      let thumbnailUrl = pet.thumbnail_url
      if (photo) {
        // Delete old photos first
        if (pet.photo_url) {
          await deletePetPhotos(pet.photo_url, pet.thumbnail_url || undefined)
        }
        
        // Upload new photos
        const uploadResult = await uploadPetPhoto(photo, pet.user_id, pet.id)
        photoUrl = uploadResult.full
        thumbnailUrl = uploadResult.thumbnail
      }

      await updatePet.mutateAsync({
        id: pet.id,
        updates: { ...data, photo_url: photoUrl, thumbnail_url: thumbnailUrl }
      })

      toast.success('🎉 Pet updated successfully!', {
        description: `${data.name}'s information has been updated!`
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Oops! Something went wrong', {
        description: 'Please try again in a moment.'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-blue-200 shadow-2xl"
        onInteractOutside={(e) => {
          e.preventDefault() // Prevent closing when clicking outside
        }}
      >
        <DialogHeader className="space-y-3 pb-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Edit {pet.name}
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1">
                Update your pet's information 📝
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="pt-4">
          <PetForm
            initialData={{
              id: pet.id,
              name: pet.name,
              species: pet.species,
              breed: pet.breed || '',
              date_of_birth: pet.date_of_birth || '',
              weight_lbs: pet.weight_lbs ?? null,
              microchip_number: pet.microchip_number || '',
              photo_url: pet.photo_url || undefined,
            }}
            onSubmit={handleSubmit}
            isLoading={updatePet.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
