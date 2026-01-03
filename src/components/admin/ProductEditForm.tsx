import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['Food', 'Medication', 'Treats', 'Toys', 'Grooming', 'Supplements'], {
    message: 'Category is required'
  }),
  pet_type: z.enum(['dog', 'cat', 'both'], {
    message: 'Pet type is required'
  }),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().url('Must be a valid URL').min(1, 'Image URL is required'),
  is_featured: z.boolean(),
  chewy_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  amazon_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  petco_url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductEditFormProps {
  product?: {
    id: string
    name: string
    category: 'Food' | 'Medication' | 'Treats' | 'Toys' | 'Grooming' | 'Supplements'
    pet_type: 'dog' | 'cat' | 'both'
    description: string
    image_url: string
    is_featured: boolean
    affiliate_links: {
      chewy?: string
      amazon?: string
      petco?: string
    }
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ProductEditForm({ product, open, onOpenChange, onSuccess }: ProductEditFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'Food' as const,
      pet_type: 'both' as const,
      description: '',
      image_url: '',
      is_featured: false,
      chewy_url: '',
      amazon_url: '',
      petco_url: ''
    }
  })

  // Reset form when product changes (for edit mode) or when dialog opens/closes
  useEffect(() => {
    if (open && product) {
      // Edit mode - populate with product data
      form.reset({
        name: product.name,
        category: product.category,
        pet_type: product.pet_type,
        description: product.description,
        image_url: product.image_url,
        is_featured: product.is_featured,
        // Access JSONB affiliate_links field correctly
        chewy_url: product.affiliate_links?.chewy || '',
        amazon_url: product.affiliate_links?.amazon || '',
        petco_url: product.affiliate_links?.petco || ''
      })
    } else if (open && !product) {
      // Add mode - reset to empty
      form.reset({
        name: '',
        category: 'Food' as const,
        pet_type: 'both' as const,
        description: '',
        image_url: '',
        is_featured: false,
        chewy_url: '',
        amazon_url: '',
        petco_url: ''
      })
    }
  }, [product, open, form])

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('Form data received:', data)
      console.log('🔍 Product object:', product)
      console.log('🔍 Product ID:', product?.id)
      
      // Transform form data to match database schema with JSONB affiliate_links
      const productData = {
        name: data.name,
        category: data.category,
        pet_type: data.pet_type,
        description: data.description,
        image_url: data.image_url,
        is_featured: data.is_featured,
        // Save affiliate links as JSONB object
        affiliate_links: {
          chewy: data.chewy_url || undefined,
          amazon: data.amazon_url || undefined,
          petco: data.petco_url || undefined
        }
      }

      console.log('Sending to Supabase:', productData)

      if (product?.id) {
        // Check if product exists first
        const { data: existingProduct, error: checkError } = await (supabase
          .from('affiliate_products') as any)
          .select('*')
          .eq('id', product.id)
          .single()
        
        console.log('🔍 Existing product in DB:', existingProduct)
        console.log('🔍 Check error:', checkError)
        
        if (checkError) {
          console.error('❌ Error checking product existence:', checkError)
        }
        
        if (!existingProduct) {
          console.error('❌ Product not found in database!')
          throw new Error('Product not found in database')
        }

        // Update existing product
        const { data: result, error } = await (supabase
          .from('affiliate_products') as any)
          .update(productData)
          .eq('id', product.id)
          .select()

        console.log('Supabase update response:', result, error)
        
        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        
        if (!result || result.length === 0) {
          console.error('❌ Update returned empty array - product may not exist or RLS blocked')
          throw new Error('Failed to update product - no rows affected. This may be an RLS policy issue.')
        }
        
        console.log('✅ Product updated successfully:', result[0])
      } else {
        // Insert new product
        const { data: result, error } = await (supabase
          .from('affiliate_products') as any)
          .insert([productData])
          .select()

        console.log('Supabase insert response:', result, error)
        
        if (error) {
          console.error('❌ Supabase insert error:', error)
          throw error
        }
        
        if (!result || result.length === 0) {
          console.error('❌ Insert returned empty array')
          throw new Error('Failed to insert product - no rows returned')
        }
        
        console.log('✅ Product inserted successfully:', result[0])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliate-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-products'] })
      toast.success(product ? 'Product updated successfully' : 'Product created successfully')
      form.reset()
      onSuccess()
    },
    onError: (error) => {
      console.error('Save failed:', error)
      toast.error('Failed to save product')
    }
  })

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the product details below' : 'Fill in the details to create a new affiliate product'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blue Buffalo Dog Food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Pet Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Treats">Treats</SelectItem>
                        <SelectItem value="Toys">Toys</SelectItem>
                        <SelectItem value="Grooming">Grooming</SelectItem>
                        <SelectItem value="Supplements">Supplements</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pet_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pet type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the product benefits and features..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/product-image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>Paste the full URL of the product image</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Featured */}
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>
                      Featured products get priority in recommendations
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Affiliate Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Affiliate Links</h3>
              
              <FormField
                control={form.control}
                name="chewy_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chewy URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.chewy.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amazon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.amazon.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="petco_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Petco URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.petco.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
