'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Pencil, Trash2 } from 'lucide-react'
import { useToggleAvailability, useDeleteMenuItem } from '@/hooks/useMenu'
import { toast } from 'sonner'
import { MenuService } from '@/services/menu.service'
import type { MenuItem } from '@/types/database.types'

interface Props {
  item: MenuItem
  onEdit: (item: MenuItem) => void
}

export function MenuItemCard({ item, onEdit }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: toggleAvailability } = useToggleAvailability()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem()

  const handleToggle = (checked: boolean) => {
    toast.promise(
      MenuService.toggleAvailability(item.menu_id, checked),
      {
        loading: 'Mise à jour...',
        success: checked ? 'Article disponible.' : 'Article indisponible.',
        error: 'Erreur lors de la mise à jour.',
      }
    )
    toggleAvailability({ menuId: item.menu_id, isAvailable: checked })
  }

  const handleDelete = () => {
    toast.promise(
      MenuService.deleteItem(item.menu_id),
      {
        loading: 'Suppression...',
        success: 'Article supprimé.',
        error: 'Erreur lors de la suppression.',
      }
    )
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          {/* Infos */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold text-sm">{item.menu_name}</p>
              {item.menu_description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.menu_description}
                </p>
              )}
              {item.categories && (
                <Badge variant="secondary" className="text-xs">
                  {item.categories.category_name}
                </Badge>
              )}
            </div>
            <p className="font-bold text-sm shrink-0">{item.price.toFixed(2)} €</p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch
                id={`available-${item.menu_id}`}
                checked={item.is_available}
                onCheckedChange={handleToggle}
                aria-label={`${item.menu_name} disponible`}
              />
              <label
                htmlFor={`available-${item.menu_id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {item.is_available ? 'Disponible' : 'Indisponible'}
              </label>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(item)}
                aria-label={`Modifier ${item.menu_name}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={isDeleting}
                aria-label={`Supprimer ${item.menu_name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{item.menu_name}</span> sera
              définitivement supprimé du menu. Cette action est irréversible.
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