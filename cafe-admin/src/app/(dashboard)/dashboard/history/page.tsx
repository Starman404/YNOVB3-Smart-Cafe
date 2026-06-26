'use client'

import { useState } from 'react'
import { useOrderHistory } from '@/hooks/useHistory'
import { HistoryRow } from '@/components/features/history/HistoryRow'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import type { HistoryFilters } from '@/services/history.service'

const today = new Date().toISOString().split('T')[0]

const DEFAULT_FILTERS: HistoryFilters = {
  dateFrom: today,
  dateTo: today,
  paymentStatus: undefined,
  tableId: undefined,
}

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<HistoryFilters>(DEFAULT_FILTERS)

  const { data: orders, isLoading, isError } = useOrderHistory(appliedFilters)

  const set = (key: keyof HistoryFilters, value: unknown) =>
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))

  const handleSearch = () => setAppliedFilters(filters)

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const totalRevenue = orders
    ?.filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Historique</h2>
        <p className="text-muted-foreground text-sm">
          Consultez les commandes passées
        </p>
      </div>

      {/* Filtres */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Du</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => set('dateFrom', e.target.value)}
            max={today}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">Au</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => set('dateTo', e.target.value)}
            max={today}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Statut paiement</Label>
          <Select
            value={filters.paymentStatus ?? ''}
            onValueChange={(v) => set('paymentStatus', v)}
          >
            <SelectTrigger id="paymentStatus">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Non payé</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="refunded">Remboursé</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" aria-hidden="true" />
            Rechercher
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} aria-label="Réinitialiser">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Résumé */}
      {!isLoading && orders && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {orders.length} commande(s) trouvée(s)
          </p>
          {totalRevenue > 0 && (
            <p className="font-semibold">
              Total encaissé : {totalRevenue.toFixed(2)} €
            </p>
          )}
        </div>
      )}

      {isError && (
        <p className="text-destructive text-sm" role="alert">
          Impossible de charger l'historique. Vérifiez votre connexion.
        </p>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          Aucune commande pour cette période.
        </div>
      ) : (
        <div className="space-y-2">
          {orders?.map((order) => (
            <HistoryRow key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}