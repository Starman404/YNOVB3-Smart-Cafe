import { useQuery } from '@tanstack/react-query'
import { AnalyticsService } from '@/services/analytics.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: AnalyticsService.getDashboardStats,
    refetchInterval: 30_000, // Rafraîchit toutes les 30s
  })
}

export function useWeeklyRevenue() {
  return useQuery({
    queryKey: ['weekly-revenue'],
    queryFn: AnalyticsService.getWeeklyRevenue,
    staleTime: 5 * 60_000,
  })
}

export function useTopItems() {
  return useQuery({
    queryKey: ['top-items'],
    queryFn: AnalyticsService.getTopItems,
    staleTime: 5 * 60_000,
  })
}