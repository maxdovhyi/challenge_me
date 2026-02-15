'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { createChallenge } from '@/lib/store'
import { RuleType } from '@/lib/types'

const presets = [7, 14, 15, 30, 60, 90]
const addDays = (date: string, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days - 1)
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
}
const diffDaysInclusive = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.floor((e.getTime() - s.getTime()) / 86400000) + 1)
}

export default function NewChallengePage() {
  const { state } = useApp()
  const router = useRouter()

  const now = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })

  const [title, setTitle] = useState('No Porn 15 days')
  const [description, setDescription] = useState('Фокус и самоконтроль')
  const [actionId, setActionId] = useState(state.actions[0]?.id || '')
  const [ruleType, setRuleType] = useState<RuleType>('abstinence')
  const [minPerDay, setMinPerDay] = useState(10)

  const [startDate, setStartDate] = useState(now)
  const [durationDays, setDurationDays] = useState(15)
  const [customDuration, setCustomDuration] = useState(false)
  const [endDate, setEndDate] = useState(addDays(now, 15))

  const [finePerMiss, setFinePerMiss] = useState(100)
  const [finePerFail, setFinePerFail] = useState(300)
  const [jokersPerPeriod, setJokersPerPeriod] = useState(2)
  const [prizeUah, setPrizeUah] = useState(0)

  const [alreadyStarted, setAlreadyStarted] = useState(false)
  const [baselineValue, setBaselineValue] = useState(0)

  const durationLabel = useMemo(() => `${durationDays} days`, [durationDays])

  const onPreset = (days: number) => {
    setCustomDuration(false)
    setDurationDays(days)
    setEndDate(addDays(startDate, days))
  }

  const onStartChange = (value: string) => {
    setStartDate(value)
    setEndDate(addDays(value, durationDays))
  }

  const onEndChange = (value: string) => {
    setCustomDuration(true)
    setEndDate(value)
    setDurationDays(diffDaysInclusive(startDate, value))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    const id = createChallenge(
      {
        title,
        description,
        actionId,
        ownerId: state.profile.id,
        ruleType,
        minPerDay: ruleType === 'abstinence' ? 1 : minPerDay,
        startDate,
        endDate,
        durationDays,
        jokersPerPeriod,
        finePerMiss,
        finePerFail,
        prizeUah: prizeUah > 0 ? prizeUah : undefined,
      },
      state.profile.id,
      alreadyStarted ? baselineValue : 0,
    )

    router.push(`/challenges/${id}`)
  }

  return (
    <section className="space-y-4">
      <Link href="/dashboard" className="text-sm underline">← Назад</Link>
      <h1 className="text-3xl font-black">Create challenge</h1>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-4">
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

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-2 font-semibold">Duration</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button key={p} type="button" className={`rounded-lg border px-2 py-2 text-sm ${!customDuration && durationDays === p ? 'bg-black text-white' : 'bg-white'}`} onClick={() => onPreset(p)}>{p}</button>
            ))}
            <button type="button" className={`rounded-lg border px-2 py-2 text-sm ${customDuration ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setCustomDuration(true)}>Custom</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs">Start<input type="date" className="mt-1 w-full rounded border p-2 text-sm" value={startDate} onChange={(e) => onStartChange(e.target.value)} /></label>
            <label className="text-xs">End<input type="date" className="mt-1 w-full rounded border p-2 text-sm" value={endDate} onChange={(e) => onEndChange(e.target.value)} /></label>
          </div>
          <p className="mt-2 text-2xl font-black">{durationLabel}</p>
          <p className="text-xs text-slate-500">Start: {startDate} → End: {endDate}</p>
        </div>

        <label className="block text-sm">Штраф за miss ₴<input type="number" className="mt-1 w-full rounded-lg border p-2" value={finePerMiss} onChange={(e) => setFinePerMiss(Number(e.target.value))} /></label>
        <label className="block text-sm">Штраф за fail ₴<input type="number" className="mt-1 w-full rounded-lg border p-2" value={finePerFail} onChange={(e) => setFinePerFail(Number(e.target.value))} /></label>
        <label className="block text-sm">Prize / loser pays ₴ (optional)<input type="number" className="mt-1 w-full rounded-lg border p-2" value={prizeUah} onChange={(e) => setPrizeUah(Number(e.target.value))} /></label>
        <label className="block text-sm">Jokers per period<input type="number" className="mt-1 w-full rounded-lg border p-2" value={jokersPerPeriod} onChange={(e) => setJokersPerPeriod(Number(e.target.value))} /></label>

        <div className="rounded-xl bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={alreadyStarted} onChange={(e) => setAlreadyStarted(e.target.checked)} /> Challenge already started</label>
          {alreadyStarted && (
            <label className="mt-2 block text-sm">Already completed amount
              <input type="number" className="mt-1 w-full rounded-lg border p-2" value={baselineValue} onChange={(e) => setBaselineValue(Number(e.target.value))} />
            </label>
          )}
        </div>

        <button className="w-full rounded-xl bg-black py-2 font-semibold text-white">Create</button>
      </form>
    </section>
  )
}
