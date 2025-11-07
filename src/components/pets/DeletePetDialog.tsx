import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeletePet } from '@/hooks/usePets'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

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
  created_at: string
  updated_at: string
}

interface DeletePetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: Pet
}

export function DeletePetDialog({ open, onOpenChange, pet }: DeletePetDialogProps) {
  const deletePet = useDeletePet()

  const handleDelete = async () => {
    try {
      await deletePet.mutateAsync(pet.id)
      toast.success(`${pet.name} has been removed`, {
        description: 'All associated records have been deleted.'
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete pet', {
        description: 'Please try again in a moment.'
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Delete {pet.name}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-600">
            This action cannot be undone. All health records and supply schedules for{' '}
            <span className="font-semibold text-gray-900">{pet.name}</span> will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={deletePet.isPending}
          >
            {deletePet.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Pet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
