'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteMenuItem } from '@/hooks/useMenu'
import { MenuService } from '@/services/menu.service'
import { toast } from 'sonner'
import type { Category, MenuItem } from '@/types/database.types'

const LIMITS = {
  menu_name: 100,
  menu_description: 300,
} as const

interface Props {
  item?: MenuItem
  categories: Category[]
  existingNames: string[]
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

export function MenuItemForm({
  item,
  categories,
  existingNames,
  onSubmit,
  onCancel,
  isPending,
}: Props) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem()

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

    const isDuplicate = existingNames
      .filter((n) => !item || n !== item.menu_name)
      .some((n) => n.toLowerCase() === form.menu_name.trim().toLowerCase())

    if (isDuplicate) {
      toast.error('Un article avec ce nom existe déjà.')
      return
    }

    onSubmit({
      ...form,
      menu_description: form.menu_description || null,
    })
  }

  const set = (key: keyof typeof DEFAULT_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleDelete = () => {
    if (!item) return
    toast.promise(
      MenuService.deleteItem(item.menu_id),
      {
        loading: 'Suppression...',
        success: 'Article supprimé.',
        error: 'Erreur lors de la suppression.',
      }
    )
    deleteItem(item.menu_id)
    setDeleteOpen(false)
    onCancel()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nom */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="menu_name">Nom *</Label>
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
              value={form.category_id != null ? form.category_id.toString() : '__none__'}
              onValueChange={(v) => set('category_id', v === '__none__' ? null : Number(v))}
              disabled={isPending}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sans catégorie</SelectItem>
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
              step={0.01}
              value={form.price}
              onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Disponibilité */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="is_available">Disponible</Label>
            <p className="text-xs text-muted-foreground">
              Visible et commandable par les clients
            </p>
          </div>
          <Switch
            id="is_available"
            checked={form.is_available}
            onCheckedChange={(v) => set('is_available', v)}
            disabled={isPending}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {item && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => setDeleteOpen(true)}
              disabled={isPending || isDeleting}
              aria-label="Supprimer l'article"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
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

      {/* Dialog suppression */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{item?.menu_name}</span> sera
              définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}