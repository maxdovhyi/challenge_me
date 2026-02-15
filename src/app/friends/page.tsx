'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { createChallenge, makeInvite } from '@/lib/store'

export default function FriendsPage() {
  const { state } = useApp()
  const [selectedChallenge, setSelectedChallenge] = useState(state.challenges[0]?.id || '')
  const [inviteRole, setInviteRole] = useState<'participant' | 'follower'>('participant')
  const [link, setLink] = useState('')

  const [duelFriendId, setDuelFriendId] = useState(state.friends[0]?.id || '')
  const [template, setTemplate] = useState<'no_porn_15' | 'meditation_30'>('no_porn_15')
  const [duelLink, setDuelLink] = useState('')

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-black">Friends 👥</h1>
        <p className="text-sm text-slate-500">Инвайты, роли, challenge a friend</p>
      </header>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Invite link</h2>
        <label className="block text-sm">Challenge
          <select className="mt-1 w-full rounded-lg border p-2" value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
            {state.challenges.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="mt-2 block text-sm">Role
          <select className="mt-1 w-full rounded-lg border p-2" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'participant' | 'follower')}>
            <option value="participant">participant</option>
            <option value="follower">observer</option>
          </select>
        </label>
        <button className="mt-3 w-full rounded-xl bg-black py-2 text-white" onClick={() => selectedChallenge && setLink(makeInvite(selectedChallenge, inviteRole, state.profile.id))}>Generate invite</button>
        {link && <p className="mt-2 break-all rounded bg-slate-100 p-2 text-xs">{link}</p>}
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Challenge a friend ⚔️</h2>
        <label className="block text-sm">Friend
          <select className="mt-1 w-full rounded-lg border p-2" value={duelFriendId} onChange={(e) => setDuelFriendId(e.target.value)}>
            {state.friends.map((f) => <option key={f.id} value={f.id}>{f.username}</option>)}
          </select>
        </label>
        <label className="mt-2 block text-sm">Template
          <select className="mt-1 w-full rounded-lg border p-2" value={template} onChange={(e) => setTemplate(e.target.value as typeof template)}>
            <option value="no_porn_15">No Porn 15 days</option>
            <option value="meditation_30">Meditation 30 days</option>
          </select>
        </label>
        <button className="mt-3 w-full rounded-xl bg-black py-2 text-white" onClick={() => {
          const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
          const durationDays = template === 'no_porn_15' ? 15 : 30
          const end = new Date(today)
          end.setDate(end.getDate() + durationDays - 1)
          const challengeId = createChallenge({
            title: template === 'no_porn_15' ? 'Duel: No Porn 15 days' : 'Duel: Meditation 30 days',
            description: `Duel vs ${duelFriendId}`,
            ownerId: state.profile.id,
            actionId: template === 'no_porn_15' ? 'a1' : 'a2',
            ruleType: template === 'no_porn_15' ? 'abstinence' : 'duration',
            minPerDay: template === 'no_porn_15' ? 1 : 10,
            startDate: today,
            endDate: end.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' }),
            durationDays,
            jokersPerPeriod: 2,
            finePerMiss: 100,
            finePerFail: 300,
            prizeUah: 500,
          }, state.profile.id, 0)
          setDuelLink(makeInvite(challengeId, 'participant', state.profile.id))
        }}>Start duel + generate participant link</button>
        {duelLink && <p className="mt-2 rounded bg-slate-100 p-2 text-xs break-all">{duelLink}</p>}
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 font-bold">Friends list</h2>
        <div className="space-y-2">
          {state.friends.map((f) => (
            <div key={f.id} className="rounded-lg bg-slate-50 p-2 text-sm">
              <p className="font-semibold">{f.username}</p>
              <p className="text-xs text-slate-500">Invite / follow / challenge</p>
            </div>
          ))}
        </div>
      </section>

      <Link href="/dashboard" className="text-sm underline">← К Dashboard</Link>
    </section>
  )
}
