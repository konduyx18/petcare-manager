import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PetForm } from './PetForm'
import { useCreatePet } from '@/hooks/usePets'
import { toast } from 'sonner'
import { PawPrint, Sparkles } from 'lucide-react'
import type { PetFormData } from '@/lib/validations/pet.schema'

interface AddPetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPetDialog({ open, onOpenChange }: AddPetDialogProps) {
  const createPet = useCreatePet()

  const handleSubmit = async (data: PetFormData, photo: File | null) => {
    try {
      await createPet.mutateAsync({ ...data, photo })
      toast.success('🎉 Pet added successfully!', {
        description: `${data.name} is now part of your family!`
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-green-200 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Add Your New Pet
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1">
                Let's get to know your furry (or feathered) friend! 🐾
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="pt-4">
          <PetForm
            onSubmit={handleSubmit}
            isLoading={createPet.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
