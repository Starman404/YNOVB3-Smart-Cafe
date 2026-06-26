import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  isLoading?: boolean
}

export function StatCard({ title, value, subtitle, icon: Icon, isLoading }: Props) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}