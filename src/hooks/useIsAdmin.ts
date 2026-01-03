import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useIsAdmin() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return (data as any)?.is_admin || false
    },
    enabled: !!user,
    staleTime: Infinity // Admin status doesn't change often
  })
}
