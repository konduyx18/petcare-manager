import { supabase } from '@/lib/supabase'

export async function uploadPetPhoto(
  file: File,
  userId: string,
  petId?: string
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${petId || 'temp'}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    throw new Error('Failed to upload photo. Please try again.')
  }
}

export async function deletePetPhoto(photoUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const pathMatch = photoUrl.split('/pet-photos/')
    
    if (!pathMatch[1]) return

    const { error } = await supabase.storage
      .from('pet-photos')
      .remove([pathMatch[1]])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting photo:', error)
    // Don't throw - deletion is optional
  }
}
