'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Category, MenuItem } from '@/types/database.types'

const LIMITS = {
  menu_name: 50,
  menu_description: 200,
} as const

interface Props {
  item?: MenuItem
  categories: Category[]
  onSubmit: (data: Omit<MenuItem, 'menu_id'>) => void
  onCancel: () => void
  isPending: boolean
}

const DEFAULT_FORM = {
  menu_name: '',
  menu_description: '',
  category_id: null as number | null,
  price: 0,
  menu_sort: null as number | null,
  is_available: true,
}

export function MenuItemForm({ item, categories, onSubmit, onCancel, isPending }: Props) {
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (item) {
      setForm({
        menu_name: item.menu_name,
        menu_description: item.menu_description ?? '',
        category_id: item.category_id,
        price: item.price,
        menu_sort: item.menu_sort,
        is_available: item.is_available,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      menu_image: null,
      menu_description: form.menu_description || null,
    })
  }

  const set = (key: keyof typeof DEFAULT_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Nom */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="menu_name">Nom de l'article *</Label>
          <span className={`text-xs ${form.menu_name.length >= LIMITS.menu_name ? 'text-destructive' : 'text-muted-foreground'}`}>
            {form.menu_name.length}/{LIMITS.menu_name}
          </span>
        </div>
        <Input
          id="menu_name"
          value={form.menu_name}
          onChange={(e) => set('menu_name', e.target.value.slice(0, LIMITS.menu_name))}
          placeholder="Ex: Croissant au beurre"
          required
          disabled={isPending}
          maxLength={LIMITS.menu_name}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="menu_description">Description</Label>
          <span className={`text-xs ${form.menu_description.length >= LIMITS.menu_description ? 'text-destructive' : 'text-muted-foreground'}`}>
            {form.menu_description.length}/{LIMITS.menu_description}
          </span>
        </div>
        <textarea
          id="menu_description"
          value={form.menu_description}
          onChange={(e) => set('menu_description', e.target.value.slice(0, LIMITS.menu_description))}
          placeholder="Ex: Croissant pur beurre, feuilletage traditionnel"
          disabled={isPending}
          maxLength={LIMITS.menu_description}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {/* Catégorie + Prix */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select
            value={form.category_id?.toString() ?? ''}
            onValueChange={(v) => set('category_id', v ? Number(v) : null)}
            disabled={isPending}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                  {cat.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1.00}
            value={form.price}
            onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
            required
            disabled={isPending}
          />
        </div>
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
          disabled={isPending || !form.menu_name || form.price <= 0}
          className="flex-1"
        >
          {isPending
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            : item ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}