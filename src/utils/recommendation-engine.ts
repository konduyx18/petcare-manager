import { supabase } from '@/lib/supabase'
import type { AffiliateProduct } from '@/types/affiliate'

export interface UserContext {
  userId: string
  petTypes: ('dog' | 'cat' | 'both')[]
  petNames: string[]
  supplyCategories: string[]
  trackedProductNames: string[]
  hasHealthRecords: boolean
}

interface ProductScore {
  product: AffiliateProduct
  score: number
  reason: string
}

/**
 * Calculate relevance score for a product based on user context
 */
function calculateRelevanceScore(product: AffiliateProduct, userContext: UserContext): number {
  let score = 0

  // Pet type match (+10 points)
  if (userContext.petTypes.includes(product.pet_type) || product.pet_type === 'both') {
    score += 10
  }

  // Category match (+5 points per existing supply in same category)
  const categoryCount = userContext.supplyCategories.filter(c => c === product.category).length
  score += categoryCount * 5

  // Health needs match (+8 points)
  // If user has health records for vaccinations/medications and product is in Medication/Supplements
  if (userContext.hasHealthRecords && ['Medication', 'Supplements'].includes(product.category)) {
    score += 8
  }

  // Featured products bonus (+3 points)
  if (product.is_featured) {
    score += 3
  }

  // Already tracked penalty (-100 points, effectively filters out)
  if (userContext.trackedProductNames.some(name =>
    product.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(product.name.toLowerCase())
  )) {
    score -= 100
  }

  return score
}

/**
 * Get human-readable recommendation reason
 */
export function getRecommendationReason(product: AffiliateProduct, userContext: UserContext): string {
  // Pet type match
  if (userContext.petTypes.includes(product.pet_type) || product.pet_type === 'both') {
    const petName = userContext.petNames[0] || 'your pet'
    const petTypeLabel = product.pet_type === 'dog' ? 'dog' : product.pet_type === 'cat' ? 'cat' : 'pet'
    return `Recommended for ${petName} (${petTypeLabel})`
  }

  // Category match
  const categoryCount = userContext.supplyCategories.filter(c => c === product.category).length
  if (categoryCount > 0) {
    return `Based on your ${product.category} purchases`
  }

  // Health needs match
  if (userContext.hasHealthRecords && ['Medication', 'Supplements'].includes(product.category)) {
    const petName = userContext.petNames[0] || 'your pet'
    return `May help with ${petName}'s health needs`
  }

  // Featured products
  if (product.is_featured) {
    return 'Popular with pet owners'
  }

  // Generic fallback
  return 'Great choice for your pet'
}

/**
 * Fetch user context (pets, supplies, health records)
 */
async function getUserContext(userId: string): Promise<UserContext> {
  // Fetch user's pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species')
    .eq('user_id', userId)

  const petTypes = pets?.map((p: any) => p.species.toLowerCase() as 'dog' | 'cat') || []
  const petNames = pets?.map((p: any) => p.name) || []

  // Fetch user's supply schedules
  const { data: supplies } = await supabase
    .from('supply_schedules')
    .select('category, product_name, pets!inner(user_id)')
    .eq('pets.user_id', userId)

  const supplyCategories = supplies?.map((s: any) => s.category) || []
  const trackedProductNames = supplies?.map((s: any) => s.product_name) || []

  // Check if user has health records
  const { data: healthRecords } = await supabase
    .from('health_records')
    .select('id, pets!inner(user_id)')
    .eq('pets.user_id', userId)
    .limit(1)

  const hasHealthRecords = (healthRecords?.length || 0) > 0

  return {
    userId,
    petTypes,
    petNames,
    supplyCategories,
    trackedProductNames,
    hasHealthRecords,
  }
}

/**
 * Get recommended products for a user
 */
export async function getRecommendedProducts(userId: string): Promise<ProductScore[]> {
  // Get user context
  const userContext = await getUserContext(userId)

  // If user has no pets, return empty array
  if (userContext.petTypes.length === 0) {
    return []
  }

  // Fetch all products
  const { data: products, error } = await supabase
    .from('affiliate_products')
    .select('*')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  if (!products || products.length === 0) {
    return []
  }

  // Score each product
  const scoredProducts: ProductScore[] = products.map(product => ({
    product: product as AffiliateProduct,
    score: calculateRelevanceScore(product as AffiliateProduct, userContext),
    reason: getRecommendationReason(product as AffiliateProduct, userContext),
  }))

  // Filter out products with negative scores (already tracked)
  const filteredProducts = scoredProducts.filter(p => p.score > 0)

  // Sort by score (descending)
  filteredProducts.sort((a, b) => b.score - a.score)

  // Return top 6 products
  return filteredProducts.slice(0, 6)
}
