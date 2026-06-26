'use client'

import { useMemo } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { OrderCard } from '@/components/features/orders/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { ItemStatus, Order } from '@/types/database.types'

const COLUMNS: {
  statuses: ItemStatus[]
  label: string
  color: string
}[] = [
  {
    statuses: ['confirmed'],
    label: 'Nouvelles',
    color: 'border-yellow-400',
  },
  {
    statuses: ['preparing'],
    label: 'En cours',
    color: 'border-blue-400',
  },
  {
    statuses: ['ready'],
    label: 'Prêtes à servir',
    color: 'border-green-400',
  },
]

// Filtre les commandes qui ont au moins un article dans les statuts donnés
function filterOrdersByItemStatus(orders: Order[], statuses: ItemStatus[]): Order[] {
  return orders
    .map((order) => ({
      ...order,
      order_items: order.order_items?.filter((item) =>
        statuses.includes(item.item_status)
      ),
    }))
    .filter((order) => (order.order_items?.length ?? 0) > 0)
}

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders()

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      orders: filterOrdersByItemStatus(orders ?? [], col.statuses),
    }))
  }, [orders])

  const activeCount = useMemo(() => {
    return (orders ?? []).filter((o) =>
      o.order_items?.some((i) =>
        ['confirmed', 'preparing', 'ready'].includes(i.item_status)
      )
    ).length
  }, [orders])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Commandes</h2>
        <p className="text-muted-foreground text-sm">
          Temps réel · {activeCount} table(s) avec des articles en cours
        </p>
      </div>

      {isError && (
        <p className="text-destructive text-sm" role="alert">
          Impossible de charger les commandes. Vérifiez votre connexion.
        </p>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col gap-3">
            {/* Header colonne */}
            <div className={`border-t-4 ${col.color} rounded-t-md pt-3`}>
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  {col.label}
                </h3>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {isLoading ? '…' : col.orders.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 min-h-32">
              {isLoading ? (
                <>
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </>
              ) : col.orders.length === 0 ? (
                <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed text-muted-foreground text-sm">
                  Aucun article
                </div>
              ) : (
                col.orders.map((order) => (
                  <OrderCard key={`${order.order_id}-${col.label}`} order={order} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}