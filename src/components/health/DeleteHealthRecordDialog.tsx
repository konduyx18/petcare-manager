import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useDeleteHealthRecord } from '@/hooks/useHealthRecords'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface DeleteHealthRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordId: string
  recordTitle: string
}

export function DeleteHealthRecordDialog({ open, onOpenChange, recordId, recordTitle }: DeleteHealthRecordDialogProps) {
  const deleteRecord = useDeleteHealthRecord()

  const handleDelete = async () => {
    try {
      await deleteRecord.mutateAsync(recordId)
      toast.success(`Deleted "${recordTitle}"`)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete health record')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Health Record?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{recordTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteRecord.isPending}
          >
            {deleteRecord.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
