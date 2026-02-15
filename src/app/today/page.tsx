'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { LogModal } from '@/components/log-modal'
import { useApp } from '@/components/app-provider'
import { addLog, addSlipEvent, challengeDayStatus, kievToday, removeLog, restoreLog, toggleAbstinence, useJoker } from '@/lib/store'

export default function TodayPage() {
  const { state, refresh } = useApp()
  const date = kievToday()
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetFor, setSheetFor] = useState<string | null>(null)
  const [deleted, setDeleted] = useState<{ id: string; until: number } | null>(null)
  const [deletedFull, setDeletedFull] = useState<ReturnType<typeof removeLog> | null>(null)
  const [slipFor, setSlipFor] = useState<string | null>(null)

  const myChallenges = useMemo(
    () => state.challenges.filter((c) => state.members.some((m) => m.challengeId === c.id && m.userId === state.profile.id && m.role !== 'follower')),
    [state],
  )

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Today ✅</h1>
          <p className="text-sm text-slate-500">{date} · Europe/Kiev</p>
        </div>
        <button className="rounded-xl bg-black px-3 py-2 text-white" onClick={() => setModalOpen(true)}>+ Add activity</button>
      </header>

      {deleted && Date.now() < deleted.until && (
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">
          <span>Deleted log</span>
          <button className="underline" onClick={() => {
            if (deletedFull) restoreLog(deletedFull)
            setDeleted(null)
            setDeletedFull(null)
            refresh()
          }}>Undo ↩️</button>
        </div>
      )}

      {myChallenges.map((challenge) => {
        const action = state.actions.find((a) => a.id === challenge.actionId)
        if (!action) return null

        const status = challengeDayStatus(challenge, state.logs, state.jokers, state.slipEvents, date, state.profile.id)
        const todayLogs = state.logs.filter((l) => l.challengeId === challenge.id && l.localDate === date && l.userId === state.profile.id)
        const todaySlip = state.slipEvents.find((s) => s.challengeId === challenge.id && s.userId === state.profile.id && s.date === date)
        const todayTotal = todayLogs.reduce((a, l) => a + l.value, 0)

        return (
          <article key={challenge.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Link href={`/challenges/${challenge.id}`} className="font-bold underline">{challenge.title}</Link>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{status}</span>
            </div>
            <p className="mb-2 text-sm text-slate-600">Сегодня: <b>{todayTotal}</b> {action.unit}</p>
            <div className="flex flex-wrap gap-2">
              {action.valueType === 'abstinence' ? (
                <button className="rounded-xl bg-black px-3 py-2 text-sm text-white" onClick={() => { toggleAbstinence(challenge.id, action.id, state.profile.id, date); refresh() }}>
                  {todayTotal >= 1 ? 'Undo ↩️' : 'Clean day ✅'}
                </button>
              ) : (
                action.suggestedQuickAdd.map((step) => (
                  <button key={step} className="rounded-xl bg-black px-3 py-2 text-sm text-white" onClick={() => { addLog({ challengeId: challenge.id, actionId: action.id, userId: state.profile.id, value: step, localDate: date }); refresh() }}>+{step}</button>
                ))
              )}
              <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setSheetFor(challenge.id)}>Logs today 📋</button>
              <button className="rounded-xl bg-violet-600 px-3 py-2 text-sm text-white" onClick={() => { useJoker(challenge.id, state.profile.id, date); refresh() }}>Joker 🎟️</button>
              {challenge.ruleType === 'abstinence' && <button className="rounded-xl bg-rose-700 px-3 py-2 text-sm text-white" onClick={() => setSlipFor(challenge.id)}>I slipped today</button>}
            </div>
            {todaySlip && <p className="mt-2 text-xs text-rose-700">Slip: {todaySlip.trigger} · {todaySlip.timeBucket}</p>}
          </article>
        )
      })}

      {sheetFor && (
        <div className="fixed inset-0 z-40 bg-black/40 p-3" onClick={() => setSheetFor(null)}>
          <div className="mx-auto mt-24 max-w-xl rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Logs today</h3>
            <div className="mt-2 max-h-72 space-y-2 overflow-y-auto text-sm">
              {state.logs.filter((l) => l.challengeId === sheetFor && l.localDate === date && l.userId === state.profile.id).map((log) => {
                const action = state.actions.find((a) => a.id === log.actionId)
                return (
                  <div key={log.id} className="flex items-center justify-between rounded bg-slate-50 px-2 py-2">
                    <span>+{log.value} {action?.unit} {log.note ? `· ${log.note}` : ''}</span>
                    <button onClick={() => {
                      const full = removeLog(log.id)
                      setDeletedFull(full)
                      setDeleted({ id: log.id, until: Date.now() + 10000 })
                      refresh()
                    }}>🗑️</button>
                  </div>
                )
              })}
            </div>
            <button className="mt-3 w-full rounded-xl border py-2" onClick={() => setSheetFor(null)}>Close</button>
          </div>
        </div>
      )}

      {slipFor && (
        <SlipSheet
          challengeId={slipFor}
          userId={state.profile.id}
          date={date}
          onClose={() => setSlipFor(null)}
          onDone={() => { setSlipFor(null); refresh() }}
        />
      )}

      <LogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actions={state.actions}
        onSave={(payload) => {
          addLog({ ...payload, userId: state.profile.id, localDate: date })
          refresh()
        }}
      />
    </section>
  )
}

