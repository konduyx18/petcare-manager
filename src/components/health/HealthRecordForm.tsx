import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { healthRecordSchema, type HealthRecordFormData, type HealthRecordType } from '@/lib/validations/health-record.schema'
import { Loader2, Syringe, Stethoscope, Pill, Scissors } from 'lucide-react'
import { useState } from 'react'

interface HealthRecordFormProps {
  petId: string
  initialData?: HealthRecordFormData & { id?: string }
  onSubmit: (data: HealthRecordFormData) => Promise<void>
  isLoading?: boolean
}

export function HealthRecordForm({ petId, initialData, onSubmit, isLoading }: HealthRecordFormProps) {
  const [recordType, setRecordType] = useState<HealthRecordType>(
    initialData?.record_type || 'vaccination'
  )

  const form = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: initialData || {
      record_type: 'vaccination',
      title: '',
      date_administered: new Date().toISOString().split('T')[0],
      notes: '',
      cost: undefined,
    },
  })

  const handleSubmit = async (data: HealthRecordFormData) => {
    await onSubmit(data)
  }

  const recordTypeConfig = {
    vaccination: {
      icon: Syringe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: '💉 Vaccination',
      description: 'Track vaccines and booster shots',
    },
    vet_visit: {
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: '🏥 Vet Visit',
      description: 'Record check-ups and consultations',
    },
    prescription: {
      icon: Pill,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: '💊 Prescription',
      description: 'Manage medications and dosages',
    },
    procedure: {
      icon: Scissors,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: '🩺 Procedure',
      description: 'Document surgeries and treatments',
    },
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Record Type Selector */}
        <FormField
          control={form.control}
          name="record_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Record Type</FormLabel>
              <Select
                onValueChange={(value: HealthRecordType) => {
                  field.onChange(value)
                  setRecordType(value)
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-14 bg-white">
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {Object.entries(recordTypeConfig).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={type} value={type} className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{config.label}</span>
                            <span className="text-xs text-gray-500">{config.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    recordType === 'vaccination'
                      ? 'e.g., Rabies Vaccine'
                      : recordType === 'vet_visit'
                      ? 'e.g., Annual Checkup'
                      : recordType === 'prescription'
                      ? 'e.g., Antibiotics for Infection'
                      : 'e.g., Dental Cleaning'
                  }
                  {...field}
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Administered */}
        <FormField
          control={form.control}
          name="date_administered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Fields Based on Record Type */}
        {recordType === 'vaccination' && (
          <>
            <FormField
              control={form.control}
              name="next_due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} className="h-11" />
                  </FormControl>
                  <FormDescription>When is the next booster due?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {(recordType === 'vaccination' || recordType === 'vet_visit' || recordType === 'procedure') && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="veterinarian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinarian</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinic_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Happy Paws Veterinary" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {recordType === 'prescription' && (
          <>
            <FormField
              control={form.control}
              name="medication_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Medication Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Amoxicillin" {...field} value={field.value || ''} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 250mg" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Twice daily" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="veterinarian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veterinarian</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Smith" {...field} value={field.value || ''} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {recordType === 'procedure' && (
          <>
            <FormField
              control={form.control}
              name="procedure_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Procedure Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spay/Neuter, Dental Cleaning" {...field} value={field.value || ''} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recovery_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add recovery instructions or observations..."
                      {...field}
                      value={field.value || ''}
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {recordType === 'vet_visit' && (
          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnosis</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add diagnosis or findings..."
                    {...field}
                    value={field.value || ''}
                    className="min-h-[80px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Cost Field */}
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  value={field.value === '' || field.value === undefined ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                  className="h-11"
                />
              </FormControl>
              <FormDescription>Optional - track your expenses</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes Field */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional details, observations, or instructions..."
                  {...field}
                  value={field.value || ''}
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
              <FormDescription>
                Optional - Add any relevant information about this record
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {initialData?.id ? '💾 Update Record' : '✅ Add Health Record'}
        </Button>
      </form>
    </Form>
  )
}
