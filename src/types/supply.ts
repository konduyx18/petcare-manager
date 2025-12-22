export interface SupplySchedule {
  id: string
  user_id: string
  pet_id: string
  product_name: string
  category: 'Food' | 'Medicine' | 'Treats' | 'Toys' | 'Grooming' | 'Other'
  frequency_days: number
  last_purchase_date: string
  next_reminder_date: string
  affiliate_links?: {
    chewy?: string
    amazon?: string
    petco?: string
  }
  created_at: string
  updated_at: string
}

export interface AddSupplyData {
  pet_id: string
  product_name: string
  category: string
  frequency_days: number
  last_purchase_date: Date
  affiliate_links?: {
    chewy?: string
    amazon?: string
    petco?: string
  }
}

export interface UpdateSupplyData extends AddSupplyData {
  id: string
}