function SlipSheet({ challengeId, userId, date, onClose, onDone }: { challengeId: string; userId: string; date: string; onClose: () => void; onDone: () => void }) {
  const [trigger, setTrigger] = useState<'stress' | 'boredom' | 'loneliness' | 'fatigue' | 'arousal' | 'alcohol' | 'social_media'>('stress')
  const [timeBucket, setTimeBucket] = useState<'morning' | 'day' | 'evening' | 'night'>('evening')
  const [place, setPlace] = useState<'bed' | 'home' | 'work' | 'toilet' | 'outside'>('home')
  const [recovery, setRecovery] = useState<Array<'walk_10' | 'cold_shower' | 'breathing_2' | 'message_friend' | 'sleep'>>(['walk_10'])
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-3" onClick={onClose}>
      <div className="mx-auto mt-16 max-w-xl rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold">Slip flow</h3>
        <label className="mt-2 block text-sm">Trigger
          <select className="mt-1 w-full rounded border p-2" value={trigger} onChange={(e) => setTrigger(e.target.value as typeof trigger)}>
            <option value="stress">stress 😣</option><option value="boredom">boredom 😐</option><option value="loneliness">loneliness 🥲</option><option value="fatigue">fatigue 😴</option><option value="arousal">arousal 😈</option><option value="alcohol">alcohol 🍺</option><option value="social_media">social media 📱</option>
          </select>
        </label>
        <label className="mt-2 block text-sm">Time
          <select className="mt-1 w-full rounded border p-2" value={timeBucket} onChange={(e) => setTimeBucket(e.target.value as typeof timeBucket)}>
            <option value="morning">morning</option><option value="day">day</option><option value="evening">evening</option><option value="night">night</option>
          </select>
        </label>
        <label className="mt-2 block text-sm">Place
          <select className="mt-1 w-full rounded border p-2" value={place} onChange={(e) => setPlace(e.target.value as typeof place)}>
            <option value="bed">bed</option><option value="home">home</option><option value="work">work</option><option value="toilet">toilet</option><option value="outside">outside</option>
          </select>
        </label>
        <label className="mt-2 block text-sm">Recovery
          <select multiple className="mt-1 h-24 w-full rounded border p-2" value={recovery} onChange={(e) => setRecovery(Array.from(e.target.selectedOptions).map((o) => o.value as typeof recovery[number]))}>
            <option value="walk_10">walk 10 min 🚶</option><option value="cold_shower">cold shower 🚿</option><option value="breathing_2">breathing 2 cycles 🌬️</option><option value="message_friend">message friend 🧑‍🤝‍🧑</option><option value="sleep">sleep 😴</option>
          </select>
        </label>
        <label className="mt-2 block text-sm">Note
          <input maxLength={140} className="mt-1 w-full rounded border p-2" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-xl border py-2" onClick={onClose}>Cancel</button>
          <button className="flex-1 rounded-xl bg-rose-700 py-2 text-white" onClick={() => {
            addSlipEvent({ challengeId, userId, date, trigger, timeBucket, place, recovery, note: note || undefined })
            onDone()
          }}>Save slip</button>
        </div>
      </div>
    </div>
  )
}
