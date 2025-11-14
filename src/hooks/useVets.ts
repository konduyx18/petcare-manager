import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Vet {
  id: string
  user_id: string
  clinic_name: string
  vet_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  notes: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
  usage_count?: number // Added from join query
}

// Fetch all vets for current user
export function useVets() {
  return useQuery({
    queryKey: ['vets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('Fetching vets for user:', user.id)

      // Simplified query without health_records join
      const { data, error } = await supabase
        .from('vets')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('clinic_name', { ascending: true })

      if (error) {
        console.error('Error fetching vets:', error)
        throw error
      }

      console.log('Fetched vets successfully:', data)
      console.log('Vet count:', data?.length || 0)

      // Return vets with usage_count set to 0 for now
      // TODO: Calculate usage_count separately by matching veterinarian text field
      return (data || []).map(vet => ({
        ...(vet as any),
        usage_count: 0
      })) as Vet[]
    },
  })
}

// Create new vet
export function useCreateVet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newVet: Omit<Vet, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // If marking as primary, unmark all others first
      if (newVet.is_primary) {
        await supabase
          .from('vets')
          // @ts-ignore - Supabase types
          .update({ is_primary: false })
          .eq('user_id', user.id)
      }

      const { data, error } = await supabase
        .from('vets')
        // @ts-ignore - Supabase types
        .insert({
          ...newVet,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Vet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vets'] })
    },
  })
}

// Update existing vet
export function useUpdateVet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vet> }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // If marking as primary, unmark all others first
      if (updates.is_primary) {
        await supabase
          .from('vets')
          // @ts-ignore - Supabase types
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', id)
      }

      const { data, error } = await supabase
        .from('vets')
        // @ts-ignore - Supabase types
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Vet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vets'] })
    },
  })
}

// Delete vet
export function useDeleteVet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vets')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vets'] })
    },
  })
}

// Toggle primary vet
export function useTogglePrimaryVet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isPrimary }: { id: string; isPrimary: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isPrimary) {
        // Unmark all others
        await supabase
          .from('vets')
          // @ts-ignore - Supabase types
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', id)
      }

      // Set this one
      const { data, error} = await supabase
        .from('vets')
        // @ts-ignore - Supabase types
        .update({ is_primary: isPrimary })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vets'] })
    },
  })
}
