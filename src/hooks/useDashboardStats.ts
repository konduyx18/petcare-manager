import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  totalPets: number
  upcomingReminders: number
  activeSupplies: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User auth error:', userError)
        throw new Error('Not authenticated')
      }

      console.log('Fetching stats for user:', user.id)

      // Query 1: Total pets - Direct query with user_id
      const { count: totalPets, error: petsError } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (petsError) {
        console.error('Pets count error:', petsError)
      }

      console.log('Total pets:', totalPets)

      // Query 2: Upcoming reminders (next 7 days)
      // Must join with pets table for RLS to work
      const today = new Date().toISOString().split('T')[0]
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const { count: upcomingReminders, error: remindersError } = await supabase
        .from('health_records')
        .select('id, pets!inner(user_id)', { count: 'exact', head: true })
        .eq('pets.user_id', user.id)
        .gte('next_due_date', today)
        .lte('next_due_date', sevenDaysFromNow)

      if (remindersError) {
        console.error('Reminders count error:', remindersError)
      }

      console.log('Upcoming reminders:', upcomingReminders)

      // Query 3: Active supplies
      // Must join with pets table for RLS to work
      const { count: activeSupplies, error: suppliesError } = await supabase
        .from('supply_schedules')
        .select('id, pets!inner(user_id)', { count: 'exact', head: true })
        .eq('pets.user_id', user.id)

      if (suppliesError) {
        console.error('Supplies count error:', suppliesError)
      }

      console.log('Active supplies:', activeSupplies)

      // Return stats with fallback to 0
      return {
        totalPets: totalPets ?? 0,
        upcomingReminders: upcomingReminders ?? 0,
        activeSupplies: activeSupplies ?? 0,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  })
}
