import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface TrackClickData {
  supplyId: string
  affiliate: 'chewy' | 'amazon' | 'petco'
}

/**
 * Track affiliate link clicks for monetization analytics
 * Runs in background without blocking UI
 */
export function useTrackAffiliateClick() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ supplyId, affiliate }: TrackClickData) => {
      if (!user?.id) {
        console.warn('User not authenticated, skipping affiliate click tracking')
        return
      }

      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          user_id: user.id,
          supply_schedule_id: supplyId,
          affiliate_name: affiliate,
          // clicked_at is auto-set by database default
        } as any)

      if (error) {
        // Silently fail - don't disrupt user experience
        console.error('Failed to track affiliate click:', error)
      }
    },
    // Don't show any toasts or UI feedback
    // This should be invisible to the user
    onError: (error) => {
      console.error('Affiliate click tracking error:', error)
    }
  })
}

/**
 * Helper function to handle affiliate link clicks
 * Tracks the click and opens the link in a new tab
 */
export function handleAffiliateClick(
  url: string,
  affiliate: 'chewy' | 'amazon' | 'petco',
  supplyId: string,
  trackClick: ReturnType<typeof useTrackAffiliateClick>
) {
  // Track click (fire and forget - don't wait for response)
  trackClick.mutate({ supplyId, affiliate })

  // Open link immediately (don't wait for tracking to complete)
  window.open(url, '_blank', 'noopener,noreferrer')
}
