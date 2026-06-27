import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion | Smart Café',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}