import { z } from 'zod'

export const petSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  
  species: z.enum(['dog', 'cat', 'rabbit', 'bird', 'other'], {
    message: 'Please select a species',
  }),
  
  breed: z.string()
    .max(100, 'Breed must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  date_of_birth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      return birthDate <= new Date()
    }, 'Date of birth cannot be in the future'),
  
  weight_lbs: z.number()
    .positive('Weight must be a positive number')
    .max(1000, 'Weight must be less than 1000 lbs')
    .optional()
    .nullable(),
  
  microchip_number: z.string()
    .max(50, 'Microchip number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
})

export type PetFormData = z.infer<typeof petSchema>
