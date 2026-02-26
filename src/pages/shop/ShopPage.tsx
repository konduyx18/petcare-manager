import { useState, useMemo, useEffect, useRef } from 'react'
import { Store, Package, Search, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAffiliateProducts, useFeaturedProducts } from '@/hooks/useAffiliateProducts'
import ProductCard from '@/components/shop/ProductCard'
import RecommendedProducts from '@/components/shop/RecommendedProducts'
import type { ProductFilters } from '@/types/affiliate'
import { useSearch } from '@tanstack/react-router'

const categories = [
  'All Categories',
  'Food',
  'Medication',
  'Treats',
  'Grooming',
  'Toys',
  'Supplements',
  'Other',
]

export default function ShopPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'All Categories',
    petType: 'all',
    search: '',
  })

  // Get search params for product highlighting
  const search = useSearch({ from: '/shop' })
  const highlightProductId = (search as any)?.product
  const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts()
  const { data: products, isLoading: productsLoading } = useAffiliateProducts(filters)

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      category: 'All Categories',
      petType: 'all',
      search: '',
    })
  }

  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== 'All Categories' ||
      filters.petType !== 'all' ||
      filters.search.trim() !== ''
    )
  }, [filters])

  const isLoading = productsLoading || featuredLoading

  // Debug: Log filter changes
  useEffect(() => {
    console.log('🔍 Shop Filters Changed:', {
      petType: filters.petType,
      category: filters.category,
      search: filters.search,
      productsCount: products?.length || 0
    })
  }, [filters, products])

  // Auto-scroll and highlight product when coming from supply link
  useEffect(() => {
    // Don't run if products aren't loaded yet
    if (!products || products.length === 0) {
      console.log('⏳ Waiting for products to load...')
      return
    }
    
    // Don't run if no highlight requested
    if (!highlightProductId) {
      console.log('ℹ️ No product to highlight')
      return
    }
    
    console.log('🔍 DEBUG: highlightProductId =', highlightProductId)
    console.log('🔍 DEBUG: products loaded =', products.length)
    console.log('🔍 DEBUG: productRefs.current =', productRefs.current)
    console.log('🔍 DEBUG: Looking for ref:', highlightProductId)
    
    // Small delay to ensure refs are set after render
    setTimeout(() => {
      if (highlightProductId && productRefs.current[highlightProductId]) {
        const element = productRefs.current[highlightProductId]
        console.log('🔍 DEBUG: Found element to highlight:', element)
        
        // Scroll to product
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        console.log('✅ Scrolled to element')
        
        // Add highlight animation
        element.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2', 'animate-pulse')
        console.log('✅ Added classes: ring-4, ring-blue-500, ring-offset-2, animate-pulse')
        console.log('🔍 DEBUG: Element classes after adding:', element.className)
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2', 'animate-pulse')
          console.log('✅ Removed highlight classes after 3 seconds')
        }, 3000)
      } else {
        console.log('❌ DEBUG: Element NOT found for highlighting')
        console.log('   - highlightProductId exists?', !!highlightProductId)
        console.log('   - Ref exists for this product?', !!productRefs.current[highlightProductId])
        console.log('   - All available refs:', Object.keys(productRefs.current))
      }
    }, 100) // Wait 100ms for refs to be set
  }, [highlightProductId, products])

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-full">
            <Store className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Shop</h1>
            <p className="text-blue-100">Discover products recommended for your pets</p>
          </div>
        </div>
        
        {!isLoading && products && (
          <div className="mt-4 text-sm text-blue-100">
            {products.length} product{products.length !== 1 ? 's' : ''} available
            {hasActiveFilters && (
              <span className="ml-2">
                (filtered)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">⭐ Featured Products</h2>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommended Products */}
      <RecommendedProducts limit={6} source="shop_page" />

      {/* Filter Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Pet Type Tabs */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Pet Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Pets', emoji: '🐾' },
                { value: 'dog', label: 'Dogs', emoji: '🐕' },
                { value: 'cat', label: 'Cats', emoji: '🐱' },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  variant={filters.petType === tab.value ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('petType', tab.value)}
                  className="flex items-center gap-2"
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category and Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-10"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Products Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Products</h2>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                ref={(el) => { 
                  productRefs.current[product.id] = el 
                  console.log('🔍 DEBUG: Set ref for product:', product.id, product.name)
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
