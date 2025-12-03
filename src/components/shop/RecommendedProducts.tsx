import { useState } from 'react'
import { ExternalLink, Package, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecommendedProducts } from '@/hooks/useRecommendedProducts'
import { useTrackAffiliateClick } from '@/hooks/useAffiliateProducts'
import { getCategoryColor, getPetTypeEmoji, getStoreButtonClass, getStoreName, truncateText } from '@/utils/product-utils'

interface RecommendedProductsProps {
  limit?: number
  source: 'dashboard' | 'shop_page'
}

export default function RecommendedProducts({ limit = 6, source }: RecommendedProductsProps) {
  const { data: recommendations, isLoading } = useRecommendedProducts(limit)
  const trackClick = useTrackAffiliateClick()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleAffiliateClick = (
    url: string,
    affiliate: 'chewy' | 'amazon' | 'petco',
    productId: string
  ) => {
    // Track click with source
    trackClick.mutate({ productId, affiliate, source })

    // Show toast
    toast.success(`Opening ${getStoreName(affiliate)}...`)

    // Open link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {source === 'dashboard' ? 'Recommended for Your Pets' : 'Recommended Based on Your Pets'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit > 4 ? 6 : 4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No Recommendations Yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add pets and supplies to get personalized product recommendations!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {source === 'dashboard' ? '✨ Recommended for Your Pets' : '✨ Recommended Based on Your Pets'}
        </h2>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {recommendations.map(({ product, reason }) => {
          const affiliateLinks = Object.entries(product.affiliate_links || {}).filter(
            ([_, url]) => url
          ) as [string, string][]

          return (
            <Card
              key={product.id}
              className="overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {!imageErrors[product.id] ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{getPetTypeEmoji(product.pet_type)}</div>
                      <p className="text-sm">Image unavailable</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Category and Pet Type */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getCategoryColor(product.category)} border text-xs`}>
                    {product.category}
                  </Badge>
                  <span className="text-base" title={`For ${product.pet_type === 'both' ? 'dogs and cats' : product.pet_type + 's'}`}>
                    {getPetTypeEmoji(product.pet_type)}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-base text-gray-900 line-clamp-2 min-h-[2.5rem]">
                  {truncateText(product.name, 60)}
                </h3>

                {/* Recommendation Reason */}
                <p className="text-sm italic text-gray-500">
                  {reason}
                </p>

                {/* Affiliate Buttons */}
                <div className="space-y-2">
                  {affiliateLinks.length > 0 ? (
                    affiliateLinks.slice(0, 2).map(([store, url]) => (
                      <Button
                        key={store}
                        onClick={() => handleAffiliateClick(url, store as 'chewy' | 'amazon' | 'petco', product.id)}
                        className={`w-full text-sm ${getStoreButtonClass(store)}`}
                        size="sm"
                        aria-label={`Buy ${product.name} on ${getStoreName(store)} (opens in new tab)`}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Buy on {getStoreName(store)}
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">
                      No links available
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
