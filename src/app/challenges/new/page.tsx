'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { createChallenge } from '@/lib/store'
import { RuleType } from '@/lib/types'

export default function NewChallengePage() {
  const { state } = useApp()
  const router = useRouter()
  const [title, setTitle] = useState('Meditation 10 min daily')
  const [description, setDescription] = useState('Ежедневная практика')
  const [actionId, setActionId] = useState(state.actions[0]?.id || '')
  const [ruleType, setRuleType] = useState<RuleType>('duration')
  const [minPerDay, setMinPerDay] = useState(10)
  const [depositAmount, setDepositAmount] = useState(0)
  const [finePerMiss, setFinePerMiss] = useState(100)
  const [jokersPerPeriod, setJokersPerPeriod] = useState(2)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const now = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
    const monthEnd = new Date()
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)

    const id = createChallenge(
      {
        title,
        description,
        actionId,
        ownerId: state.profile.id,
        ruleType,
        minPerDay: ruleType === 'abstinence' ? 1 : minPerDay,
        startDate: now,
        endDate: monthEnd.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' }),
        jokersPerPeriod,
        depositAmount,
        finePerMiss,
        finePerFail: 0,
      },
      state.profile.id,
    )

    router.push(`/challenges/${id}`)
  }

  return (
    <section className="space-y-4">
      <Link href="/challenges" className="text-sm underline">← Назад</Link>
      <h1 className="text-3xl font-black">Create challenge</h1>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border bg-white p-4">
        <label className="block text-sm">Название<input className="mt-1 w-full rounded-lg border p-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block text-sm">Описание<input className="mt-1 w-full rounded-lg border p-2" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className="block text-sm">Action
          <select className="mt-1 w-full rounded-lg border p-2" value={actionId} onChange={(e) => setActionId(e.target.value)}>
            {state.actions.map((action) => <option key={action.id} value={action.id}>{action.title}</option>)}
          </select>
        </label>
        <label className="block text-sm">Rule type
          <select className="mt-1 w-full rounded-lg border p-2" value={ruleType} onChange={(e) => setRuleType(e.target.value as RuleType)}>
            <option value="abstinence">abstinence</option>
            <option value="count">count</option>
            <option value="duration">duration</option>
          </select>
        </label>
        {ruleType !== 'abstinence' && <label className="block text-sm">Min per day<input type="number" className="mt-1 w-full rounded-lg border p-2" value={minPerDay} onChange={(e) => setMinPerDay(Number(e.target.value))} /></label>}
        <label className="block text-sm">Залог ₴<input type="number" className="mt-1 w-full rounded-lg border p-2" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} /></label>
        <label className="block text-sm">Штраф за miss ₴<input type="number" className="mt-1 w-full rounded-lg border p-2" value={finePerMiss} onChange={(e) => setFinePerMiss(Number(e.target.value))} /></label>
        <label className="block text-sm">Jokers per month<input type="number" className="mt-1 w-full rounded-lg border p-2" value={jokersPerPeriod} onChange={(e) => setJokersPerPeriod(Number(e.target.value))} /></label>
        <button className="w-full rounded-xl bg-black py-2 font-semibold text-white">Create</button>
      </form>
    </section>
  )
}
