// Enums
export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
export type HealthRecordType = 'vaccination' | 'vet_visit' | 'prescription' | 'procedure'

// Table Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: PetSpecies
  breed: string | null
  date_of_birth: string | null
  weight_lbs: number | null
  microchip_number: string | null
  photo_url: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface HealthRecord {
  id: string
  pet_id: string
  record_type: HealthRecordType
  title: string
  date_administered: string
  next_due_date: string | null
  veterinarian: string | null
  clinic_name: string | null
  notes: string | null
  cost: number | null
  prescription_details: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface SupplySchedule {
  id: string
  pet_id: string
  product_name: string
  category: string | null
  frequency_days: number
  last_purchase_date: string
  next_reminder_date: string
  affiliate_links: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface UserDevice {
  id: string
  user_id: string
  subscription: Record<string, any>
  device_name: string | null
  created_at: string
}

export interface AffiliateProduct {
  id: string
  name: string
  category: string
  pet_type: string | null
  description: string | null
  image_url: string | null
  affiliate_links: Record<string, any>
  is_featured: boolean
  created_at: string
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      pets: {
        Row: Pet
        Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Pet, 'id' | 'created_at' | 'updated_at'>>
      }
      health_records: {
        Row: HealthRecord
        Insert: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>>
      }
      supply_schedules: {
        Row: SupplySchedule
        Insert: Omit<SupplySchedule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SupplySchedule, 'id' | 'created_at' | 'updated_at'>>
      }
      user_devices: {
        Row: UserDevice
        Insert: Omit<UserDevice, 'id' | 'created_at'>
        Update: Partial<Omit<UserDevice, 'id' | 'created_at'>>
      }
      affiliate_products: {
        Row: AffiliateProduct
        Insert: Omit<AffiliateProduct, 'id' | 'created_at'>
        Update: Partial<Omit<AffiliateProduct, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pet_species: PetSpecies
      health_record_type: HealthRecordType
    }
  }
}

// Helper types for type-safe queries
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type exports
export type ProfileRow = Tables<'profiles'>
export type ProfileInsert = Inserts<'profiles'>
export type ProfileUpdate = Updates<'profiles'>

export type PetRow = Tables<'pets'>
export type PetInsert = Inserts<'pets'>
export type PetUpdate = Updates<'pets'>

export type HealthRecordRow = Tables<'health_records'>
export type HealthRecordInsert = Inserts<'health_records'>
export type HealthRecordUpdate = Updates<'health_records'>

export type SupplyScheduleRow = Tables<'supply_schedules'>
export type SupplyScheduleInsert = Inserts<'supply_schedules'>
export type SupplyScheduleUpdate = Updates<'supply_schedules'>

export type UserDeviceRow = Tables<'user_devices'>
export type UserDeviceInsert = Inserts<'user_devices'>
export type UserDeviceUpdate = Updates<'user_devices'>

export type AffiliateProductRow = Tables<'affiliate_products'>
export type AffiliateProductInsert = Inserts<'affiliate_products'>
export type AffiliateProductUpdate = Updates<'affiliate_products'>
