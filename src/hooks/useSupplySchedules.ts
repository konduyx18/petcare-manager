import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { 
  calculateNextReminderDate, 
  getDaysUntilReminder, 
  getReminderStatus,
  getProgressPercentage 
} from '@/utils/supply-utils'

export interface SupplySchedule {
  id: string
  user_id: string
  pet_id: string
  product_name: string
  category: 'Food' | 'Medication' | 'Treats' | 'Grooming' | 'Toys' | 'Supplements' | 'Other'
  frequency_days: number
  last_purchase_date: string
  next_reminder_date: string
  affiliate_links: {
    chewy?: string
    amazon?: string
    petco?: string
  }
  created_at: string
  pets?: {
    id: string
    name: string
    photo_url: string | null
  }
  // Calculated fields
  daysUntilReminder?: number
  reminderStatus?: 'overdue' | 'urgent' | 'soon' | 'upcoming'
  progressPercentage?: number
}

interface AddSupplyData {
  pet_id: string
  product_name: string
  category: 'Food' | 'Medication' | 'Treats' | 'Grooming' | 'Toys' | 'Supplements' | 'Other'
  frequency_days: number
  last_purchase_date: Date
  affiliate_links?: {
    chewy?: string
    amazon?: string
    petco?: string
  }
}

interface UpdateSupplyData {
  id: string
  pet_id?: string
  product_name?: string
  category?: 'Food' | 'Medication' | 'Treats' | 'Grooming' | 'Toys' | 'Supplements' | 'Other'
  frequency_days?: number
  last_purchase_date?: Date
  affiliate_links?: {
    chewy?: string
    amazon?: string
    petco?: string
  }
}

/**
 * Fetch supply schedules with optional pet filter
 */
export function useSupplySchedules(petId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['supply-schedules', user?.id, petId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      let query = supabase
        .from('supply_schedules')
        .select(`
          *,
          pets!inner (
            id,
            name,
            photo_url,
            user_id
          )
        `)
        .eq('pets.user_id', user.id)

      // Filter by pet if specified
      if (petId) {
        query = query.eq('pet_id', petId)
      }

      // Add order at the end
      query = query.order('next_reminder_date')

      const { data, error } = await query

      if (error) throw error

      // Calculate additional fields for each supply
      const suppliesWithCalculations = (data || []).map((supply: any) => {
        const daysUntilReminder = getDaysUntilReminder(new Date(supply.next_reminder_date))
        const reminderStatus = getReminderStatus(daysUntilReminder)
        const progressPercentage = getProgressPercentage(
          new Date(supply.last_purchase_date),
          new Date(supply.next_reminder_date)
        )

        return {
          ...supply,
          daysUntilReminder,
          reminderStatus,
          progressPercentage
        } as SupplySchedule
      })

      return suppliesWithCalculations
    },
    enabled: !!user?.id,
  })
}

/**
 * Add a new supply schedule
 */
export function useAddSupply() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddSupplyData) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Calculate next reminder date
      const nextReminderDate = calculateNextReminderDate(
        data.last_purchase_date,
        data.frequency_days
      )

      const { data: newSupply, error } = await supabase
        .from('supply_schedules')
        .insert({
          user_id: user.id,
          pet_id: data.pet_id,
          product_name: data.product_name,
          category: data.category,
          frequency_days: data.frequency_days,
          last_purchase_date: data.last_purchase_date.toISOString().split('T')[0],
          next_reminder_date: nextReminderDate.toISOString().split('T')[0],
          affiliate_links: data.affiliate_links || {}
        } as any)
        .select()
        .single()

      if (error) throw error
      return newSupply as any
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supply-schedules'] })
      toast.success(`Added ${data.product_name} to supplies`)
    },
    onError: (error: Error) => {
      console.error('Error adding supply:', error)
      toast.error('Failed to add supply. Please try again.')
    }
  })
}

/**
 * Update an existing supply schedule
 */
export function useUpdateSupply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateSupplyData) => {
      const { id, ...updateData } = data
      
      // Prepare update object
      const updates: any = {}
      
      if (updateData.pet_id) updates.pet_id = updateData.pet_id
      if (updateData.product_name) updates.product_name = updateData.product_name
      if (updateData.category) updates.category = updateData.category
      if (updateData.affiliate_links !== undefined) updates.affiliate_links = updateData.affiliate_links
      
      // Handle date and frequency updates
      if (updateData.last_purchase_date) {
        updates.last_purchase_date = updateData.last_purchase_date.toISOString().split('T')[0]
      }
      
      if (updateData.frequency_days) {
        updates.frequency_days = updateData.frequency_days
      }
      
      // Recalculate next reminder if frequency or last purchase changed
      if (updateData.frequency_days || updateData.last_purchase_date) {
        // Get current supply to get missing values
        const { data: currentSupply } = await supabase
          .from('supply_schedules')
          .select('last_purchase_date, frequency_days')
          .eq('id', id)
          .single()
        
        const lastPurchase = updateData.last_purchase_date 
          ? updateData.last_purchase_date 
          : new Date((currentSupply as any)!.last_purchase_date)
        
        const frequency = updateData.frequency_days || (currentSupply as any)!.frequency_days
        
        const nextReminder = calculateNextReminderDate(lastPurchase, frequency)
        updates.next_reminder_date = nextReminder.toISOString().split('T')[0]
      }

      const { data: updatedSupply, error } = await (supabase
        .from('supply_schedules') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return updatedSupply as any
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supply-schedules'] })
      toast.success(`Updated ${data.product_name}`)
    },
    onError: (error: Error) => {
      console.error('Error updating supply:', error)
      toast.error('Failed to update supply. Please try again.')
    }
  })
}

/**
 * Delete a supply schedule
 */
export function useDeleteSupply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, product_name }: { id: string; product_name: string }) => {
      const { error } = await supabase
        .from('supply_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { product_name }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supply-schedules'] })
      toast.success(`Deleted ${data.product_name}`)
    },
    onError: (error: Error) => {
      console.error('Error deleting supply:', error)
      toast.error('Failed to delete supply. Please try again.')
    }
  })
}

/**
 * Mark a supply as ordered (updates last purchase date to today)
 */
export function useMarkAsOrdered() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      frequency_days, 
      product_name 
    }: { 
      id: string
      frequency_days: number
      product_name: string 
    }) => {
      const today = new Date()
      const nextReminder = calculateNextReminderDate(today, frequency_days)

      const { data, error } = await (supabase
        .from('supply_schedules') as any)
        .update({
          last_purchase_date: today.toISOString().split('T')[0],
          next_reminder_date: nextReminder.toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { ...(data as any), product_name }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supply-schedules'] })
      const formattedDate = new Date(data.next_reminder_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      toast.success(`✅ Marked as ordered! Next reminder: ${formattedDate}`)
    },
    onError: (error: Error) => {
      console.error('Error marking as ordered:', error)
      toast.error('Failed to mark as ordered. Please try again.')
    }
  })
}
