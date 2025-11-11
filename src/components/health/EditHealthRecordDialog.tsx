import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HealthRecordForm } from './HealthRecordForm'
import { useUpdateHealthRecord } from '@/hooks/useHealthRecords'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import type { HealthRecordFormData } from '@/lib/validations/health-record.schema'
import type { HealthRecord } from '@/hooks/useHealthRecords'

interface EditHealthRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: HealthRecord
  petName: string
}

export function EditHealthRecordDialog({ open, onOpenChange, record, petName }: EditHealthRecordDialogProps) {
  const updateRecord = useUpdateHealthRecord()

  const handleSubmit = async (data: HealthRecordFormData) => {
    try {
      await updateRecord.mutateAsync({ id: record.id, updates: data })
      toast.success('🎉 Health record updated!', {
        description: `Updated ${data.title} for ${petName}`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update health record', {
        description: 'Please try again',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Edit Health Record
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Update medical history for {record.pet?.name || (record as any).pets?.name || petName || 'your pet'} 🐾
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4">
          <HealthRecordForm
            petId={record.pet_id}
            initialData={record as any}
            onSubmit={handleSubmit}
            isLoading={updateRecord.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
