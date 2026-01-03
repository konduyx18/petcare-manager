import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProductEditForm } from '@/components/admin/ProductEditForm'
import { Search, Plus, Pencil, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { debounce } from '@/utils/debounce'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AffiliateProduct {
  id: string
  name: string
  category: string
  pet_type: string
  description: string
  image_url: string
  is_featured: boolean
  affiliate_links: {
    chewy?: string
    amazon?: string
    petco?: string
  }
  created_at?: string
}

export default function AffiliateProductsManager() {
  // Separate state for input value (updates immediately) and search term (debounced)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [petTypeFilter, setPetTypeFilter] = useState<string>('all')
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<AffiliateProduct | null>(null)

  const queryClient = useQueryClient()

  // Debounced search handler - only updates searchTerm after 300ms of no typing
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  )

  // Update debounced search term when input changes
  useEffect(() => {
    debouncedSetSearchTerm(searchInput)
  }, [searchInput, debouncedSetSearchTerm])

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-affiliate-products', searchTerm, categoryFilter, petTypeFilter],
    queryFn: async () => {
      let query = supabase.from('affiliate_products').select('*')

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      if (petTypeFilter !== 'all') {
        query = query.eq('pet_type', petTypeFilter)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return data as AffiliateProduct[]
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('affiliate_products')
        .delete()
        .eq('id', productId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliate-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
      toast.success('Product deleted successfully')
      setDeletingProduct(null)
    },
    onError: (error) => {
      console.error('Delete failed:', error)
      toast.error('Failed to delete product')
    }
  })

  const handleAddNew = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: AffiliateProduct) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (product: AffiliateProduct) => {
    setDeletingProduct(product)
  }

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading products..." />
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Products Manager</h1>
          <p className="text-gray-600 mt-2">Manage all affiliate products in the system</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Medication">Medication</SelectItem>
                <SelectItem value="Treats">Treats</SelectItem>
                <SelectItem value="Toys">Toys</SelectItem>
                <SelectItem value="Grooming">Grooming</SelectItem>
                <SelectItem value="Supplements">Supplements</SelectItem>
              </SelectContent>
            </Select>

            {/* Pet Type Filter */}
            <Select value={petTypeFilter} onValueChange={setPetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Pet Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pet Types</SelectItem>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products?.length || 0})</CardTitle>
          <CardDescription>Click on a row to edit the product</CardDescription>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Pet Type</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEdit(product)}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.pet_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(product)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(product)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No products found. Try adjusting your filters or add a new product.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Product Dialog */}
      <ProductEditForm
        product={editingProduct as any}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingProduct?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
