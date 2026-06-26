'use client'

import { useState } from 'react'
import { useTables, useCreateTable, useUpdateTable } from '@/hooks/useTables'
import { TableCard } from '@/components/features/tables/TableCard'
import { TableForm } from '@/components/features/tables/TableForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { RestaurantTable } from '@/types/database.types'

export default function TablesPage() {
  const { data: tables, isLoading, isError } = useTables()
  const { mutate: createTable, isPending: isCreating } = useCreateTable()
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<RestaurantTable | undefined>()

  const handleOpenCreate = () => {
    setEditingTable(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (table: RestaurantTable) => {
    setEditingTable(table)
    setDialogOpen(true)
  }

  const handleSubmit = (data: Omit<RestaurantTable, 'table_id'>) => {
    if (editingTable) {
      updateTable(
        { tableId: editingTable.table_id, updates: data },
        {
          onSuccess: () => {
            toast.success('Table mise à jour.')
            setDialogOpen(false)
          },
          onError: () => toast.error('Erreur lors de la mise à jour.'),
        }
      )
    } else {
      createTable(data, {
        onSuccess: () => {
          toast.success('Table ajoutée.')
          setDialogOpen(false)
        },
        onError: () => toast.error("Erreur lors de l'ajout."),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tables</h2>
          <p className="text-muted-foreground text-sm">
            {tables?.length ?? 0} table(s) · {tables?.filter((t) => t.is_active).length ?? 0} active(s)
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Ajouter une table
        </Button>
      </div>

      {isError && (
        <p className="text-destructive text-sm" role="alert">
          Impossible de charger les tables. Vérifiez votre connexion.
        </p>
      )}

      {/* Grille */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : tables?.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          Aucune table configurée. Ajoutez-en une pour commencer.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tables?.map((table) => (
            <TableCard
              key={table.table_id}
              table={table}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Modifier une table' : 'Ajouter une table'}
            </DialogTitle>
          </DialogHeader>
          <TableForm
            table={editingTable}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isPending={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}