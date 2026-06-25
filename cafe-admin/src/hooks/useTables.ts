import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TableService } from '@/services/table.service'
import type { RestaurantTable } from '@/types/database.types'

export const TABLES_QUERY_KEY = ['tables'] as const

export function useTables() {
  return useQuery({
    queryKey: TABLES_QUERY_KEY,
    queryFn: TableService.getAll,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (table: Omit<RestaurantTable, 'table_id'>) =>
      TableService.create(table),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY })
    },
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tableId, updates }: { tableId: number; updates: Partial<RestaurantTable> }) =>
      TableService.update(tableId, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY })
    },
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tableId: number) => TableService.delete(tableId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY })
    },
  })
}

export function useToggleTableActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tableId, isActive }: { tableId: number; isActive: boolean }) =>
      TableService.toggleActive(tableId, isActive),

    // Optimistic update
    onMutate: async ({ tableId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: TABLES_QUERY_KEY })
      const previous = queryClient.getQueryData(TABLES_QUERY_KEY)

      queryClient.setQueryData(TABLES_QUERY_KEY, (old: RestaurantTable[] = []) =>
        old.map((t) =>
          t.table_id === tableId ? { ...t, is_active: isActive } : t
        )
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(TABLES_QUERY_KEY, context?.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY })
    },
  })
}