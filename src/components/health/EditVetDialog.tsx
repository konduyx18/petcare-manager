import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VetForm, type VetFormData } from './VetForm'
import { useUpdateVet, type Vet } from '@/hooks/useVets'
import { toast } from 'sonner'

interface EditVetDialogProps {
  vet: Vet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVetDialog({ vet, open, onOpenChange }: EditVetDialogProps) {
  const updateVet = useUpdateVet()

  if (!vet) return null

  const handleSubmit = async (data: VetFormData) => {
    try {
      await updateVet.mutateAsync({
        id: vet.id,
        updates: data,
      })
      toast.success('Vet updated successfully!', {
        description: `${data.clinic_name} has been updated.`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating vet:', error)
      toast.error('Failed to update vet', {
        description: 'Please try again later.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Veterinarian</DialogTitle>
          <DialogDescription>
            Update the information for {vet.clinic_name}.
          </DialogDescription>
        </DialogHeader>

        <VetForm
          initialData={vet}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateVet.isPending}
          submitLabel="Update Vet"
        />
      </DialogContent>
    </Dialog>
  )
}
