'use client'

import { useState, useMemo } from 'react'
import { useAccounts } from '@/hooks/useAccounts'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, User } from 'lucide-react'

export default function AccountsPage() {
  const { data: accounts, isLoading, isError } = useAccounts()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!accounts) return []
    const q = search.toLowerCase().trim()
    if (!q) return accounts
    return accounts.filter(
      (a) =>
        a.user_name.toLowerCase().includes(q) ||
        a.user_email?.toLowerCase().includes(q)
    )
  }, [accounts, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Comptes clients</h2>
        <p className="text-muted-foreground text-sm">
          {accounts?.length ?? 0} compte(s) enregistré(s)
        </p>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="pl-9"
          aria-label="Rechercher un compte"
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm" role="alert">
          Impossible de charger les comptes. Vérifiez votre connexion.
        </p>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          {search ? 'Aucun compte trouvé pour cette recherche.' : 'Aucun compte enregistré.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((account) => (
            <Card key={account.user_id}>
              <CardContent className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{account.user_name}</p>
                  {account.user_email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {account.user_email}
                    </p>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground shrink-0">
                  Inscrit le{' '}
                  {format(new Date(account.created_at), 'dd MMM yyyy', { locale: fr })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}