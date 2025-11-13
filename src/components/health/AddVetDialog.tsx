import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VetForm, type VetFormData } from './VetForm'
import { useCreateVet } from '@/hooks/useVets'
import { toast } from 'sonner'

interface AddVetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddVetDialog({ open, onOpenChange }: AddVetDialogProps) {
  const createVet = useCreateVet()

  const handleSubmit = async (data: VetFormData) => {
    try {
      await createVet.mutateAsync(data)
      toast.success('Vet added successfully!', {
        description: `${data.clinic_name} has been added to your directory.`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating vet:', error)
      toast.error('Failed to add vet', {
        description: 'Please try again later.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Add New Veterinarian</DialogTitle>
          <DialogDescription>
            Add a veterinary clinic or doctor to your directory for quick access.
          </DialogDescription>
        </DialogHeader>

        <VetForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={createVet.isPending}
          submitLabel="Add Vet"
        />
      </DialogContent>
    </Dialog>
  )
}
