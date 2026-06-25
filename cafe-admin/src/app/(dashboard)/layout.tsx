import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { QueryProvider } from '@/components/shared/QueryProvider'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar desktop */}
        <Sidebar />

        {/* Contenu principal */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main
            className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6"
            role="main"
            id="main-content"
          >
            {children}
          </main>
        </div>

        {/* Nav mobile (bottom) */}
        <MobileNav />
      </div>

      <Toaster richColors position="top-right" />
    </QueryProvider>
  )
}