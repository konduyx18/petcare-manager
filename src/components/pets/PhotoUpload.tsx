import { useState, useCallback, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PhotoUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  error?: string
  existingPhotoUrl?: string
}

export function PhotoUpload({ onChange, error, existingPhotoUrl }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingPhotoUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, or WEBP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    onChange(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-2">
      {preview ? (
        // Preview with remove button
        <div className="relative">
          <img
            src={preview}
            alt="Pet preview"
            className="w-full h-64 object-cover rounded-xl shadow-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Drag & drop zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer group",
            isDragging
              ? "border-green-400 bg-green-50"
              : "border-pink-200 bg-white hover:border-pink-300 hover:bg-pink-50/50",
            error && "border-red-500"
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full group-hover:from-pink-200 group-hover:to-rose-200 transition-colors">
              <Upload className="h-12 w-12 text-pink-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                Drop your pet's photo here! 📸
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPEG, PNG, or WEBP • Max 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
