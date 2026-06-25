'use client'

import { useState, useMemo } from 'react'
import {
  useMenuItems,
  useCategories,
  useCreateMenuItem,
  useUpdateMenuItem,
} from '@/hooks/useMenu'
import { MenuItemCard } from '@/components/features/menu/MenuItemCard'
import { MenuItemForm } from '@/components/features/menu/MenuItemForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { MenuItem } from '@/types/database.types'

export default function MenuPage() {
  const { data: items, isLoading: itemsLoading } = useMenuItems()
  const { data: categories, isLoading: catsLoading } = useCategories()
  const { mutate: createItem, isPending: isCreating } = useCreateMenuItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateMenuItem()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const isLoading = itemsLoading || catsLoading

  const filteredItems = useMemo(() => {
    if (!items) return []
    if (activeCategory === 'all') return items
    return items.filter((i) => i.category_id?.toString() === activeCategory)
  }, [items, activeCategory])

  const handleOpenCreate = () => {
    setEditingItem(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = (data: Omit<MenuItem, 'menu_id'>) => {
    if (editingItem) {
      updateItem(
        { menuId: editingItem.menu_id, updates: data },
        {
          onSuccess: () => {
            toast.success('Article mis à jour.')
            setDialogOpen(false)
          },
          onError: () => toast.error('Erreur lors de la mise à jour.'),
        }
      )
    } else {
      createItem(data, {
        onSuccess: () => {
          toast.success('Article ajouté au menu.')
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
          <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
          <p className="text-muted-foreground text-sm">
            {items?.length ?? 0} article(s) au total
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Ajouter un article
        </Button>
      </div>

      {/* Filtres par catégorie */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {categories?.map((cat) => (
            <TabsTrigger key={cat.category_id} value={cat.category_id.toString()}>
              {cat.category_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              Aucun article dans cette catégorie.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.menu_id}
                  item={item}
                  onEdit={handleOpenEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog ajout / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier un article' : 'Ajouter un article'}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            item={editingItem}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isPending={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}