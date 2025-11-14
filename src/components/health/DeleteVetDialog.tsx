import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteVet } from '@/hooks/useVets'
import { toast } from 'sonner'
import type { Vet } from '@/hooks/useVets'

interface DeleteVetDialogProps {
  vet: Vet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVetDialog({
  vet,
  open,
  onOpenChange,
}: DeleteVetDialogProps) {
  const deleteVet = useDeleteVet()

  const handleDelete = async () => {
    if (!vet) return

    try {
      await deleteVet.mutateAsync(vet.id)
      toast.success(`Deleted ${vet.clinic_name}`)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete vet')
      console.error('Delete error:', error)
    }
  }

  if (!vet) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Veterinarian
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{vet.clinic_name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> This will not delete health records that
                reference this vet. Those records will still show the vet
                information, but you won't be able to select this vet for new
                records.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteVet.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVet.isPending}
          >
            {deleteVet.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
