import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

interface UploadResult {
  full: string
  thumbnail: string
}

export async function uploadPetPhoto(
  file: File,
  userId: string,
  petId?: string
): Promise<UploadResult> {
  try {
    // Generate unique ID for this upload
    const uploadId = petId || crypto.randomUUID()
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    console.log('🖼️ Starting image upload...')
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    // Compress full-size image (1024px max, 1MB max)
    console.log('⏳ Compressing full-size image...')
    const compressedFull = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: 'image/jpeg',
    })
    console.log('✅ Full-size compressed:', (compressedFull.size / 1024 / 1024).toFixed(2), 'MB')

    // Create thumbnail (256px, 100KB max)
    console.log('⏳ Creating thumbnail...')
    const compressedThumb = await imageCompression(file, {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 256,
      useWebWorker: true,
      fileType: 'image/jpeg',
    })
    console.log('✅ Thumbnail created:', (compressedThumb.size / 1024).toFixed(2), 'KB')

    // Upload paths
    const fullPath = `${userId}/${uploadId}/full_${timestamp}.${ext}`
    const thumbPath = `${userId}/${uploadId}/thumb_${timestamp}.${ext}`

    console.log('⏳ Uploading to Supabase Storage...')

    // Upload both images in parallel
    const [fullUpload, thumbUpload] = await Promise.all([
      supabase.storage.from('pet-photos').upload(fullPath, compressedFull, {
        cacheControl: '3600',
        upsert: true,
      }),
      supabase.storage.from('pet-photos').upload(thumbPath, compressedThumb, {
        cacheControl: '3600',
        upsert: true,
      }),
    ])

    if (fullUpload.error) {
      console.error('❌ Full image upload error:', fullUpload.error)
      throw new Error('Failed to upload full-size image')
    }

    if (thumbUpload.error) {
      console.error('❌ Thumbnail upload error:', thumbUpload.error)
      throw new Error('Failed to upload thumbnail')
    }

    // Get public URLs
    const { data: { publicUrl: fullUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(fullPath)

    const { data: { publicUrl: thumbUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(thumbPath)

    console.log('✅ Upload successful!')
    console.log('Full URL:', fullUrl)
    console.log('Thumbnail URL:', thumbUrl)

    return {
      full: fullUrl,
      thumbnail: thumbUrl,
    }
  } catch (error) {
    console.error('❌ Upload error:', error)
    throw error
  }
}

export async function deletePetPhotos(photoUrl: string, thumbnailUrl?: string): Promise<void> {
  try {
    const deletePromises = []

    // Extract path from full URL
    if (photoUrl) {
      const fullPathParts = photoUrl.split('/pet-photos/')
      if (fullPathParts[1]) {
        console.log('🗑️ Deleting old full-size photo:', fullPathParts[1])
        deletePromises.push(
          supabase.storage.from('pet-photos').remove([fullPathParts[1]])
        )
      }
    }

    // Extract path from thumbnail URL
    if (thumbnailUrl) {
      const thumbPathParts = thumbnailUrl.split('/pet-photos/')
      if (thumbPathParts[1]) {
        console.log('🗑️ Deleting old thumbnail:', thumbPathParts[1])
        deletePromises.push(
          supabase.storage.from('pet-photos').remove([thumbPathParts[1]])
        )
      }
    }

    await Promise.all(deletePromises)
    console.log('✅ Old photos deleted')
  } catch (error) {
    console.error('⚠️ Error deleting photos:', error)
  }
}
