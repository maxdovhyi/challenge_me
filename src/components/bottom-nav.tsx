'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today', label: 'Today' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/friends', label: 'Friends' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-xl gap-2 border-t bg-white p-2">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold ${active ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
