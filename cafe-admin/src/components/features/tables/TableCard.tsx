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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QRCodeDisplay } from './QRCodeDisplay'
import { Pencil, Trash2, QrCode, Users } from 'lucide-react'
import { useToggleTableActive, useDeleteTable } from '@/hooks/useTables'
import { TableService } from '@/services/table.service'
import { toast } from 'sonner'
import type { RestaurantTable } from '@/types/database.types'

interface Props {
  table: RestaurantTable
  onEdit: (table: RestaurantTable) => void
}

export function TableCard({ table, onEdit }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const { mutate: toggleActive } = useToggleTableActive()
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteTable()

  const handleToggle = (checked: boolean) => {
    toast.promise(
      TableService.toggleActive(table.table_id, checked),
      {
        loading: 'Mise à jour...',
        success: checked ? 'Table activée.' : 'Table désactivée.',
        error: 'Erreur lors de la mise à jour.',
      }
    )
    toggleActive({ tableId: table.table_id, isActive: checked })
  }

  const handleDelete = () => {
    toast.promise(
      TableService.delete(table.table_id),
      {
        loading: 'Suppression...',
        success: 'Table supprimée.',
        error: 'Erreur lors de la suppression.',
      }
    )
    setDeleteOpen(false)
  }

  const handleDownloadQR = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      `canvas[aria-label="QR Code table ${table.table_number}"]`
    )
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-table-${table.table_number}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success(`QR Code table ${table.table_number} téléchargé.`)
  }

  return (
    <>
      <Card className={`w-full ${!table.is_active ? 'opacity-60' : ''}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold">Table {table.table_number}</p>
                <Badge variant={table.is_active ? 'default' : 'secondary'}>
                  {table.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {table.table_label && (
                <p className="text-xs text-muted-foreground">{table.table_label}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden="true" />
                <span>{table.capacity} personne(s)</span>
              </div>
            </div>

            {/* QR Code preview bouton */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setQrOpen(true)}
              aria-label={`Voir QR Code table ${table.table_number}`}
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch
                id={`active-${table.table_id}`}
                checked={table.is_active}
                onCheckedChange={handleToggle}
                aria-label={`Table ${table.table_number} active`}
              />
              <label
                htmlFor={`active-${table.table_id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {table.is_active ? 'Active' : 'Inactive'}
              </label>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(table)}
                aria-label={`Modifier table ${table.table_number}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={isDeleting}
                aria-label={`Supprimer table ${table.table_number}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog QR Code */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>QR Code — Table {table.table_number}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <QRCodeDisplay tableNumber={table.table_number} size={200} />
            <Button onClick={handleDownloadQR} className="w-full">
              Télécharger le QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette table ?</AlertDialogTitle>
            <AlertDialogDescription>
              La <span className="font-semibold">Table {table.table_number}</span>{' '}
              sera définitivement supprimée. Cette action est irréversible.
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