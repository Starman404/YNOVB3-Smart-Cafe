import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { OrderService } from '@/services/order.service'
import type { Order, ItemStatus } from '@/types/database.types'

export const ORDERS_QUERY_KEY = ['orders'] as const

export function useOrders() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = OrderService.subscribeToOrders(() => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    })
    return () => { void unsubscribe() }
  }, [queryClient])

  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: OrderService.getAll,
  })
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, status }: { orderItemId: number; status: ItemStatus }) =>
      OrderService.updateItemStatus(orderItemId, status),

    onMutate: async ({ orderItemId, status }) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY })
      const previous = queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY)

      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old = []) =>
        old.map((order) => ({
          ...order,
          order_items: order.order_items?.map((item) =>
            item.order_item_id === orderItemId
              ? { ...item, item_status: status }
              : item
          ),
        }))
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(ORDERS_QUERY_KEY, context?.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    },
  })
}