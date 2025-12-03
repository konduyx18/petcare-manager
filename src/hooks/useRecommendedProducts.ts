import { useQuery } from '@tanstack/react-query'
import { getRecommendedProducts } from '@/utils/recommendation-engine'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hook to fetch personalized product recommendations
 */
export function useRecommendedProducts(limit?: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recommended-products', user?.id, limit],
    queryFn: async () => {
      if (!user) return []
      
      const products = await getRecommendedProducts(user.id)
      return limit ? products.slice(0, limit) : products
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes (recommendations don't change frequently)
  })
}
