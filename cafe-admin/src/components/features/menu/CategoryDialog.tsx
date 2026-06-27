'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types/database.types'

const LIMIT = 50

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  onDelete?: () => void
  isPending: boolean
  isDeleting?: boolean
  category?: Category
  existingNames: string[]
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  isPending,
  isDeleting,
  category,
  existingNames,
}: Props) {
  const [name, setName] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.category_name)
    } else {
      setName('')
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isDuplicate = existingNames
      .filter((n) => !category || n !== category.category_name)
      .some((n) => n.toLowerCase() === name.trim().toLowerCase())

    if (isDuplicate) {
      toast.error('Une catégorie avec ce nom existe déjà.')
      return
    }

    onSubmit(name.trim())
  }

  const handleClose = () => {
    setName('')
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cat_name">Nom *</Label>
                <span className={`text-xs ${name.length >= LIMIT ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {name.length}/{LIMIT}
                </span>
              </div>
              <Input
                id="cat_name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, LIMIT))}
                placeholder="Ex: Boissons chaudes"
                required
                disabled={isPending}
                maxLength={LIMIT}
              />
            </div>

            <div className="flex gap-2 pt-2">
              {category && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isPending || isDeleting}
                  aria-label="Supprimer la catégorie"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim()}
                className="flex-1"
              >
                {isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  : category ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{category?.category_name}</span> sera
              supprimée. Les articles associés perdront leur catégorie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onDelete?.(); setDeleteOpen(false) }}
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