import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, formatDistanceToNow } from 'date-fns'
import { CalendarIcon, ChevronDown, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usePets } from '@/hooks/usePets'
import { useAddSupply, useUpdateSupply } from '@/hooks/useSupplySchedules'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import type { SupplySchedule } from '@/types/supply'

// Extended validation schema with frequency_amount and frequency_unit for better UX
const supplyFormSchema = z.object({
  pet_id: z.string().min(1, 'Please select a pet'),
  product_name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(50, 'Product name must be less than 50 characters'),
  category: z.enum(['Food', 'Medicine', 'Treats', 'Toys', 'Grooming', 'Other']),
  frequency_amount: z.number().int().min(1).max(365),
  frequency_unit: z.enum(['days', 'weeks', 'months']),
  last_purchase_date: z.date().refine(
    (date) => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date <= today
    },
    {
      message: "Date cannot be in the future"
    }
  ),
  affiliate_chewy: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_amazon: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_petco: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type SupplyFormData = z.infer<typeof supplyFormSchema>

interface SupplyFormProps {
  petId?: string
  initialData?: SupplySchedule
  onSuccess: () => void
  onCancel?: () => void
}

export default function SupplyForm({ petId, initialData, onSuccess, onCancel }: SupplyFormProps) {
  const { data: pets, isLoading: petsLoading } = usePets()
  const addSupply = useAddSupply()
  const updateSupply = useUpdateSupply()
  const [showAffiliateLinks, setShowAffiliateLinks] = useState(false)

  const isEditMode = !!initialData

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

  const frequencyDefaults = getFrequencyDefaults(initialData?.frequency_days)

  const form = useForm<SupplyFormData>({
    resolver: zodResolver(supplyFormSchema),
    defaultValues: {
      pet_id: petId || initialData?.pet_id || '',
      product_name: initialData?.product_name || '',
      category: initialData?.category || 'Food',
      frequency_amount: frequencyDefaults.amount,
      frequency_unit: frequencyDefaults.unit,
      last_purchase_date: initialData?.last_purchase_date ? new Date(initialData.last_purchase_date) : new Date(),
      affiliate_chewy: initialData?.affiliate_links?.chewy || '',
      affiliate_amazon: initialData?.affiliate_links?.amazon || '',
      affiliate_petco: initialData?.affiliate_links?.petco || '',
    },
  })

  // Watch form fields for auto-calculating next reminder date
  const watchedLastPurchase = form.watch('last_purchase_date')
  const watchedFrequencyAmount = form.watch('frequency_amount')
  const watchedFrequencyUnit = form.watch('frequency_unit')

  const calculatedNextReminderDate = useMemo(() => {
    if (!watchedLastPurchase || !watchedFrequencyAmount || !watchedFrequencyUnit) {
      return null
    }
    
    const multiplier = watchedFrequencyUnit === 'weeks' ? 7 : watchedFrequencyUnit === 'months' ? 30 : 1
    const frequencyDays = watchedFrequencyAmount * multiplier
    
    const nextDate = new Date(watchedLastPurchase)
    nextDate.setDate(nextDate.getDate() + frequencyDays)
    
    return nextDate
  }, [watchedLastPurchase, watchedFrequencyAmount, watchedFrequencyUnit])

  const onSubmit = async (data: SupplyFormData) => {
    console.log('🚀 Form submit triggered!')
    console.log('Form data:', data)
    
    try {
      // Convert frequency to days
      const multiplier = {
        days: 1,
        weeks: 7,
        months: 30,
      }[data.frequency_unit]
      
      const frequency_days = data.frequency_amount * multiplier
      console.log('Calculated frequency_days:', frequency_days)

      // Prepare affiliate links
      const affiliate_links: any = {}
      if (data.affiliate_chewy) affiliate_links.chewy = data.affiliate_chewy
      if (data.affiliate_amazon) affiliate_links.amazon = data.affiliate_amazon
      if (data.affiliate_petco) affiliate_links.petco = data.affiliate_petco

      if (isEditMode && initialData) {
        console.log('Edit mode - calling updateSupply mutation...')
        // Update existing supply
        await updateSupply.mutateAsync({
          id: initialData.id,
          pet_id: data.pet_id,
          product_name: data.product_name,
          category: data.category,
          frequency_days,
          last_purchase_date: data.last_purchase_date,
          affiliate_links: Object.keys(affiliate_links).length > 0 ? affiliate_links : {},
        })
      } else {
        console.log('Add mode - calling addSupply mutation...')
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

      console.log('✅ Mutation completed, calling onSuccess')
      onSuccess?.()
    } catch (error) {
      console.error('❌ Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log('❌ Form validation errors:', errors)
      })} className="space-y-6">
        
        {/* Pet Selector */}
        <FormField
          control={form.control}
          name="pet_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Pet <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={petsLoading}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose which pet..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {petsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading pets...
                    </SelectItem>
                  ) : pets && pets.length > 0 ? (
                    pets.map((pet) => (
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
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No pets found. Add a pet first!
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select which pet this supply is for</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Product Name */}
        <FormField
          control={form.control}
          name="product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Royal Canin Medium Adult Dry Dog Food" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectItem value="Food">🍖 Food</SelectItem>
                  <SelectItem value="Medicine">💊 Medicine</SelectItem>
                  <SelectItem value="Treats">🦴 Treats</SelectItem>
                  <SelectItem value="Toys">🎾 Toys</SelectItem>
                  <SelectItem value="Grooming">✂️ Grooming</SelectItem>
                  <SelectItem value="Other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Frequency - Side by side inputs */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Frequency <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="30"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="frequency_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>&nbsp;</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Last Purchase Date */}
        <FormField
          control={form.control}
          name="last_purchase_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Last Purchase Date <span className="text-red-500">*</span></FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When did you last purchase this item?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Next Reminder Date (Auto-calculated, read-only) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Next Reminder Date</p>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated based on frequency</p>
            </div>
            <div className="text-right">
              {calculatedNextReminderDate ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(calculatedNextReminderDate, "PPP")}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({formatDistanceToNow(calculatedNextReminderDate, { addSuffix: true })})
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Select date and frequency</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Affiliate Links - Collapsible Section */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAffiliateLinks(!showAffiliateLinks)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-700">Affiliate Links (Optional)</p>
              <p className="text-xs text-gray-500 mt-1">Add shopping links to easily reorder this product</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAffiliateLinks && "rotate-180")} />
          </button>
          
          {showAffiliateLinks && (
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="affiliate_chewy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chewy URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.chewy.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="affiliate_amazon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.amazon.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="affiliate_petco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Petco URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.petco.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditMode ? 'Update Supply' : 'Add Supply'
            )}
          </Button>
        </div>
        
      </form>
    </Form>
  )
}
