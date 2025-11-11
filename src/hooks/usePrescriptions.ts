import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { HealthRecord } from './useHealthRecords'

export interface PrescriptionDose {
  id: string
  health_record_id: string
  scheduled_time: string
  given_time: string | null
  given_by: string | null
  notes: string | null
  skipped: boolean
  skip_reason: string | null
  created_at: string
}

export function usePrescriptions(petId?: string) {
  return useQuery({
    queryKey: ['prescriptions', petId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Build the query with proper join syntax
      let query = supabase
        .from('health_records')
        .select(`
          *,
          pets!inner (
            id,
            name,
            species,
            photo_url
          )
        `)
        .eq('record_type', 'prescription')

      if (petId) {
        query = query.eq('pet_id', petId)
      } else {
        // Get all prescriptions for user's pets
        const { data: userPets } = await supabase
          .from('pets')
          .select('id')
          .eq('user_id', user.id)
        
        if (userPets && userPets.length > 0) {
          const petIds = userPets.map(p => p.id)
          query = query.in('pet_id', petIds)
        }
      }

      console.log('Fetching prescriptions...')
      const { data, error } = await query.order('date_administered', { ascending: false })
      
      if (error) {
        console.error('Supabase error fetching prescriptions:', error)
        throw error
      }
      
      console.log('Fetched prescriptions:', data)
      console.log('First prescription:', data?.[0])
      console.log('First prescription pets:', data?.[0]?.pets)
      
      return data as HealthRecord[]
    },
  })
}

export function useActivePrescriptions(petId?: string) {
  const { data: prescriptions } = usePrescriptions(petId)

  // Filter to only active prescriptions
  const now = new Date().toISOString()
  return prescriptions?.filter(p => {
    const details = p.prescription_details as any
    if (!details?.end_date) return true
    return details.end_date >= now
  }) || []
}

export function usePrescriptionDoses(prescriptionId: string) {
  return useQuery({
    queryKey: ['prescription-doses', prescriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescription_doses')
        .select('*')
        .eq('health_record_id', prescriptionId)
        .order('scheduled_time', { ascending: false })

      if (error) throw error
      return data as PrescriptionDose[]
    },
    enabled: !!prescriptionId,
  })
}

export function useMarkDoseAsGiven() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      prescriptionId,
      scheduledTime,
      notes
    }: {
      prescriptionId: string
      scheduledTime: string
      notes?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if dose already exists
      const { data: existingDose } = await supabase
        .from('prescription_doses')
        .select('id')
        .eq('health_record_id', prescriptionId)
        .eq('scheduled_time', scheduledTime)
        .maybeSingle()

      if (existingDose) {
        // Update existing dose
        // @ts-ignore - Supabase types
        const { data, error } = await supabase
          .from('prescription_doses')
          .update({
            given_time: new Date().toISOString(),
            given_by: user.id,
            notes: notes || null,
          })
          .eq('id', existingDose.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new dose record
        // @ts-ignore - Supabase types
        const { data, error } = await supabase
          .from('prescription_doses')
          .insert({
            health_record_id: prescriptionId,
            scheduled_time: scheduledTime,
            given_time: new Date().toISOString(),
            given_by: user.id,
            notes: notes || null,
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescription-doses', variables.prescriptionId] })
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

export function useSkipDose() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      prescriptionId,
      scheduledTime,
      reason
    }: {
      prescriptionId: string
      scheduledTime: string
      reason: string
    }) => {
      // @ts-ignore - Supabase types
      const { data, error } = await supabase
        .from('prescription_doses')
        .insert({
          health_record_id: prescriptionId,
          scheduled_time: scheduledTime,
          skipped: true,
          skip_reason: reason,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescription-doses', variables.prescriptionId] })
    },
  })
}
