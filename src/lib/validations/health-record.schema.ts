import { z } from 'zod'

export const healthRecordTypes = ['vaccination', 'vet_visit', 'prescription', 'procedure'] as const
export type HealthRecordType = typeof healthRecordTypes[number]

// Base schema shared by all record types
const baseHealthRecordSchema = z.object({
  pet_id: z.string().min(1, 'Please select a pet'),
  record_type: z.enum(healthRecordTypes),
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  date_administered: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  cost: z.number().positive().optional().or(z.literal('')),
})

// Vaccination-specific fields
const vaccinationSchema = baseHealthRecordSchema.extend({
  record_type: z.literal('vaccination'),
  next_due_date: z.string().optional(),
  veterinarian: z.string().optional(),
  clinic_name: z.string().optional(),
})

// Vet Visit-specific fields
const vetVisitSchema = baseHealthRecordSchema.extend({
  record_type: z.literal('vet_visit'),
  veterinarian: z.string().optional(),
  clinic_name: z.string().optional(),
  diagnosis: z.string().optional(),
})

// Prescription-specific fields
const prescriptionSchema = baseHealthRecordSchema.extend({
  record_type: z.literal('prescription'),
  medication_name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  veterinarian: z.string().optional(),
})

// Procedure-specific fields
const procedureSchema = baseHealthRecordSchema.extend({
  record_type: z.literal('procedure'),
  procedure_name: z.string().min(1, 'Procedure name is required'),
  veterinarian: z.string().optional(),
  clinic_name: z.string().optional(),
  recovery_notes: z.string().optional(),
})

// Union of all schemas
export const healthRecordSchema = z.discriminatedUnion('record_type', [
  vaccinationSchema,
  vetVisitSchema,
  prescriptionSchema,
  procedureSchema,
])

export type HealthRecordFormData = z.infer<typeof healthRecordSchema>
