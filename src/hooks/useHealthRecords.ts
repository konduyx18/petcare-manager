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
      // First, get the existing record to check its type
      // @ts-ignore - Supabase types
      const { data: existingRecord } = await supabase
        .from('health_records')
        .select('record_type, pet_id')
        .eq('id', id)
        .single()

      if (!existingRecord) throw new Error('Record not found')

      console.log('Updating record:', id)
      // @ts-ignore
      console.log('Record type:', existingRecord.record_type)
      console.log('Update data received:', updates)

      // Prepare the update data
      let dataToUpdate: any = {}

      // Handle prescription-specific fields
      // @ts-ignore
      if (existingRecord.record_type === 'prescription') {
        const prescriptionUpdates = updates as any
        
        // Base fields that go to all records
        if (prescriptionUpdates.title !== undefined) dataToUpdate.title = prescriptionUpdates.title
        if (prescriptionUpdates.date_administered !== undefined) dataToUpdate.date_administered = prescriptionUpdates.date_administered
        if (prescriptionUpdates.notes !== undefined) dataToUpdate.notes = prescriptionUpdates.notes
        if (prescriptionUpdates.cost !== undefined) dataToUpdate.cost = prescriptionUpdates.cost
        if (prescriptionUpdates.veterinarian !== undefined) dataToUpdate.veterinarian = prescriptionUpdates.veterinarian
        
        // Build prescription_details JSONB from flat fields
        const prescriptionDetails: any = {}
        
        if (prescriptionUpdates.medication_name !== undefined) {
          prescriptionDetails.medication_name = prescriptionUpdates.medication_name
        }
        if (prescriptionUpdates.dosage !== undefined) {
          prescriptionDetails.dosage = prescriptionUpdates.dosage
        }
        if (prescriptionUpdates.frequency !== undefined) {
          prescriptionDetails.frequency = prescriptionUpdates.frequency
        }
        if (prescriptionUpdates.start_date !== undefined) {
          prescriptionDetails.start_date = prescriptionUpdates.start_date
        }
        if (prescriptionUpdates.end_date !== undefined) {
          prescriptionDetails.end_date = prescriptionUpdates.end_date
        }
        
        // Only set prescription_details if we have at least one field
        if (Object.keys(prescriptionDetails).length > 0) {
          dataToUpdate.prescription_details = prescriptionDetails
        }
        
        console.log('Prescription details JSONB:', prescriptionDetails)
      } else {
        // For other record types, just copy all fields
        dataToUpdate = { ...updates }
      }

      console.log('Final update payload:', dataToUpdate)

      const { data, error } = await supabase
        .from('health_records')
        // @ts-ignore - Supabase types
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          pets (
            id,
            name,
            species,
            photo_url
          )
        `)
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      console.log('Successfully updated record:', data)
      return data as HealthRecord
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] })
      queryClient.invalidateQueries({ queryKey: ['pet-detail', data.pet_id] })
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
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
