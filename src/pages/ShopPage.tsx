import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store } from 'lucide-react'

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-600 mt-1">Discover pet products and affiliate deals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-600" />
            Pet Products
          </CardTitle>
          <CardDescription>
            Coming soon: Browse curated pet products and deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shop Coming Soon</h3>
            <p className="text-gray-600 max-w-sm">
              Browse recommended products, compare prices, and find the best deals for your pets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
