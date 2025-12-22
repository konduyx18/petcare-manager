import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface TrackAffiliateClickData {
  supply_schedule_id: string
  affiliate_name: 'chewy' | 'amazon' | 'petco'
  affiliate_url: string
}

/**
 * Track affiliate link clicks and open URL in new tab
 */
export function useTrackAffiliateClick() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ supply_schedule_id, affiliate_name, affiliate_url }: TrackAffiliateClickData) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Insert click tracking record
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          user_id: user.id,
          supply_schedule_id,
          affiliate_name,
          clicked_at: new Date().toISOString()
        } as any)

      if (error) {
        console.error('Error tracking affiliate click:', error)
        // Don't throw - we still want to open the URL even if tracking fails
      }

      // Open affiliate URL in new tab
      window.open(affiliate_url, '_blank', 'noopener,noreferrer')

      return { affiliate_name }
    },
    onSuccess: (data) => {
      const storeName = data.affiliate_name.charAt(0).toUpperCase() + data.affiliate_name.slice(1)
      toast.success(`Opening ${storeName}...`)
    },
    onError: (error: Error) => {
      console.error('Error with affiliate link:', error)
      toast.error('Failed to open link. Please try again.')
    }
  })
}
