'use client'

import { useState, useMemo } from 'react'
import {
  useMenuItems,
  useCategories,
  useCreateMenuItem,
  useUpdateMenuItem,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useReorderMenuItems,
} from '@/hooks/useMenu'
import { MenuItemCard } from '@/components/features/menu/MenuItemCard'
import { MenuItemForm } from '@/components/features/menu/MenuItemForm'
import { CategoryDialog } from '@/components/features/menu/CategoryDialog'
import { SortableList } from '@/components/shared/SortableList'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, GripVertical, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Category, MenuItem } from '@/types/database.types'

export default function MenuPage() {
  const { data: items, isLoading: itemsLoading } = useMenuItems()
  const { data: categories, isLoading: catsLoading } = useCategories()
  const { mutate: createItem, isPending: isCreating } = useCreateMenuItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateMenuItem()
  const { mutate: createCategory, isPending: isCreatingCat } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdatingCat } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeletingCat } = useDeleteCategory()
  const { mutate: reorderCategories } = useReorderCategories()
  const { mutate: reorderItems } = useReorderMenuItems()

  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>()
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [localCategories, setLocalCategories] = useState<Category[]>([])
  const [localItems, setLocalItems] = useState<MenuItem[]>([])

  const displayCategories = localCategories.length > 0 ? localCategories : categories ?? []
  const displayItems = localItems.length > 0 ? localItems : items ?? []
  const isLoading = itemsLoading || catsLoading

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return displayItems
    return displayItems.filter((i) => i.category_id?.toString() === activeCategory)
  }, [displayItems, activeCategory])

  const handleReorderCategories = (reordered: (Category & { id: number })[]) => {
    const cleaned = reordered.map(({ id: _id, ...c }) => c as Category)
    setLocalCategories(cleaned)
    reorderCategories(cleaned.map((c) => c.category_id), {
      onError: () => {
        setLocalCategories(categories ?? [])
        toast.error('Erreur lors du réordonnancement.')
      },
    })
  }

  const handleReorderItems = (reordered: (MenuItem & { id: number })[]) => {
    const cleaned = reordered.map(({ id: _id, ...i }) => i as MenuItem)
    setLocalItems(cleaned)
    reorderItems(cleaned.map((i) => i.menu_id), {
      onError: () => {
        setLocalItems(items ?? [])
        toast.error('Erreur lors du réordonnancement.')
      },
    })
  }

  const handleSubmitItem = (data: Omit<MenuItem, 'menu_id'>) => {
    if (editingItem) {
      updateItem(
        { menuId: editingItem.menu_id, updates: data },
        {
          onSuccess: () => {
            toast.success('Article mis à jour.')
            setMenuDialogOpen(false)
          },
          onError: () => toast.error('Erreur lors de la mise à jour.'),
        }
      )
    } else {
      createItem(data, {
        onSuccess: () => {
          toast.success('Article ajouté.')
          setMenuDialogOpen(false)
        },
        onError: () => toast.error("Erreur lors de l'ajout."),
      })
    }
  }

  const handleSubmitCategory = (name: string) => {
    if (editingCategory) {
      updateCategory(
        { id: editingCategory.category_id, name, sort: editingCategory.category_sort },
        {
          onSuccess: () => {
            toast.success('Catégorie mise à jour.')
            setCategoryDialogOpen(false)
            setEditingCategory(undefined)
          },
          onError: () => toast.error('Erreur lors de la mise à jour.'),
        }
      )
    } else {
      createCategory({ name, sort: null }, {
        onSuccess: () => {
          toast.success('Catégorie ajoutée.')
          setCategoryDialogOpen(false)
        },
        onError: () => toast.error("Erreur lors de l'ajout."),
      })
    }
  }

  const handleDeleteCategory = () => {
    if (!editingCategory) return
    deleteCategory(editingCategory.category_id, {
      onSuccess: () => {
        toast.success('Catégorie supprimée.')
        setCategoryDialogOpen(false)
        setEditingCategory(undefined)
        if (activeCategory === editingCategory.category_id.toString()) {
          setActiveCategory('all')
        }
      },
      onError: () => toast.error('Erreur lors de la suppression.'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
          <p className="text-muted-foreground text-sm">
            {items?.length ?? 0} article(s) · {categories?.length ?? 0} catégorie(s)
          </p>
        </div>
        <Button
          onClick={() => { setEditingItem(undefined); setMenuDialogOpen(true) }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Ajouter un article
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Catégories — pills draggables */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Catégories — glissez pour réordonner
            </p>

            <SortableList
              items={displayCategories.map((c) => ({ ...c, id: c.category_id }))}
              onReorder={handleReorderCategories}
              className="flex flex-wrap gap-2"
              renderItem={(cat, dragHandleProps) => (
                <div
                  className={cn(
                    'flex items-center gap-1 pl-1 pr-1 py-1 rounded-full border bg-card text-sm font-medium select-none',
                    activeCategory === cat.category_id.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:border-muted-foreground/40'
                  )}
                >
                  {/* Handle drag */}
                  <span
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground touch-none"
                    aria-label="Déplacer"
                  >
                    <GripVertical className="h-3 w-3" aria-hidden="true" />
                  </span>

                  {/* Nom — filtre au clic */}
                  <button
                    onClick={() =>
                      setActiveCategory(
                        activeCategory === cat.category_id.toString()
                          ? 'all'
                          : cat.category_id.toString()
                      )
                    }
                    className="px-1 focus-visible:outline-none"
                    aria-label={`Filtrer par ${cat.category_name}`}
                  >
                    {cat.category_name}
                  </button>

                  {/* Badge compteur */}
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {items?.filter((i) => i.category_id === cat.category_id).length ?? 0}
                  </Badge>

                  {/* Bouton édition */}
                  <button
                    onClick={() => {
                      setEditingCategory(cat)
                      setCategoryDialogOpen(true)
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none rounded-full"
                    aria-label={`Modifier ${cat.category_name}`}
                  >
                    <Pencil className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              )}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'text-xs underline-offset-2 hover:underline',
                  activeCategory === 'all'
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                )}
              >
                Voir tous les articles
              </button>
              <span className="text-muted-foreground text-xs">·</span>
              <button
                onClick={() => {
                  setEditingCategory(undefined)
                  setCategoryDialogOpen(true)
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                Nouvelle catégorie
              </button>
            </div>
          </div>

          {/* Articles — grille draggable */}
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              Aucun article dans cette catégorie.
            </div>
          ) : (
            <SortableList
              items={filteredItems.map((i) => ({ ...i, id: i.menu_id }))}
              onReorder={handleReorderItems}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              renderItem={(item, dragHandleProps) => (
                <MenuItemCard
                  item={item}
                  onEdit={() => {
                    setEditingItem(item)
                    setMenuDialogOpen(true)
                  }}
                  dragHandleProps={dragHandleProps}
                />
              )}
            />
          )}
        </div>
      )}

      {/* Dialog article */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier un article' : 'Ajouter un article'}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            item={editingItem}
            categories={categories ?? []}
            existingNames={items?.map((i) => i.menu_name) ?? []}
            onSubmit={handleSubmitItem}
            onCancel={() => setMenuDialogOpen(false)}
            isPending={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog catégorie */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(o) => {
          setCategoryDialogOpen(o)
          if (!o) setEditingCategory(undefined)
        }}
        onSubmit={handleSubmitCategory}
        onDelete={editingCategory ? handleDeleteCategory : undefined}
        isPending={isCreatingCat || isUpdatingCat}
        isDeleting={isDeletingCat}
        category={editingCategory}
        existingNames={categories?.map((c) => c.category_name) ?? []}
      />
    </div>
  )
}