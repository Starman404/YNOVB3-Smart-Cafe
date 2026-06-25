import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { OrderService } from '@/services/order.service'
import type { Order, OrderStatus } from '@/types/database.types'

export const ORDERS_QUERY_KEY = ['orders'] as const

export function useOrders() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // On retourne une fonction sync qui lance le removeChannel sans await
    const unsubscribe = OrderService.subscribeToOrders(() => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    })

    return () => {
      // void évite le problème de retour Promise dans le cleanup
      void unsubscribe()
    }
  }, [queryClient])

  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: OrderService.getAll,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      OrderService.updateStatus(orderId, status),

    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY })
      const previous = queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY)

      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old = []) =>
        old.map((o) =>
          o.order_id === orderId ? { ...o, order_status: status } : o
        )
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