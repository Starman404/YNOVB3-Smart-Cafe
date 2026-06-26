import { useQuery } from '@tanstack/react-query'
import { HistoryService, type HistoryFilters } from '@/services/history.service'

export function useOrderHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ['order-history', filters],
    queryFn: () => HistoryService.getOrders(filters),
    staleTime: 60_000,
  })
}