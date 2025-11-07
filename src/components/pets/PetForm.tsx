import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoUpload } from './PhotoUpload'
import { petSchema, type PetFormData } from '@/lib/validations/pet.schema'
import { Loader2, Dog, Cat, Bird, Rabbit, Sparkles, Heart, Scale, Barcode } from 'lucide-react'

interface PetFormProps {
  initialData?: Partial<PetFormData> & { id?: string; photo_url?: string }
  onSubmit: (data: PetFormData, photo: File | null) => Promise<void>
  isLoading?: boolean
}

export function PetForm({ initialData, onSubmit, isLoading }: PetFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: initialData?.name || '',
      species: initialData?.species || undefined,
      breed: initialData?.breed || '',
      date_of_birth: initialData?.date_of_birth || '',
      weight_lbs: initialData?.weight_lbs || null,
      microchip_number: initialData?.microchip_number || '',
    },
  })

  const handleSubmit = async (data: PetFormData) => {
    await onSubmit(data, photoFile)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Photo Upload - Make it stand out */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
            📸 Add a cute photo!
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-dashed border-pink-200 rounded-2xl p-6">
            <PhotoUpload
              value={photoFile}
              onChange={setPhotoFile}
              existingPhotoUrl={initialData?.photo_url}
            />
          </div>
        </div>

        {/* Pet Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Pet Name
                <span className="text-pink-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Max, Bella, Luna" 
                  {...field}
                  className="border-2 border-gray-200 focus:border-green-400 focus:ring-green-400 text-lg h-12 rounded-xl"
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
                Choose a name you'll love calling out! 💕
              </FormDescription>
              <FormMessage className="text-red-500 font-medium" />
            </FormItem>
          )}
        />

        {/* Species - With cute icons */}
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                What kind of pet?
                <span className="text-pink-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-green-400 h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectItem value="dog" className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                        <Dog className="h-4 w-4 text-white" />
                      </div>
                      <span>🐕 Dog</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cat" className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg">
                        <Cat className="h-4 w-4 text-white" />
                      </div>
                      <span>🐱 Cat</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rabbit" className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg">
                        <Rabbit className="h-4 w-4 text-white" />
                      </div>
                      <span>🐰 Rabbit</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bird" className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg">
                        <Bird className="h-4 w-4 text-white" />
                      </div>
                      <span>🐦 Bird</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other" className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <span>✨ Other</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 font-medium" />
            </FormItem>
          )}
        />

        {/* Two column layout for breed and birthday */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breed */}
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700">
                  Breed
                  <span className="text-gray-400 text-sm ml-2">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Golden Retriever" 
                    {...field}
                    className="border-2 border-gray-200 focus:border-green-400 h-11 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700">
                  Birthday 🎂
                  <span className="text-gray-400 text-sm ml-2">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    className="border-2 border-gray-200 focus:border-green-400 h-11 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Two column for weight and microchip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight */}
          <FormField
            control={form.control}
            name="weight_lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-500" />
                  Weight (lbs)
                  <span className="text-gray-400 text-sm">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g., 45.5" 
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className="border-2 border-gray-200 focus:border-green-400 h-11 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Microchip Number */}
          <FormField
            control={form.control}
            name="microchip_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-purple-500" />
                  Microchip Number
                  <span className="text-gray-400 text-sm">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 123456789012345" 
                    {...field}
                    className="border-2 border-gray-200 focus:border-green-400 h-11 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button - Make it cheerful */}
        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding your pet...
            </>
          ) : (
            <>
              {initialData?.id ? (
                <>💾 Update Pet</>
              ) : (
                <>🎉 Add My Pet!</>
              )}
            </>
          )}
        </Button>

        {!initialData?.id && (
          <p className="text-center text-sm text-gray-500 italic">
            Can't wait to meet your new friend! 🐾💕
          </p>
        )}
      </form>
    </Form>
  )
}
