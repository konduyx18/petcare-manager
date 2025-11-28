import { useState } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTrackAffiliateClick } from '@/hooks/useAffiliateProducts'
import { getCategoryColor, getPetTypeEmoji, getStoreButtonClass, getStoreName, truncateText } from '@/utils/product-utils'
import type { AffiliateProduct } from '@/types/affiliate'

interface ProductCardProps {
  product: AffiliateProduct
  featured?: boolean
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const trackClick = useTrackAffiliateClick()
  const [imageError, setImageError] = useState(false)

  const handleAffiliateClick = (
    url: string,
    affiliate: 'chewy' | 'amazon' | 'petco',
    productId: string
  ) => {
    // Track click (fire and forget)
    trackClick.mutate({ productId, affiliate })

    // Show toast
    toast.success(`Opening ${getStoreName(affiliate)}...`)

    // Open link immediately (don't wait for tracking)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const affiliateLinks = Object.entries(product.affiliate_links || {}).filter(
    ([_, url]) => url
  ) as [string, string][]

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative ${
        featured ? 'border-2 border-yellow-400' : ''
      }`}
    >
      {/* Featured Badge */}
      {product.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500 text-white border-yellow-600 animate-pulse">
            <Star className="h-3 w-3 mr-1 fill-white" />
            Featured
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {!imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
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
          <Badge className={`${getCategoryColor(product.category)} border`}>
            {product.category}
          </Badge>
          <span className="text-lg" title={`For ${product.pet_type === 'both' ? 'dogs and cats' : product.pet_type + 's'}`}>
            {getPetTypeEmoji(product.pet_type)}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 min-h-[4rem]">
          {truncateText(product.description, 120)}
        </p>

        {/* Affiliate Buttons */}
        <div className="space-y-2 pt-2">
          {affiliateLinks.length > 0 ? (
            affiliateLinks.map(([store, url]) => (
              <Button
                key={store}
                onClick={() => handleAffiliateClick(url, store as 'chewy' | 'amazon' | 'petco', product.id)}
                className={`w-full ${getStoreButtonClass(store)}`}
                aria-label={`Buy ${product.name} on ${getStoreName(store)} (opens in new tab)`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buy on {getStoreName(store)}
              </Button>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              No affiliate links available
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
