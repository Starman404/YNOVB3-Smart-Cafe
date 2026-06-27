import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MenuService } from '@/services/menu.service'
import type { MenuItem } from '@/types/database.types'

export const CATEGORIES_QUERY_KEY = ['categories'] as const
export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const

// Catégories

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: MenuService.getCategories,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, sort }: { name: string; sort: number | null }) =>
      MenuService.createCategory(name, sort),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, sort }: { id: number; name: string; sort: number | null }) =>
      MenuService.updateCategory(id, name, sort),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => MenuService.deleteCategory(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}

// Articles

export function useMenuItems() {
  return useQuery({
    queryKey: MENU_ITEMS_QUERY_KEY,
    queryFn: MenuService.getItems,
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (item: Omit<MenuItem, 'menu_id'>) =>
      MenuService.createItem(item),
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

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (menuId: number) => MenuService.deleteItem(menuId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}

export function useToggleAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, isAvailable }: { menuId: number; isAvailable: boolean }) =>
      MenuService.toggleAvailability(menuId, isAvailable),
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

export function useReorderCategories() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => MenuService.reorderCategories(ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useReorderMenuItems() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => MenuService.reorderItems(ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY })
    },
  })
}