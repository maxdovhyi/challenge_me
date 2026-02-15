'use client'

import Link from 'next/link'
import { ChallengeCard } from '@/components/challenge-card'
import { useApp } from '@/components/app-provider'

export default function ChallengesPage() {
  const { state } = useApp()

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Challenges 🧩</h1>
        <Link href="/challenges/new" className="rounded-xl bg-black px-3 py-2 text-white">+ Create</Link>
      </header>
      <Link href="/dashboard" className="text-sm underline">← Dashboard</Link>

      {state.challenges.length === 0 ? (
        <div className="rounded-2xl border bg-white p-5 text-center text-slate-600">Пока пусто. Создай первый челлендж.</div>
      ) : (
        <div className="space-y-3">
          {state.challenges.map((challenge) => {
            const myRole = state.members.find((m) => m.challengeId === challenge.id && m.userId === state.profile.id)?.role
            return <ChallengeCard key={challenge.id} challenge={challenge} role={myRole} />
          })}
        </div>
      )}
    </section>
  )
}
