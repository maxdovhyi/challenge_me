'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { totalsByAction } from '@/lib/store'

export default function BankPage() {
  const { state } = useApp()
  const [period, setPeriod] = useState<'month' | 'year' | 'lifetime'>('month')
  const totals = totalsByAction(state.logs, state.profile.id, period)

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Action Bank 🏦</h1>

      <div className="grid grid-cols-3 gap-2">
        {(['month', 'year', 'lifetime'] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`rounded-xl px-2 py-2 text-sm font-semibold ${period === p ? 'bg-black text-white' : 'bg-white border'}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {state.actions.map((action) => (
          <article key={action.id} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{action.title}</h2>
              <span className="text-2xl font-black">{totals[action.id] || 0}</span>
            </div>
            <p className="text-sm text-slate-500">{action.unit}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Personal Records 🏆</h2>
        {state.achievements.length === 0 ? <p className="text-sm text-slate-500">Пока пусто — начинай логать.</p> : (
          <div className="grid grid-cols-2 gap-2">
            {state.achievements.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-lg bg-slate-50 p-2 text-sm">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-slate-500">{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
