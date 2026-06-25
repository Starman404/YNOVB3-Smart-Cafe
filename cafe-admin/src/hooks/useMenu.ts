import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MenuService } from '@/services/menu.service'
import type { MenuItem } from '@/types/database.types'

export const CATEGORIES_QUERY_KEY = ['categories'] as const
export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: MenuService.getCategories,
  })
}

export function useMenuItems() {
  return useQuery({
    queryKey: MENU_ITEMS_QUERY_KEY,
    queryFn: MenuService.getItems,
  })
}

export function useToggleAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ menuId, isAvailable }: { menuId: number; isAvailable: boolean }) =>
      MenuService.toggleAvailability(menuId, isAvailable),

    // Optimistic update
    onMutate: async ({ menuId, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
      const previous = queryClient.getQueryData(MENU_ITEMS_QUERY_KEY)

      queryClient.setQueryData(MENU_ITEMS_QUERY_KEY, (old: MenuItem[] = []) =>
        old.map((item) =>
          item.menu_id === menuId ? { ...item, is_available: isAvailable } : item
        )
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(MENU_ITEMS_QUERY_KEY, context?.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (menuId: number) => MenuService.deleteItem(menuId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: Omit<MenuItem, 'menu_id'>) => MenuService.createItem(item),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ menuId, updates }: { menuId: number; updates: Partial<MenuItem> }) =>
      MenuService.updateItem(menuId, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}