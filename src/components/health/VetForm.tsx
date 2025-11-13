import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { Vet } from '@/hooks/useVets'

const vetFormSchema = z.object({
  clinic_name: z.string().min(1, 'Clinic name is required'),
  vet_name: z.string().nullable().optional(),
  phone: z.string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Invalid phone number format'
    ),
  email: z.string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      'Invalid email address'
    ),
  address: z.string().nullable().optional(),
  website: z.string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      'Invalid website URL'
    ),
  notes: z.string().nullable().optional(),
  is_primary: z.boolean().default(false),
})

export type VetFormData = z.infer<typeof vetFormSchema>

interface VetFormProps {
  initialData?: Partial<Vet>
  onSubmit: (data: VetFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function VetForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Vet',
}: VetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VetFormData>({
    // @ts-ignore - Zod resolver type mismatch with optional boolean
    resolver: zodResolver(vetFormSchema),
    defaultValues: {
      clinic_name: initialData?.clinic_name || '',
      vet_name: initialData?.vet_name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      website: initialData?.website || '',
      notes: initialData?.notes || '',
      is_primary: initialData?.is_primary || false,
    },
  })

  const isPrimary = watch('is_primary')

  return (
    // @ts-ignore - Form submit handler type mismatch
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Clinic Name */}
      <div>
        <Label htmlFor="clinic_name">
          Clinic Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clinic_name"
          {...register('clinic_name')}
          placeholder="e.g., Happy Paws Veterinary Clinic"
          className="mt-1"
        />
        {errors.clinic_name && (
          <p className="text-sm text-red-600 mt-1">{errors.clinic_name.message}</p>
        )}
      </div>

      {/* Vet Name */}
      <div>
        <Label htmlFor="vet_name">Veterinarian Name</Label>
        <Input
          id="vet_name"
          {...register('vet_name')}
          placeholder="e.g., Dr. Sarah Johnson"
          className="mt-1"
        />
        {errors.vet_name && (
          <p className="text-sm text-red-600 mt-1">{errors.vet_name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register('phone')}
          type="tel"
          placeholder="e.g., (555) 123-4567"
          className="mt-1"
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          placeholder="e.g., contact@happypaws.com"
          className="mt-1"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="e.g., 123 Main St, City, State 12345"
          className="mt-1 min-h-[60px]"
        />
        {errors.address && (
          <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register('website')}
          type="url"
          placeholder="e.g., https://www.happypaws.com"
          className="mt-1"
        />
        {errors.website && (
          <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional information..."
          className="mt-1 min-h-[80px]"
        />
        {errors.notes && (
          <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Primary Vet Checkbox */}
      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox
          id="is_primary"
          checked={isPrimary}
          onCheckedChange={(checked) => setValue('is_primary', checked as boolean)}
        />
        <Label
          htmlFor="is_primary"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Set as primary veterinarian
        </Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
