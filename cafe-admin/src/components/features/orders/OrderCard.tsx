'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUpdateItemStatus } from '@/hooks/useOrders'
import { OrderService } from '@/services/order.service'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import type { Order, OrderItem, ItemStatus } from '@/types/database.types'

const NEXT_STATUS: Partial<Record<ItemStatus, ItemStatus>> = {
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'served',
}

const NEXT_STATUS_LABEL: Partial<Record<ItemStatus, string>> = {
  confirmed: 'Préparer',
  preparing: 'Prêt',
  ready:     'Servi',
}

interface Props {
  order: Order
}

export function OrderCard({ order }: Props) {
  const { isPending } = useUpdateItemStatus()
  const [cancelItem, setCancelItem] = useState<OrderItem | null>(null)

  const items = order.order_items ?? []

  const tableLabel = order.restaurant_tables
    ? `Table ${order.restaurant_tables.table_number}`
    : 'Table inconnue'

  const createdAt = format(new Date(order.created_at), 'HH:mm', { locale: fr })

  const handleAdvance = (item: OrderItem) => {
    const nextStatus = NEXT_STATUS[item.item_status]
    const nextLabel = NEXT_STATUS_LABEL[item.item_status]
    if (!nextStatus) return

    toast.promise(
      OrderService.updateItemStatus(item.order_item_id, nextStatus),
      {
        loading: 'Mise à jour...',
        success: `${item.menu_name} → ${nextLabel}`,
        error: 'Erreur lors de la mise à jour.',
      }
    )
  }

  const handleCancelConfirm = () => {
    if (!cancelItem) return
    toast.promise(
      OrderService.cancelItem(cancelItem.order_item_id),
      {
        loading: 'Annulation...',
        success: `${cancelItem.menu_name} annulé.`,
        error: "Erreur lors de l'annulation.",
      }
    )
    setCancelItem(null)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="space-y-0.5">
            <p className="font-bold">{tableLabel}</p>
            <p className="text-xs text-muted-foreground">
              {createdAt} · {items.length} article(s)
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {/* Un article = une ligne avec ses actions */}
          <ul className="space-y-2" aria-label="Articles de la commande">
            {items.map((item) => {
              const nextStatus = NEXT_STATUS[item.item_status]
              const nextLabel = NEXT_STATUS_LABEL[item.item_status]
              const isActionable =
                item.item_status !== 'served' && item.item_status !== 'cancelled'

              return (
                <li
                  key={item.order_item_id}
                  className="flex items-center gap-2 py-1 border-b last:border-0"
                >
                  {/* Nom + note */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.quantity}× {item.menu_name}
                    </p>
                    {item.item_note && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.item_note}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isActionable && (
                    <div className="flex gap-1 shrink-0">
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => handleAdvance(item)}
                          disabled={isPending}
                        >
                          {isPending
                            ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            : nextLabel}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => setCancelItem(item)}
                        disabled={isPending}
                        aria-label={`Annuler ${item.menu_name}`}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  {/* Statut final */}
                  {!isActionable && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.item_status === 'served' ? 'Servi' : 'Annulé'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Dialog annulation */}
      <Dialog open={!!cancelItem} onOpenChange={(o) => !o && setCancelItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cet article ?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{cancelItem?.menu_name}</span> sera
              annulé. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelItem(null)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}