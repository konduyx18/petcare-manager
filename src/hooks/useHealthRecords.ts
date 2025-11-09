import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { HealthRecordFormData } from '@/lib/validations/health-record.schema'

interface HealthRecord {
  id: string
  pet_id: string
  created_at: string
  updated_at: string
  record_type: 'vaccination' | 'vet_visit' | 'prescription' | 'procedure'
  title: string
  date_administered: string
  notes?: string
  cost?: number | ''
  // Vaccination fields
  next_due_date?: string
  // Vet visit & vaccination & procedure fields
  veterinarian?: string
  clinic_name?: string
  // Vet visit field
  diagnosis?: string
  // Prescription fields
  medication_name?: string
  dosage?: string
  frequency?: string
  start_date?: string
  end_date?: string
  // Procedure fields
  procedure_name?: string
  recovery_notes?: string
}

export function useHealthRecords(petId: string) {
  return useQuery({
    queryKey: ['health-records', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date_administered', { ascending: false })

      if (error) throw error
      return data as HealthRecord[]
    },
    enabled: !!petId,
  })
}

export function useCreateHealthRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recordData: HealthRecordFormData & { petId: string }) => {
      const { petId, ...data } = recordData

      const { data: newRecord, error } = await supabase
        .from('health_records')
        // @ts-ignore - Supabase types not generated yet
        .insert({
          pet_id: petId,
          ...data,
        })
        .select()
        .single()

      if (error) throw error
      return newRecord as HealthRecord
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['health-records', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['pet-detail', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
