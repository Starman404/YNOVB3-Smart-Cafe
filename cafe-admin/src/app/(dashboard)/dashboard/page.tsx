'use client'

import { StatCard } from '@/components/features/dashboard/StatCard'
import { RevenueChart } from '@/components/features/dashboard/RevenueChart'
import { TopItemsChart } from '@/components/features/dashboard/TopItemsChart'
import { useDashboardStats } from '@/hooks/useAnalytics'
import {
  Euro,
  ShoppingBag,
  ClipboardList,
  TableProperties,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Vue d'ensemble du Lux Café
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus aujourd'hui"
          value={`${stats?.todayRevenue.toFixed(2) ?? '0.00'} €`}
          icon={Euro}
          isLoading={isLoading}
        />
        <StatCard
          title="Commandes aujourd'hui"
          value={stats?.todayOrders ?? 0}
          icon={ShoppingBag}
          isLoading={isLoading}
        />
        <StatCard
          title="Tables actives"
          value={stats?.activeOrders ?? 0}
          subtitle="Avec articles en cours"
          icon={ClipboardList}
          isLoading={isLoading}
        />
        <StatCard
          title="Tables configurées"
          value={stats?.totalTables ?? 0}
          icon={TableProperties}
          isLoading={isLoading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart />
        <TopItemsChart />
      </div>
    </div>
  )
}