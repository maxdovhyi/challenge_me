'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MonthCalendar } from '@/components/month-calendar'
import { ChallengeCard } from '@/components/challenge-card'
import { LogModal } from '@/components/log-modal'
import { useApp } from '@/components/app-provider'
import { addLog, challengeDayStatus, dayAggregateStatus, kievToday, removeLog, totalsByAction, useJoker } from '@/lib/store'

export default function DashboardPage() {
  const { state, refresh } = useApp()
  const [period, setPeriod] = useState<'month' | 'year' | 'lifetime'>('month')
  const [pickedDate, setPickedDate] = useState(kievToday())
  const [logOpen, setLogOpen] = useState(false)
  const month = new Date(kievToday())

  const totals = totalsByAction(state.logs, state.members, null, state.profile.id, period)
  const myChallenges = state.challenges.filter((c) => state.members.some((m) => m.challengeId === c.id && m.userId === state.profile.id))

  const statuses = useMemo(() => {
    const out: Record<string, 'done' | 'missed' | 'joker' | 'pending' | 'partial' | 'slip'> = {}
    const y = month.getFullYear()
    const m = month.getMonth()
    const days = new Date(y, m + 1, 0).getDate()
    for (let d = 1; d <= days; d += 1) {
      const date = new Date(y, m, d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
      out[date] = dayAggregateStatus(state, date, state.profile.id)
    }
    return out
  }, [state, month])

  const dayLogs = state.logs.filter((l) => l.localDate === pickedDate && l.userId === state.profile.id)

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-black">Dashboard 🏠</h1>
        <p className="text-sm text-slate-500">Твой капитал и прогресс в одном окне</p>
      </header>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Today mini</h2>
          <Link href="/today" className="text-xs underline">Open Today</Link>
        </div>
        <p className="text-sm">Осталось закрыть: {myChallenges.filter((c) => challengeDayStatus(c, state.logs, state.jokers, state.slipEvents, kievToday(), state.profile.id) !== 'done').length}</p>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Активные челленджи</h2>
          <Link href="/challenges/new" className="rounded-lg bg-black px-2 py-1 text-xs text-white">+ New</Link>
        </div>
        <div className="space-y-2">
          {myChallenges.length === 0 ? <p className="text-sm text-slate-500">Пусто</p> : myChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} role={state.members.find((m) => m.challengeId === c.id && m.userId === state.profile.id)?.role} />)}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-bold">Action Bank</h2>
        <div className="mb-2 grid grid-cols-3 gap-2">
          {(['month', 'year', 'lifetime'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-xl px-2 py-2 text-sm ${period === p ? 'bg-black text-white' : 'bg-slate-100'}`}>{p}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {state.actions.map((action) => (
            <div key={action.id} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{action.title}</p>
              <p className="text-xl font-black">{totals[action.id] || 0}</p>
            </div>
          ))}
        </div>
      </section>

      <MonthCalendar month={month} statuses={statuses} onPick={setPickedDate} />

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Day Drawer: {pickedDate}</h2>
          <button className="rounded border px-2 py-1 text-xs" onClick={() => setLogOpen(true)}>Add log</button>
        </div>
        <div className="space-y-2 text-sm">
          {myChallenges.map((c) => <div key={c.id} className="rounded bg-slate-50 p-2">{c.title}: {challengeDayStatus(c, state.logs, state.jokers, state.slipEvents, pickedDate, state.profile.id)} <button className="ml-2 text-xs underline" onClick={() => { useJoker(c.id, state.profile.id, pickedDate); refresh() }}>joker</button></div>)}
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {dayLogs.length === 0 ? <p className="text-slate-500">Логов нет</p> : dayLogs.map((log) => {
            const action = state.actions.find((a) => a.id === log.actionId)
            return (
              <div key={log.id} className="rounded-lg bg-slate-50 p-2 flex items-center justify-between">
                <span><b>{action?.title}</b> +{log.value} {action?.unit} {log.note ? `· ${log.note}` : ''}</span>
                <button onClick={() => { removeLog(log.id); refresh() }}>🗑️</button>
              </div>
            )
          })}
        </div>
      </section>

      <LogModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        actions={state.actions}
        onSave={(payload) => {
          addLog({ ...payload, userId: state.profile.id, localDate: pickedDate })
          refresh()
        }}
      />
    </section>
  )
}
