import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
  breed: string | null
  date_of_birth: string | null
  weight_lbs: number | null
  microchip_number: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

interface PetDetailData {
  pet: Pet
  stats: {
    healthRecordsCount: number
    activeSuppliesCount: number
    upcomingRemindersCount: number
  }
}

export function usePetDetail(petId: string) {
  return useQuery<PetDetailData>({
    queryKey: ['pet-detail', petId],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch pet data
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single()

      if (petError) throw petError

      // Fetch related counts in parallel
      const [healthRecords, supplies, reminders] = await Promise.all([
        // Count total health records for this pet
        supabase
          .from('health_records')
          .select('id', { count: 'exact', head: true })
          .eq('pet_id', petId),
        
        // Count active supply schedules
        supabase
          .from('supply_schedules')
          .select('id', { count: 'exact', head: true })
          .eq('pet_id', petId),
        
        // Count upcoming reminders (next 30 days)
        supabase
          .from('health_records')
          .select('id', { count: 'exact', head: true })
          .eq('pet_id', petId)
          .gte('next_due_date', new Date().toISOString())
          .lte('next_due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      return {
        pet: pet as Pet,
        stats: {
          healthRecordsCount: healthRecords.count ?? 0,
          activeSuppliesCount: supplies.count ?? 0,
          upcomingRemindersCount: reminders.count ?? 0,
        }
      }
    },
    enabled: !!petId,
  })
}
