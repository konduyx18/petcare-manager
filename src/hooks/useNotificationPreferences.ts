import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface NotificationPreferences {
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  health_reminders_enabled: boolean
  vaccination_reminders_enabled: boolean
  prescription_reminders_enabled: boolean
  supply_reminders_enabled: boolean
  health_reminder_days: number
  vaccination_reminder_days: number
  prescription_reminder_days: number
  supply_reminder_days: number
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  created_at: string
  updated_at: string
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient()

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // @ts-ignore
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // No preferences yet, create defaults
        // @ts-ignore - notification_preferences table exists but not in generated types
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          // @ts-ignore
          .insert({
            user_id: user.id,
            push_enabled: true,
            email_enabled: true,
            health_reminders_enabled: true,
            vaccination_reminders_enabled: true,
            prescription_reminders_enabled: true,
            supply_reminders_enabled: true,
            health_reminder_days: 14,
            vaccination_reminder_days: 14,
            prescription_reminder_days: 7,
            supply_reminder_days: 3,
            quiet_hours_enabled: false,
            quiet_hours_start: '22:00:00',
            quiet_hours_end: '08:00:00',
          })
          .select()
          .single()

        if (insertError) throw insertError
        return newPrefs as NotificationPreferences
      }

      if (error) throw error
      return data as NotificationPreferences
    },
  })

  // Update preferences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // @ts-ignore - notification_preferences table exists but not in generated types
      const { error } = await supabase
        .from('notification_preferences')
        // @ts-ignore
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Preferences updated')
    },
    onError: (error) => {
      console.error('Update error:', error)
      toast.error('Failed to update preferences')
    },
  })

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  }
}
