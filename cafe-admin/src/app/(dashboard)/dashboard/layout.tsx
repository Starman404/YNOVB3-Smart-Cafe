import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Lux Café',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}