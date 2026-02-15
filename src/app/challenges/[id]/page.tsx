'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LogModal } from '@/components/log-modal'
import { useApp } from '@/components/app-provider'
import { addLedger, addLog, addReaction, addSlipEvent, challengeDayStatus, kievToday, makeInvite, removeLog, restoreLog, toggleAbstinence } from '@/lib/store'

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, refresh } = useApp()
  const [manualValue, setManualValue] = useState(10)
  const [openModal, setOpenModal] = useState(false)
  const [showLogsToday, setShowLogsToday] = useState(false)
  const [deletedFull, setDeletedFull] = useState<ReturnType<typeof removeLog> | null>(null)
  const [inviteLink, setInviteLink] = useState('')

  const challenge = state.challenges.find((c) => c.id === id)
  const me = state.profile.id

  const action = state.actions.find((a) => a.id === challenge?.actionId)
  const members = state.members.filter((m) => m.challengeId === id)

  const leaderboard = useMemo(() => {
    return members.filter((m) => m.role !== 'follower').map((member) => {
      const logs = state.logs.filter((l) => l.challengeId === id && l.userId === member.userId)
      const total = logs.reduce((a, l) => a + l.value, 0)
      const doneDays = new Set(logs.map((l) => l.localDate)).size
      const reactionsToday = state.reactions.filter((r) => r.challengeId === id && r.toUserId === member.userId && r.date === kievToday()).length
      return { userId: member.userId, role: member.role, total, doneDays, reactionsToday }
    }).sort((a, b) => b.total - a.total)
  }, [members, state.logs, state.reactions, id])

  if (!challenge || !action) return <p>Challenge not found</p>

  const today = kievToday()
  const todayStatus = challengeDayStatus(challenge, state.logs, state.jokers, state.slipEvents, today, me)
  const challengeLogs = state.logs.filter((l) => l.challengeId === id).slice(0, 20)
  const bank = state.ledger.filter((l) => l.challengeId === id).reduce((a, r) => a + r.amountUah, 0)

  return (
    <section className="space-y-4">
      <Link href="/dashboard" className="text-sm underline">← Назад к Dashboard</Link>
      <header className="rounded-2xl border bg-white p-4">
        <h1 className="text-2xl font-black">{challenge.title}</h1>
        <p className="text-sm text-slate-600">{challenge.startDate} → {challenge.endDate} · {challenge.status}</p>
        <p className="text-sm">Role: {members.find((m) => m.userId === me)?.role || 'none'}</p>
        <p className="mt-1">Today: <b>{todayStatus}</b></p>
        <div className="mt-3 flex flex-wrap gap-2">
          {action.valueType === 'abstinence' ? (
            <button className="rounded-xl bg-black px-3 py-2 text-white" onClick={() => { toggleAbstinence(challenge.id, action.id, me, today); refresh() }}>
              Toggle clean day ✅
            </button>
          ) : (
            <>
              {action.suggestedQuickAdd.map((step) => (
                <button key={step} className="rounded-xl bg-black px-3 py-2 text-white" onClick={() => { addLog({ challengeId: challenge.id, actionId: action.id, userId: me, value: step }); refresh() }}>
                  +{step}
                </button>
              ))}
              <input type="number" className="w-24 rounded-lg border px-2" value={manualValue} onChange={(e) => setManualValue(Number(e.target.value))} />
              <button className="rounded-xl bg-slate-800 px-3 py-2 text-white" onClick={() => { addLog({ challengeId: challenge.id, actionId: action.id, userId: me, value: manualValue }); refresh() }}>Log</button>
            </>
          )}
          <button className="rounded-xl border px-3 py-2" onClick={() => setOpenModal(true)}>Расширенный лог</button>
          <button className="rounded-xl border px-3 py-2" onClick={() => setShowLogsToday(true)}>Logs today 📋</button>
          {challenge.ruleType === 'abstinence' && <button className="rounded-xl bg-rose-700 px-3 py-2 text-white" onClick={() => { addSlipEvent({ challengeId: challenge.id, userId: me, date: today, trigger: 'stress', timeBucket: 'evening', place: 'home', recovery: ['walk_10'] }); refresh() }}>I slipped today</button>}
        </div>
      </header>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Leaderboard</h2>
          <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => setInviteLink(makeInvite(challenge.id, 'participant', me))}>Challenge a friend ⚔️</button>
        </div>
        {inviteLink && <p className="mb-2 rounded bg-slate-100 p-2 text-xs break-all">{inviteLink}</p>}
        <div className="space-y-2">
          {leaderboard.map((row, index) => (
            <div key={row.userId} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span>#{index + 1} {row.userId} <b className="text-xs">({row.role})</b></span>
                <span>{row.total} {action.unit} · {row.doneDays} days</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span>+{row.reactionsToday} reactions today</span>
                {row.userId !== me && (
                  <>
                    {(['💪', '🔥', '👏', '✅'] as const).map((emoji) => (
                      <button key={emoji} className="rounded border px-2" onClick={() => { addReaction(challenge.id, me, row.userId, emoji); refresh() }}>{emoji}</button>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Money penalties</h2>
          <span className="font-bold">{bank}₴</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-rose-600 px-3 py-2 text-white" onClick={() => { addLedger({ challengeId: id, userId: me, type: 'fine_miss', amountUah: -(challenge.finePerMiss || 0), note: 'Miss fine' }); refresh() }}>Apply miss fine</button>
          <button className="rounded-xl bg-rose-800 px-3 py-2 text-white" onClick={() => { addLedger({ challengeId: id, userId: me, type: 'fine_fail', amountUah: -(challenge.finePerFail || 0), note: 'Fail fine' }); refresh() }}>Apply fail fine</button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-bold">Logs feed</h2>
        <div className="space-y-2 text-sm">
          {challengeLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
              <span>{log.localDate} · +{log.value} {action.unit} {log.source === 'baseline' ? '(baseline)' : ''}</span>
              <button onClick={() => { const full = removeLog(log.id); setDeletedFull(full); refresh() }}>🗑️</button>
            </div>
          ))}
        </div>
        {deletedFull && <button className="mt-2 text-xs underline" onClick={() => { if (deletedFull) restoreLog(deletedFull); setDeletedFull(null); refresh() }}>Undo last delete ↩️</button>}
      </section>

      {showLogsToday && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={() => setShowLogsToday(false)}>
          <div className="mx-auto mt-24 max-w-xl rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Logs today</h3>
            <div className="mt-2 space-y-2 text-sm">
              {state.logs.filter((l) => l.challengeId === id && l.localDate === today).map((l) => <div key={l.id} className="rounded bg-slate-50 p-2">{l.value} · {l.note || 'без заметки'}</div>)}
            </div>
          </div>
        </div>
      )}

      <LogModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        actions={[action]}
        defaultActionId={action.id}
        onSave={(payload) => {
          addLog({ ...payload, challengeId: challenge.id, userId: me, localDate: today })
          refresh()
        }}
      />
    </section>
  )
}
