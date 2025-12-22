import { z } from 'zod'

export const supplyFormSchema = z.object({
  pet_id: z.string().min(1, 'Please select a pet'),
  product_name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(50, 'Product name must be less than 50 characters'),
  category: z.enum(['Food', 'Medicine', 'Treats', 'Toys', 'Grooming', 'Other'], {
    required_error: 'Please select a category',
  }),
  frequency_days: z
    .number({
      required_error: 'Frequency is required',
      invalid_type_error: 'Frequency must be a number',
    })
    .int('Frequency must be a whole number')
    .min(1, 'Frequency must be at least 1 day')
    .max(365, 'Frequency cannot exceed 365 days'),
  last_purchase_date: z.date().refine(
    (date) => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date <= today
    },
    {
      message: 'Last purchase date cannot be in the future',
    }
  ),
  affiliate_chewy: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  affiliate_amazon: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  affiliate_petco: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type SupplyFormData = z.infer<typeof supplyFormSchema>
