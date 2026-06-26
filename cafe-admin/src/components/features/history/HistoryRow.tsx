'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Order, PaymentStatus } from '@/types/database.types'

const PAYMENT_CONFIG: Record<PaymentStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}> = {
  unpaid:   { label: 'Non payé',  variant: 'secondary' },
  pending:  { label: 'En attente', variant: 'default' },
  paid:     { label: 'Payé',      variant: 'default' },
  refunded: { label: 'Remboursé', variant: 'outline' },
  failed:   { label: 'Échoué',    variant: 'destructive' },
}

interface Props {
  order: Order
}

export function HistoryRow({ order }: Props) {
  const [expanded, setExpanded] = useState(false)

  const tableLabel = order.restaurant_tables
    ? `Table ${order.restaurant_tables.table_number}`
    : 'Table inconnue'

  const createdAt = format(new Date(order.created_at), 'dd MMM yyyy — HH:mm', { locale: fr })
  const payment = PAYMENT_CONFIG[order.payment_status]
  const totalItems = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const activeItems = order.order_items?.filter(
    (i) => i.item_status !== 'cancelled'
  ) ?? []

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Ligne principale */}
      <div className="flex items-center gap-4 px-4 py-3 bg-card">
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <p className="font-semibold text-sm">{tableLabel}</p>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </div>

          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground">Articles</p>
            <p className="text-sm font-medium">{totalItems}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-bold">
              {order.total_amount != null
                ? `${order.total_amount.toFixed(2)} €`
                : '—'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Paiement</p>
            <Badge variant={payment.variant} className="text-xs">
              {payment.label}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Masquer les détails' : 'Voir les détails'}
        >
          {expanded
            ? <ChevronUp className="h-4 w-4" aria-hidden="true" />
            : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>

      {/* Détail articles */}
      {expanded && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <ul className="space-y-1.5">
            {activeItems.map((item) => (
              <li
                key={item.order_item_id}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.quantity}× {item.menu_name}
                  {item.item_note && (
                    <span className="text-xs text-muted-foreground ml-1">
                      — {item.item_note}
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {(item.unit_price * item.quantity).toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}