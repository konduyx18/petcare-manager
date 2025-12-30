import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadPetPhoto } from '@/utils/upload-image'
import { toast } from 'sonner'
import { handleMutationError } from '@/utils/error-handler'
import type { PetFormData } from '@/lib/validations/pet.schema'

// Pet type definition
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

export function usePets() {
  return useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Pet[]
    },
  })
}

export function useCreatePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (petData: PetFormData & { photo: File | null }) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { photo, ...petInfo } = petData

      // Create pet record first
      const { data: newPet, error: createError } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: petInfo.name,
          species: petInfo.species,
          breed: petInfo.breed || null,
          date_of_birth: petInfo.date_of_birth || null,
          weight_lbs: petInfo.weight_lbs || null,
          microchip_number: petInfo.microchip_number || null,
        } as any)
        .select()
        .single()

      if (createError) throw createError

      const pet = newPet as Pet

      // Upload photo if provided
      let photoUrl = null
      if (photo) {
        photoUrl = await uploadPetPhoto(photo, user.id, pet.id)
        
        // Update pet with photo URL
        const { error: updateError } = await supabase
          .from('pets')
          // @ts-ignore - Supabase types not generated yet, update will work at runtime
          .update({ photo_url: photoUrl })
          .eq('id', pet.id)

        if (updateError) throw updateError
      }

      return { ...pet, photo_url: photoUrl } as Pet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Pet added successfully!')
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to add pet. Please try again.')
    },
  })
}

export function useUpdatePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pet> }) => {
      const { data, error } = await supabase
        .from('pets')
        // @ts-ignore - Supabase types not generated yet
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Pet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Pet updated successfully!')
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to update pet')
    },
  })
}

export function useDeletePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to delete pet')
    },
  })
}
