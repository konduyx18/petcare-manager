import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteVet, type Vet } from '@/hooks/useVets'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'

interface DeleteVetDialogProps {
  vet: Vet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVetDialog({ vet, open, onOpenChange }: DeleteVetDialogProps) {
  const deleteVet = useDeleteVet()

  if (!vet) return null

  const handleDelete = async () => {
    try {
      await deleteVet.mutateAsync(vet.id)
      toast.success('Vet deleted successfully', {
        description: `${vet.clinic_name} has been removed from your directory.`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting vet:', error)
      toast.error('Failed to delete vet', {
        description: 'Please try again later.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Veterinarian
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{vet.clinic_name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This will not delete health records that reference this vet.
              Those records will still show the vet information, but you won't be able to select
              this vet for new records.
            </p>
          </div>

          {vet.usage_count && vet.usage_count > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              This vet is referenced in <strong>{vet.usage_count}</strong> health record(s).
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteVet.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVet.isPending}
          >
            {deleteVet.isPending ? 'Deleting...' : 'Delete Vet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
