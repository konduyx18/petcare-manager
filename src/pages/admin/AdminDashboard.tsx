import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNavigate } from '@tanstack/react-router'
import { Package, MousePointerClick, TrendingUp, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DashboardStats {
  totalProducts: number
  totalClicks: number
  topProducts: Array<{ product_name: string; click_count: number }>
  clicksByCategory: Array<{ category: string; clicks: number }>
  estimatedRevenue: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from('affiliate_products')
        .select('*', { count: 'exact', head: true })

      // Get total clicks
      const { count: totalClicks } = await supabase
        .from('affiliate_clicks')
        .select('*', { count: 'exact', head: true })

      // Get top 5 clicked products
      const { data: clickData } = await supabase
        .from('affiliate_clicks')
        .select('product_id, affiliate_products(name)')
        .order('clicked_at', { ascending: false })

      // Group by product and count
      const productClickMap = new Map<string, { name: string; count: number }>()
      clickData?.forEach((click: any) => {
        const productName = click.affiliate_products?.name || 'Unknown'
        const existing = productClickMap.get(productName)
        if (existing) {
          existing.count++
        } else {
          productClickMap.set(productName, { name: productName, count: 1 })
        }
      })

      const topProducts = Array.from(productClickMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(p => ({ product_name: p.name, click_count: p.count }))

      // Get clicks by category
      const { data: categoryClicks } = await supabase
        .from('affiliate_clicks')
        .select('product_id, affiliate_products(category)')

      const categoryMap = new Map<string, number>()
      categoryClicks?.forEach((click: any) => {
        const category = click.affiliate_products?.category || 'Unknown'
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })

      const clicksByCategory = Array.from(categoryMap.entries())
        .map(([category, clicks]) => ({ category, clicks }))
        .sort((a, b) => b.clicks - a.clicks)

      // Calculate estimated revenue
      // Assumptions: 5% conversion rate, $50 avg order value, 5% commission
      const estimatedRevenue = (totalClicks || 0) * 0.05 * 50 * 0.05

      return {
        totalProducts: totalProducts || 0,
        totalClicks: totalClicks || 0,
        topProducts,
        clicksByCategory,
        estimatedRevenue
      }
    }
  })

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage affiliate products and view analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Active affiliate products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">All-time affiliate clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProducts && stats.totalClicks
                ? ((stats.totalClicks / stats.totalProducts) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Clicks per product</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.estimatedRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">5% conv. × $50 avg × 5% comm.</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Clicks by Category</CardTitle>
            <CardDescription>Distribution of affiliate clicks across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.clicksByCategory && stats.clicksByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.clicksByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#22c55e" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No click data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clicked Products</CardTitle>
            <CardDescription>Most popular affiliate products by click count</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{product.product_name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{product.click_count} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500">
                No click data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your affiliate products and analytics</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate({ to: '/admin/products' })}>
            <Package className="mr-2 h-4 w-4" />
            Manage Products
          </Button>
          <Button variant="outline" disabled>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
