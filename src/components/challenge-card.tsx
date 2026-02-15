import Link from 'next/link'
import { Challenge } from '@/lib/types'

export function ChallengeCard({ challenge, role }: { challenge: Challenge; role?: string }) {
  return (
    <Link href={`/challenges/${challenge.id}`} className="block rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{challenge.title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{challenge.ruleType}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{challenge.description}</p>
      <p className="mt-2 text-xs text-slate-500">{challenge.startDate} → {challenge.endDate} · {challenge.durationDays} days</p>
      <div className="mt-2 text-sm">Role: {role || 'unknown'} · Штраф miss: {challenge.finePerMiss || 0}₴ · fail: {challenge.finePerFail || 0}₴</div>
      {challenge.prizeUah ? <p className="mt-1 text-xs text-violet-700">Prize commitment: {challenge.prizeUah}₴</p> : null}
    </Link>
  )
}
