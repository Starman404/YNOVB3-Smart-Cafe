'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { RestaurantTable } from '@/types/database.types'

const LIMITS = {
  table_label: 50,
} as const

interface Props {
  table?: RestaurantTable
  onSubmit: (data: Omit<RestaurantTable, 'table_id'>) => void
  onCancel: () => void
  isPending: boolean
}

const DEFAULT_FORM = {
  table_number: 1,
  table_label: '',
  capacity: 2,
  is_active: true,
}

export function TableForm({ table, onSubmit, onCancel, isPending }: Props) {
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (table) {
      setForm({
        table_number: table.table_number,
        table_label: table.table_label ?? '',
        capacity: table.capacity,
        is_active: table.is_active,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [table])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      table_label: form.table_label || null,
    })
  }

  const set = (key: keyof typeof DEFAULT_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Numéro de table */}
      <div className="space-y-2">
        <Label htmlFor="table_number">Numéro de table *</Label>
        <Input
          id="table_number"
          type="number"
          min={1}
          value={form.table_number}
          onChange={(e) => set('table_number', parseInt(e.target.value) || 1)}
          required
          disabled={isPending || !!table}
        />
        {table && (
          <p className="text-xs text-muted-foreground">
            Le numéro ne peut pas être modifié.
          </p>
        )}
      </div>

      {/* Label personnalisé */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="table_label">Nom personnalisé</Label>
          <span className={`text-xs ${form.table_label.length >= LIMITS.table_label ? 'text-destructive' : 'text-muted-foreground'}`}>
            {form.table_label.length}/{LIMITS.table_label}
          </span>
        </div>
        <Input
          id="table_label"
          value={form.table_label}
          onChange={(e) => set('table_label', e.target.value.slice(0, LIMITS.table_label))}
          placeholder="Ex: Terrasse, Salle VIP..."
          disabled={isPending}
          maxLength={LIMITS.table_label}
        />
      </div>

      {/* Capacité */}
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacité (personnes) *</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          max={20}
          value={form.capacity}
          onChange={(e) => set('capacity', parseInt(e.target.value) || 1)}
          required
          disabled={isPending}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isPending || form.table_number < 1}
          className="flex-1"
        >
          {isPending
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            : table ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}