import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Syringe, Stethoscope, Pill, Scissors,
  Edit, Trash2, ChevronDown, ChevronUp,
  Calendar, DollarSign, User, Building2
} from 'lucide-react'
import { format } from 'date-fns'
import type { HealthRecord } from '@/hooks/useHealthRecords'

interface HealthRecordCardProps {
  record: HealthRecord
  onEdit: (record: HealthRecord) => void
  onDelete: (recordId: string) => void
}

export function HealthRecordCard({ record, onEdit, onDelete }: HealthRecordCardProps) {
  const [expanded, setExpanded] = useState(false)

  const recordTypeConfig = {
    vaccination: {
      icon: Syringe,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      label: '💉 Vaccination',
    },
    vet_visit: {
      icon: Stethoscope,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      label: '🏥 Vet Visit',
    },
    prescription: {
      icon: Pill,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      label: '💊 Prescription',
    },
    procedure: {
      icon: Scissors,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      label: '🩺 Procedure',
    },
  }

  const config = recordTypeConfig[record.record_type]
  const Icon = config.icon

  // Check if record is overdue (for vaccinations)
  const isOverdue = record.next_due_date && new Date(record.next_due_date) < new Date()

  return (
    <Card className={`border-2 ${config.borderColor} hover:shadow-lg transition-shadow`}>
      <CardHeader className={`${config.bgColor} pb-3`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg text-gray-900">
                  {record.title}
                </h3>
                {record.pet && (
                  <Badge variant="outline" className="text-xs">
                    {record.pet.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(record.date_administered), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(record)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(record.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Next Due Date for Vaccinations */}
        {record.record_type === 'vaccination' && record.next_due_date && (
          <div className="mt-2">
            <Badge 
              variant={isOverdue ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isOverdue ? '⚠️ Overdue' : '📅 Next due'}: {format(new Date(record.next_due_date), 'MMM dd, yyyy')}
            </Badge>
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4 space-y-3">
          {/* Veterinarian & Clinic */}
          {(record.veterinarian || record.clinic_name) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {record.veterinarian && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Dr. {record.veterinarian}</span>
                </div>
              )}
              {record.clinic_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{record.clinic_name}</span>
                </div>
              )}
            </div>
          )}

          {/* Prescription Details */}
          {record.record_type === 'prescription' && record.prescription_details && (
            <div className="bg-orange-50 p-3 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-orange-900">Medication Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {record.prescription_details.medication_name && (
                  <div>
                    <span className="text-gray-600">Medication:</span>
                    <p className="font-medium">{record.prescription_details.medication_name}</p>
                  </div>
                )}
                {record.prescription_details.dosage && (
                  <div>
                    <span className="text-gray-600">Dosage:</span>
                    <p className="font-medium">{record.prescription_details.dosage}</p>
                  </div>
                )}
                {record.prescription_details.frequency && (
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium">{record.prescription_details.frequency}</p>
                  </div>
                )}
                {(record.prescription_details.start_date || record.prescription_details.end_date) && (
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">
                      {record.prescription_details.start_date && format(new Date(record.prescription_details.start_date), 'MMM dd')}
                      {' - '}
                      {record.prescription_details.end_date && format(new Date(record.prescription_details.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost */}
          {record.cost && typeof record.cost === 'number' && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Cost: ${record.cost.toFixed(2)}</span>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-900 mb-1">Notes</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
