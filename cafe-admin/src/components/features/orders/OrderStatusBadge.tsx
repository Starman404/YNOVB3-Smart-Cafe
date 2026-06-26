import { Badge } from '@/components/ui/badge'
import type { ItemStatus } from '@/types/database.types'

const STATUS_CONFIG: Record<ItemStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}> = {
  pending:   { label: 'Panier',    variant: 'secondary' },
  confirmed: { label: 'Nouvelle',  variant: 'default' },
  preparing: { label: 'En cours',  variant: 'default' },
  ready:     { label: 'Prête',     variant: 'default' },
  served:    { label: 'Servie',    variant: 'outline' },
  cancelled: { label: 'Annulée',   variant: 'destructive' },
}

interface Props {
  status: ItemStatus
}

export function OrderStatusBadge({ status }: Props) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}