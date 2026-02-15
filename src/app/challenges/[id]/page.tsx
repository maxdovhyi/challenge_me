'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { addLedger, addLog, challengeDayStatus } from '@/lib/store'

const kievDate = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, refresh } = useApp()
  const [manualValue, setManualValue] = useState(10)
  const challenge = state.challenges.find((c) => c.id === id)
  const me = state.profile.id

  const action = state.actions.find((a) => a.id === challenge?.actionId)
  const members = state.members.filter((m) => m.challengeId === id && m.role !== 'follower')

  const leaderboard = useMemo(() => {
    return members.map((member) => {
      const logs = state.logs.filter((l) => l.challengeId === id && l.userId === member.userId)
      const total = logs.reduce((a, l) => a + l.value, 0)
      const doneDays = new Set(logs.map((l) => l.localDate)).size
      return { userId: member.userId, total, doneDays }
    }).sort((a, b) => b.total - a.total)
  }, [members, state.logs, id])

  if (!challenge || !action) return <p>Challenge not found</p>

  const todayStatus = challengeDayStatus(challenge, state.logs, state.jokers, kievDate(), me)
  const challengeLogs = state.logs.filter((l) => l.challengeId === id).slice(0, 20)
  const bank = state.ledger.filter((l) => l.challengeId === id).reduce((a, r) => a + r.amountUah, 0)

  return (
    <section className="space-y-4">
      <Link href="/challenges" className="text-sm underline">← Назад к списку</Link>
      <header className="rounded-2xl border bg-white p-4">
        <h1 className="text-2xl font-black">{challenge.title}</h1>
        <p className="text-sm text-slate-600">{challenge.startDate} → {challenge.endDate} · {challenge.status}</p>
        <p className="mt-1">Today: <b>{todayStatus}</b></p>
        <div className="mt-3 flex gap-2">
          {action.suggestedQuickAdd.map((step) => (
            <button key={step} className="rounded-xl bg-black px-3 py-2 text-white" onClick={() => { addLog(challenge.id, action.id, me, action.valueType === 'abstinence' ? 1 : step); refresh() }}>
              {action.valueType === 'abstinence' ? 'Clean day ✅' : `+${step}`}
            </button>
          ))}
          {action.valueType !== 'abstinence' && (
            <>
              <input type="number" className="w-24 rounded-lg border px-2" value={manualValue} onChange={(e) => setManualValue(Number(e.target.value))} />
              <button className="rounded-xl bg-slate-800 px-3 py-2 text-white" onClick={() => { addLog(challenge.id, action.id, me, manualValue); refresh() }}>Log</button>
            </>
          )}
        </div>
      </header>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-bold">Leaderboard</h2>
        <div className="space-y-2">
          {leaderboard.map((row, index) => (
            <div key={row.userId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span>#{index + 1} {row.userId}</span>
              <span>{row.total} {action.unit} · {row.doneDays} days</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Money Bank</h2>
          <span className="font-bold">{bank}₴</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-emerald-600 px-3 py-2 text-white" onClick={() => { addLedger({ challengeId: id, userId: me, type: 'deposit', amountUah: challenge.depositAmount || 0, note: 'Залог внесен' }); refresh() }}>Mark deposit</button>
          <button className="rounded-xl bg-rose-600 px-3 py-2 text-white" onClick={() => { addLedger({ challengeId: id, userId: me, type: 'fine_miss', amountUah: -(challenge.finePerMiss || 0), note: 'Miss fine' }); refresh() }}>Apply miss fine</button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-bold">Logs feed</h2>
        <div className="space-y-2 text-sm">
          {challengeLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
              <span>{log.localDate}</span>
              <span>+{log.value} {action.unit}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
