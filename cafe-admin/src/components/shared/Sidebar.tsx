'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  TableProperties,
  History,
  Users,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/orders',   label: 'Commandes',  icon: ClipboardList },
  { href: '/dashboard/menu',     label: 'Menu',       icon: UtensilsCrossed },
  { href: '/dashboard/tables',   label: 'Tables',     icon: TableProperties },
  { href: '/dashboard/history',  label: 'Historique', icon: History },
  { href: '/dashboard/accounts', label: 'Clients',    icon: Users },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Erreur lors de la déconnexion.')
      return
    }

    toast.success('Déconnecté avec succès.')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r bg-card px-4 py-6 gap-2"
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="px-2 mb-6">
        <h1 className="text-xl font-bold tracking-tight">Lux Café</h1>
        <p className="text-xs text-muted-foreground">Espace gestion</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1" role="navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Se déconnecter
      </Button>
    </aside>
  )
}