'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, GripVertical } from 'lucide-react'
import type { MenuItem } from '@/types/database.types'

interface Props {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export function MenuItemCard({ item, onEdit, dragHandleProps }: Props) {
  return (
    <Card className={`w-full ${!item.is_available ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <span
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-0.5 shrink-0 touch-none"
            aria-label="Déplacer"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </span>

          {/* Infos */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm">{item.menu_name}</p>
              <div className="flex items-center gap-1 shrink-0">
                <p className="font-bold text-sm">{item.price.toFixed(2)} €</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(item)}
                  aria-label={`Modifier ${item.menu_name}`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {item.menu_description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.menu_description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {item.categories && (
                <Badge variant="secondary" className="text-xs">
                  {item.categories.category_name}
                </Badge>
              )}
              {!item.is_available && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Indisponible
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}