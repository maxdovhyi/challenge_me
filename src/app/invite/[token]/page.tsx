'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { joinByInvite } from '@/lib/store'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { state, refresh } = useApp()
  const [joined, setJoined] = useState(false)

  const invite = state.invites.find((i) => i.token === token)
  const challenge = state.challenges.find((c) => c.id === invite?.challengeId)

  if (!invite || !challenge) return <p className="p-4">Invite not found</p>

  return (
    <section className="space-y-4 p-4">
      <h1 className="text-2xl font-black">Join challenge</h1>
      <div className="rounded-2xl border bg-white p-4">
        <p className="font-bold">{challenge.title}</p>
        <p className="text-sm text-slate-500">Role: {invite.role}</p>
        <p className="text-sm">{challenge.startDate} → {challenge.endDate}</p>
        <button className="mt-3 rounded-xl bg-black px-3 py-2 text-white" onClick={() => { setJoined(joinByInvite(token, state.profile.id)); refresh() }}>Join</button>
        {joined && <p className="mt-2 text-sm text-green-700">Joined! open challenges/dashboard.</p>}
      </div>
      <Link href="/dashboard" className="underline">Go dashboard</Link>
    </section>
  )
}
