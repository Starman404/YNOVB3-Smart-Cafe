import { createClient } from '@/lib/supabase/client'
import type { Account } from '@/types/database.types'

export const AccountService = {
  async getAll(): Promise<Account[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },
}