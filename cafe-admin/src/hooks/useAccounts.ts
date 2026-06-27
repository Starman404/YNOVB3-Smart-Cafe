import { useQuery } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAll,
    staleTime: 60_000,
  })
}