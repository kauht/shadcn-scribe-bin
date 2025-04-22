import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Paste } from '@/lib/types'

export const usePaste = (id?: string) => {
  const queryClient = useQueryClient()

  const { data: paste, isLoading, error } = useQuery({
    queryKey: ['paste', id],
    queryFn: async () => {
      if (!id) throw new Error('Invalid paste ID')
      
      const { data, error } = await supabase
        .from('pastes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Paste not found')
        }
        throw error
      }
      
      if (!data) throw new Error('Paste not found')
      
      return data as Paste
    },
    retry: false
  })

  const incrementViewCount = useMutation({
    mutationFn: async (pasteId: string) => {
      const { error } = await supabase.rpc('increment_view_count', {
        paste_id: pasteId
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paste', id] })
    },
    onError: () => {
      toast.error('Failed to update view count')
    }
  })

  const checkPassword = async (password: string) => {
    const { data, error } = await supabase
      .rpc('check_paste_password', {
        paste_id: id,
        password_attempt: password
      })
    
    if (error) throw error
    return data
  }

  return {
    paste,
    isLoading,
    error,
    incrementViewCount: () => incrementViewCount.mutate(id!),
    checkPassword
  }
}
