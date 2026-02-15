import './globals.css'
import type { Metadata } from 'next'
import { AppProvider } from '@/components/app-provider'
import { BottomNav } from '@/components/bottom-nav'

export const metadata: Metadata = {
  title: 'CONTROL — Challenge & Action Bank',
  description: 'Action bank, milestones, recap and challenge tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppProvider>
          <main className="mx-auto min-h-screen max-w-xl p-4 pb-24">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  )
}
