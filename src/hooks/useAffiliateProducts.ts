import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { AffiliateProduct, ProductFilters } from '@/types/affiliate'

/**
 * Fetch all affiliate products with optional filters
 */
export function useAffiliateProducts(filters?: Partial<ProductFilters>) {
  return useQuery({
    queryKey: ['affiliate-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('affiliate_products')
        .select('*')

      // Apply category filter
      if (filters?.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category)
      }

      // Apply pet type filter
      if (filters?.petType && filters.petType !== 'all') {
        query = query.or(`pet_type.eq.${filters.petType},pet_type.eq.both`)
      }

      // Apply search filter
      if (filters?.search && filters.search.trim()) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      // Order: featured first, then alphabetically by name
      query = query
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return (data || []) as AffiliateProduct[]
    },
  })
}

/**
 * Fetch featured products only
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['affiliate-products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) throw error
      return (data || []) as AffiliateProduct[]
    },
  })
}

/**
 * Track affiliate click
 */
export function useTrackAffiliateClick() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      productId: _productId, // Renamed with underscore prefix to indicate intentionally unused
      affiliate,
      supplyScheduleId,
      source,
    }: {
      productId?: string
      affiliate: 'chewy' | 'amazon' | 'petco' | 'other'
      supplyScheduleId?: string | null
      source?: 'dashboard' | 'shop_page' | 'supply_page'
    }) => {
      if (!user?.id) {
        console.warn('User not authenticated, skipping click tracking')
        return
      }

      // Note: productId is kept in the signature for API consistency but not used
      // The table schema only has supply_schedule_id, not product_id
      // For shop products, supply_schedule_id will be null
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          user_id: user.id,
          supply_schedule_id: supplyScheduleId || null,
          affiliate_name: affiliate,
          recommendation_source: source || null,
          // clicked_at is auto-set by database default
        } as any)

      if (error) {
        console.error('Error tracking affiliate click:', error)
        throw error
      }
    },
    onError: (error) => {
      // Silently fail - don't block user from clicking link
      console.error('Failed to track affiliate click:', error)
    },
  })
}
