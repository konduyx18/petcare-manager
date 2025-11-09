import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HealthRecordForm } from './HealthRecordForm'
import { useCreateHealthRecord } from '@/hooks/useHealthRecords'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import type { HealthRecordFormData } from '@/lib/validations/health-record.schema'

interface AddHealthRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId: string
  petName: string
}

export function AddHealthRecordDialog({ open, onOpenChange, petId, petName }: AddHealthRecordDialogProps) {
  const createRecord = useCreateHealthRecord()

  const handleSubmit = async (data: HealthRecordFormData) => {
    try {
      await createRecord.mutateAsync({ petId, ...data })
      toast.success('🎉 Health record added!', {
        description: `Added ${data.title} for ${petName}`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to add health record', {
        description: 'Please try again',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Add Health Record
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Track medical history for {petName} 🐾
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4">
          <HealthRecordForm
            petId={petId}
            onSubmit={handleSubmit}
            isLoading={createRecord.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
