import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { HealthRecordFormData } from '@/lib/validations/health-record.schema'

export interface HealthRecord {
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
  prescription_details?: {
    medication_name?: string
    dosage?: string
    frequency?: string
    start_date?: string
    end_date?: string
  }
  medication_name?: string
  dosage?: string
  frequency?: string
  start_date?: string
  end_date?: string
  // Procedure fields
  procedure_name?: string
  recovery_notes?: string
  // Pet relation
  pet?: {
    id: string
    name: string
    species: string
    photo_url: string | null
  }
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
      const { petId, record_type, ...formData } = recordData

      // Base fields that go to ALL record types
      let dataToInsert: any = {
        pet_id: petId,
        record_type,
        title: formData.title,
        date_administered: formData.date_administered,
        notes: formData.notes || null,
        cost: formData.cost || null,
      }

      // Handle prescription-specific fields → store in JSONB
      if (record_type === 'prescription') {
        const prescriptionData = formData as any
        
        dataToInsert.prescription_details = {
          medication_name: prescriptionData.medication_name,
          dosage: prescriptionData.dosage || null,
          frequency: prescriptionData.frequency || null,
          start_date: prescriptionData.start_date || null,
          end_date: prescriptionData.end_date || null,
        }
        
        // Veterinarian goes as top-level column
        dataToInsert.veterinarian = prescriptionData.veterinarian || null
      } 
      // Handle vaccination-specific fields
      else if (record_type === 'vaccination') {
        const vaccinationData = formData as any
        dataToInsert.next_due_date = vaccinationData.next_due_date || null
        dataToInsert.veterinarian = vaccinationData.veterinarian || null
        dataToInsert.clinic_name = vaccinationData.clinic_name || null
      }
      // Handle vet_visit-specific fields
      else if (record_type === 'vet_visit') {
        const vetVisitData = formData as any
        dataToInsert.veterinarian = vetVisitData.veterinarian || null
        dataToInsert.clinic_name = vetVisitData.clinic_name || null
        
        // Add diagnosis to notes if provided
        if (vetVisitData.diagnosis) {
          const diagnosisNote = `Diagnosis: ${vetVisitData.diagnosis}`
          dataToInsert.notes = dataToInsert.notes 
            ? `${diagnosisNote}\n\n${dataToInsert.notes}` 
            : diagnosisNote
        }
      }
      // Handle procedure-specific fields
      else if (record_type === 'procedure') {
        const procedureData = formData as any
        dataToInsert.veterinarian = procedureData.veterinarian || null
        dataToInsert.clinic_name = procedureData.clinic_name || null
        
        // Add procedure details to notes
        if (procedureData.procedure_name) {
          let procedureNotes = `Procedure: ${procedureData.procedure_name}`
          if (procedureData.recovery_notes) {
            procedureNotes += `\n\nRecovery Notes: ${procedureData.recovery_notes}`
          }
          dataToInsert.notes = dataToInsert.notes
            ? `${procedureNotes}\n\n${dataToInsert.notes}` 
            : procedureNotes
        }
      }

      console.log('Inserting health record:', dataToInsert)

      // @ts-ignore - Supabase types
      const { data: newRecord, error } = await supabase
        .from('health_records')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      console.log('Successfully created record:', newRecord)
      return newRecord as HealthRecord
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['health-records', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['pet-detail', variables.petId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Fetch ALL health records for current user (across all pets)
export function useAllHealthRecords() {
  return useQuery({
    queryKey: ['health-records', 'all'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get all pets for user first
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', user.id)

      if (petsError) throw petsError

      // @ts-ignore - Supabase types
      const petIds = pets.map(p => p.id)

      if (petIds.length === 0) return []

      // Get all health records for those pets
      const { data, error } = await supabase
        .from('health_records')
        .select('*, pets(id, name, species, photo_url)')
        .in('pet_id', petIds)
        .order('date_administered', { ascending: false })

      if (error) throw error
      return data as HealthRecord[]
    },
  })
}

// Update health record
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HealthRecordFormData> }) => {
      const { data, error } = await supabase
        .from('health_records')
        // @ts-ignore - Supabase types
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as HealthRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] })
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Delete health record
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // @ts-ignore - Supabase types
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] })
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
