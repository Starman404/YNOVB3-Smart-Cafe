import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/dashboard">Retour au dashboard</Link>
      </Button>
    </div>
  )
}