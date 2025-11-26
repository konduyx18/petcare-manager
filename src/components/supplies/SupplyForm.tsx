import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usePets } from '@/hooks/usePets'
import { useAddSupply, useUpdateSupply, type SupplySchedule } from '@/hooks/useSupplySchedules'
import { calculateNextReminderDate } from '@/utils/supply-utils'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

// Validation schema
const supplyFormSchema = z.object({
  pet_id: z.string().uuid('Please select a pet'),
  product_name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),
  category: z.enum(['Food', 'Medication', 'Treats', 'Grooming', 'Toys', 'Supplements', 'Other']),
  frequency_amount: z.number().int().min(1).max(365),
  frequency_unit: z.enum(['days', 'weeks', 'months']),
  last_purchase_date: z.date().max(new Date(), 'Date cannot be in the future'),
  affiliate_chewy: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_amazon: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_petco: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type SupplyFormData = z.infer<typeof supplyFormSchema>

interface SupplyFormProps {
  supply?: SupplySchedule
  onSuccess?: () => void
  onCancel?: () => void
}

export default function SupplyForm({ supply, onSuccess, onCancel }: SupplyFormProps) {
  const { data: pets, isLoading: petsLoading } = usePets()
  const addSupply = useAddSupply()
  const updateSupply = useUpdateSupply()

  const isEditMode = !!supply

  // Convert frequency_days to amount and unit for editing
  const getFrequencyDefaults = (frequencyDays?: number) => {
    if (!frequencyDays) return { amount: 30, unit: 'days' as const }
    
    if (frequencyDays % 30 === 0) {
      return { amount: frequencyDays / 30, unit: 'months' as const }
    }
    if (frequencyDays % 7 === 0) {
      return { amount: frequencyDays / 7, unit: 'weeks' as const }
    }
    return { amount: frequencyDays, unit: 'days' as const }
  }

  const frequencyDefaults = getFrequencyDefaults(supply?.frequency_days)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplyFormData>({
    resolver: zodResolver(supplyFormSchema),
    defaultValues: {
      pet_id: supply?.pet_id || '',
      product_name: supply?.product_name || '',
      category: supply?.category || 'Food',
      frequency_amount: frequencyDefaults.amount,
      frequency_unit: frequencyDefaults.unit,
      last_purchase_date: supply?.last_purchase_date ? new Date(supply.last_purchase_date) : new Date(),
      affiliate_chewy: supply?.affiliate_links?.chewy || '',
      affiliate_amazon: supply?.affiliate_links?.amazon || '',
      affiliate_petco: supply?.affiliate_links?.petco || '',
    },
  })

  // Watch form values for real-time next reminder calculation
  const watchedFrequencyAmount = useWatch({ control, name: 'frequency_amount' })
  const watchedFrequencyUnit = useWatch({ control, name: 'frequency_unit' })
  const watchedLastPurchase = useWatch({ control, name: 'last_purchase_date' })

  // Calculate next reminder date in real-time
  const nextReminderDate = (() => {
    if (!watchedLastPurchase || !watchedFrequencyAmount) return null

    const multiplier = {
      days: 1,
      weeks: 7,
      months: 30,
    }[watchedFrequencyUnit || 'days']

    const frequencyDays = watchedFrequencyAmount * multiplier
    return calculateNextReminderDate(watchedLastPurchase, frequencyDays)
  })()

  const onSubmit = async (data: SupplyFormData) => {
    try {
      // Convert frequency to days
      const multiplier = {
        days: 1,
        weeks: 7,
        months: 30,
      }[data.frequency_unit]
      
      const frequency_days = data.frequency_amount * multiplier

      // Prepare affiliate links
      const affiliate_links: any = {}
      if (data.affiliate_chewy) affiliate_links.chewy = data.affiliate_chewy
      if (data.affiliate_amazon) affiliate_links.amazon = data.affiliate_amazon
      if (data.affiliate_petco) affiliate_links.petco = data.affiliate_petco

      if (isEditMode) {
        // Update existing supply
        await updateSupply.mutateAsync({
          id: supply.id,
          pet_id: data.pet_id,
          product_name: data.product_name,
          category: data.category,
          frequency_days,
          last_purchase_date: data.last_purchase_date,
          affiliate_links: Object.keys(affiliate_links).length > 0 ? affiliate_links : {},
        })
      } else {
        // Add new supply
        await addSupply.mutateAsync({
          pet_id: data.pet_id,
          product_name: data.product_name,
          category: data.category,
          frequency_days,
          last_purchase_date: data.last_purchase_date,
          affiliate_links: Object.keys(affiliate_links).length > 0 ? affiliate_links : {},
        })

        // Show confetti for first supply
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Pet Selector */}
      <div className="space-y-2">
        <Label htmlFor="pet_id">Pet *</Label>
        <Select
          value={useWatch({ control, name: 'pet_id' }) || ''}
          onValueChange={(value) => setValue('pet_id', value)}
          disabled={petsLoading}
        >
          <SelectTrigger id="pet_id" className={errors.pet_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a pet" />
          </SelectTrigger>
          <SelectContent>
            {pets?.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
                    <AvatarFallback className="text-xs">
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{pet.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.pet_id && (
          <p className="text-sm text-red-500">{errors.pet_id.message}</p>
        )}
      </div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="product_name">Product Name *</Label>
        <Input
          id="product_name"
          placeholder="Royal Canin Medium Adult Dry Dog Food"
          {...register('product_name')}
          className={errors.product_name ? 'border-red-500' : ''}
        />
        {errors.product_name && (
          <p className="text-sm text-red-500">{errors.product_name.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={useWatch({ control, name: 'category' }) || 'Food'}
          onValueChange={(value: any) => setValue('category', value)}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Medication">Medication</SelectItem>
            <SelectItem value="Treats">Treats</SelectItem>
            <SelectItem value="Grooming">Grooming</SelectItem>
            <SelectItem value="Toys">Toys</SelectItem>
            <SelectItem value="Supplements">Supplements</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Reorder Frequency *</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type="number"
              min="1"
              max="365"
              placeholder="30"
              {...register('frequency_amount', { valueAsNumber: true })}
              className={errors.frequency_amount ? 'border-red-500' : ''}
            />
            {errors.frequency_amount && (
              <p className="text-sm text-red-500 mt-1">{errors.frequency_amount.message}</p>
            )}
          </div>
          <Select
            value={useWatch({ control, name: 'frequency_unit' }) || 'days'}
            onValueChange={(value: any) => setValue('frequency_unit', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Last Purchase Date */}
      <div className="space-y-2">
        <Label>Last Purchase Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !watchedLastPurchase && 'text-muted-foreground',
                errors.last_purchase_date && 'border-red-500'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchedLastPurchase ? format(watchedLastPurchase, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchedLastPurchase}
              onSelect={(date: Date | undefined) => date && setValue('last_purchase_date', date)}
              disabled={(date: Date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.last_purchase_date && (
          <p className="text-sm text-red-500">{errors.last_purchase_date.message}</p>
        )}
      </div>

      {/* Next Reminder Date (Read-only, calculated) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Next Reminder Date
          <Info className="h-4 w-4 text-muted-foreground" />
        </Label>
        <Input
          value={nextReminderDate ? format(nextReminderDate, 'PPPP') : 'Select frequency and last purchase date'}
          disabled
          className="bg-muted text-muted-foreground"
        />
      </div>

      {/* Affiliate Links (Optional) */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <Label className="text-base font-semibold">Affiliate Links (Optional)</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add shopping links to easily reorder this product
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="affiliate_chewy" className="text-sm">Chewy URL</Label>
            <Input
              id="affiliate_chewy"
              type="url"
              placeholder="https://www.chewy.com/..."
              {...register('affiliate_chewy')}
              className={errors.affiliate_chewy ? 'border-red-500' : ''}
            />
            {errors.affiliate_chewy && (
              <p className="text-sm text-red-500">{errors.affiliate_chewy.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliate_amazon" className="text-sm">Amazon URL</Label>
            <Input
              id="affiliate_amazon"
              type="url"
              placeholder="https://www.amazon.com/..."
              {...register('affiliate_amazon')}
              className={errors.affiliate_amazon ? 'border-red-500' : ''}
            />
            {errors.affiliate_amazon && (
              <p className="text-sm text-red-500">{errors.affiliate_amazon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliate_petco" className="text-sm">Petco URL</Label>
            <Input
              id="affiliate_petco"
              type="url"
              placeholder="https://www.petco.com/..."
              {...register('affiliate_petco')}
              className={errors.affiliate_petco ? 'border-red-500' : ''}
            />
            {errors.affiliate_petco && (
              <p className="text-sm text-red-500">{errors.affiliate_petco.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Supply' : 'Add Supply'}
        </Button>
      </div>
    </form>
  )
}
