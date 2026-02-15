'use client'

import { Heatmap } from '@/components/heatmap'
import { useApp } from '@/components/app-provider'

export default function ProfilePage() {
  const { state } = useApp()
  const now = new Date()
  const year = now.getFullYear()
  const values = Array.from({ length: 84 }).map((_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (83 - i))
    const localDate = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
    return state.logs.filter((log) => log.localDate === localDate && log.userId === state.profile.id).reduce((a, l) => a + l.value, 0)
  })

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Profile / Recap 🏆</h1>
      <article className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-bold">{state.profile.username}</h2>
        <p className="text-sm text-slate-500">Year Recap {year} · Год силы 💪</p>
      </article>

      <article className="rounded-2xl border bg-white p-4">
        <h2 className="mb-3 font-bold">Heatmap (any log)</h2>
        <Heatmap values={values} />
      </article>

      <article className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Top achievements</h2>
        <div className="space-y-2 text-sm">
          {state.achievements.slice(0, 8).map((a) => (
            <div key={a.id} className="rounded-lg bg-slate-50 p-2">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-slate-500">{new Date(a.earnedAt).toLocaleDateString('ru-RU')} · {a.description}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
