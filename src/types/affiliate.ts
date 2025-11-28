export interface AffiliateProduct {
  id: string
  name: string
  category: 'Food' | 'Medication' | 'Treats' | 'Grooming' | 'Toys' | 'Supplements' | 'Other'
  pet_type: 'dog' | 'cat' | 'both'
  description: string
  image_url: string
  affiliate_links: {
    chewy?: string
    amazon?: string
    petco?: string
  }
  is_featured: boolean
  created_at: string
}

export interface AffiliateClick {
  id: string
  user_id: string
  product_id: string
  supply_schedule_id: string | null
  affiliate_name: 'chewy' | 'amazon' | 'petco' | 'other'
  clicked_at: string
}

export interface ProductFilters {
  category: string
  petType: 'all' | 'dog' | 'cat'
  search: string
}
