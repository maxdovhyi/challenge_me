'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { AppState } from '@/lib/types'
import { readState } from '@/lib/store'

interface AppContextShape {
  state: AppState
  refresh: () => void
}

const AppContext = createContext<AppContextShape | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(readState())

  const refresh = () => setState(readState())

  useEffect(() => {
    refresh()
  }, [])

  const value = useMemo(() => ({ state, refresh }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
