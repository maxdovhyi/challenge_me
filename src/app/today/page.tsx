'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useApp } from '@/components/app-provider'
import { addLog, challengeDayStatus, useJoker } from '@/lib/store'

const kievDate = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })

export default function TodayPage() {
  const { state, refresh } = useApp()
  const date = kievDate()
  const myChallenges = useMemo(
    () => state.challenges.filter((c) => state.members.some((m) => m.challengeId === c.id && m.userId === state.profile.id && m.role !== 'follower')),
    [state],
  )

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-black">Today ✅</h1>
        <p className="text-sm text-slate-500">{date} · Europe/Kiev</p>
      </header>

      {myChallenges.length === 0 && (
        <div className="rounded-2xl border bg-white p-5 text-center">
          <p className="mb-3">Нет челленджей — создай за 30 секунд.</p>
          <Link href="/challenges/new" className="rounded-xl bg-black px-3 py-2 text-white">Создать челлендж</Link>
        </div>
      )}

      {myChallenges.map((challenge) => {
        const action = state.actions.find((a) => a.id === challenge.actionId)
        if (!action) return null
        const status = challengeDayStatus(challenge, state.logs, state.jokers, date, state.profile.id)
        const todayTotal = state.logs
          .filter((l) => l.challengeId === challenge.id && l.localDate === date && l.userId === state.profile.id)
          .reduce((a, l) => a + l.value, 0)

        const quick = action.valueType === 'abstinence' ? [1] : action.suggestedQuickAdd

        return (
          <article key={challenge.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Link href={`/challenges/${challenge.id}`} className="font-bold underline">{challenge.title}</Link>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === 'done' ? 'bg-green-100 text-done' : status === 'joker' ? 'bg-violet-100 text-joker' : status === 'missed' ? 'bg-red-100 text-missed' : 'bg-yellow-100 text-pending'}`}>{status}</span>
            </div>
            <p className="mb-3 text-sm text-slate-600">Сегодня: <b>{todayTotal}</b> {action.unit}</p>
            <div className="flex flex-wrap gap-2">
              {quick.map((step) => (
                <button
                  key={step}
                  className="rounded-xl bg-black px-3 py-2 text-sm text-white"
                  onClick={() => {
                    addLog(challenge.id, action.id, state.profile.id, step, date)
                    refresh()
                  }}
                >
                  {action.valueType === 'abstinence' ? 'Done ✅' : `+${step}`}
                </button>
              ))}
              {status !== 'done' && (
                <button
                  className="rounded-xl bg-violet-600 px-3 py-2 text-sm text-white"
                  onClick={() => {
                    useJoker(challenge.id, state.profile.id, date)
                    refresh()
                  }}
                >
                  Джокер 🎟️
                </button>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}
