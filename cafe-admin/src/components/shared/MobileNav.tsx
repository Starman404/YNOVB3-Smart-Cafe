'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  TableProperties,
  History,
  Users,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/orders',   label: 'Commandes',  icon: ClipboardList },
  { href: '/dashboard/menu',     label: 'Menu',       icon: UtensilsCrossed },
  { href: '/dashboard/tables',   label: 'Tables',     icon: TableProperties },
  { href: '/dashboard/history',  label: 'Historique', icon: History },
  { href: '/dashboard/accounts', label: 'Clients',    icon: Users },
] as const

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around px-2 py-2">
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
                'flex flex-col items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}