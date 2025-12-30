import { toast } from 'sonner'

/**
 * Converts Supabase errors to user-friendly messages
 */
export function formatSupabaseError(error: any): string {
  const message = error?.message || ''
  const code = error?.code || ''

  // Handle specific error cases
  if (message.includes('duplicate key') || code === '23505') {
    return 'This item already exists'
  }

  if (message.includes('foreign key') || code === '23503') {
    return 'Related item not found'
  }

  if (message.includes('not authenticated') || code === 'PGRST301') {
    return 'Please log in again'
  }

  if (message.includes('permission denied') || message.includes('JWT') || code === '42501') {
    return "You don't have access to this"
  }

  if (code === 'PGRST116') {
    return 'Item not found'
  }

  if (message.includes('violates check constraint')) {
    return 'Invalid data provided'
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Request timed out. Please try again.'
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection.'
  }

  // Return generic message for unknown errors
  return 'Something went wrong. Please try again.'
}

/**
 * Handles query errors by logging and showing toast notification
 */
export function handleQueryError(error: any): void {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Query error:', error)
  }

  // Show user-friendly toast notification
  const message = formatSupabaseError(error)
  toast.error(message)
}

/**
 * Safely extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unknown error occurred'
}

/**
 * Handles mutation errors with custom messages
 */
export function handleMutationError(error: any, customMessage?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Mutation error:', error)
  }

  const message = customMessage || formatSupabaseError(error)
  toast.error(message)
}
