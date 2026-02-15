'use client'

import { Action, Achievement, ActionLog, AppState, Challenge, ChallengeReaction, DayStatus, LedgerRow, SlipEvent } from './types'

const STORAGE_KEY = 'control-app-state-v3'

export const kievToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })

const uuid = () => crypto.randomUUID()

const defaultActions: Action[] = [
  { id: 'a1', key: 'no_porn_day', title: 'No Porn', unit: 'clean days', valueType: 'abstinence', category: 'abstinence', suggestedQuickAdd: [1] },
  { id: 'a2', key: 'meditation_minutes', title: 'Meditation', unit: 'minutes', valueType: 'duration', category: 'mindfulness', suggestedQuickAdd: [5, 10, 15] },
  { id: 'a3', key: 'pushups', title: 'Pushups', unit: 'reps', valueType: 'count', category: 'strength', suggestedQuickAdd: [10, 25, 50] },
  { id: 'a4', key: 'wim_hof_cycles', title: 'Wim Hof Cycles', unit: 'cycles', valueType: 'count', category: 'breathing', suggestedQuickAdd: [1, 2, 3] },
  { id: 'a5', key: 'cold_shower', title: 'Cold Shower', unit: 'minutes', valueType: 'duration', category: 'recovery', suggestedQuickAdd: [1, 3, 5] },
]

const seed: AppState = {
  profile: { id: 'me', username: 'fighter' },
  actions: defaultActions,
  challenges: [],
  members: [],
  logs: [],
  jokers: [],
  ledger: [],
  achievements: [],
  friends: [
    { id: 'friend_1', username: 'den' },
    { id: 'friend_2', username: 'misha' },
  ],
  invites: [],
  slipEvents: [],
  reactions: [],
}

export function readState(): AppState {
  if (typeof window === 'undefined') return seed
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seed
  return JSON.parse(raw) as AppState
}

export function writeState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createChallenge(challenge: Omit<Challenge, 'id' | 'status'>, userId: string, baselineValue = 0) {
  const state = readState()
  const id = uuid()
  state.challenges.unshift({ ...challenge, id, status: 'active' })
  state.members.push({ challengeId: id, userId, role: 'owner', baselineValue })

  if (baselineValue > 0) {
    state.logs.push({
      id: uuid(),
      challengeId: id,
      userId,
      actionId: challenge.actionId,
      value: baselineValue,
      localDate: challenge.startDate,
      source: 'baseline',
      createdAt: new Date().toISOString(),
      note: 'Baseline import',
    })
  }

  if (challenge.prizeUah && challenge.prizeUah > 0) {
    state.ledger.unshift({
      id: uuid(),
      challengeId: id,
      userId,
      type: 'prize_commitment',
      amountUah: challenge.prizeUah,
      note: `Prize commitment ${challenge.prizeUah} UAH`,
      createdAt: new Date().toISOString(),
    })
  }

  writeState(state)
  return id
}

interface AddLogInput {
  challengeId?: string
  actionId: string
  userId: string
  value: number
  localDate?: string
  note?: string
  mood?: 'good' | 'neutral' | 'hard'
  place?: string
  source?: 'manual' | 'baseline'
}

export function addLog(input: AddLogInput) {
  const state = readState()
  const localDate = input.localDate || kievToday()
  const action = state.actions.find((a) => a.id === input.actionId)
  if (!action) return null

  if (action.valueType === 'abstinence') {
    state.logs = state.logs.filter(
      (l) => !(l.userId === input.userId && l.actionId === input.actionId && l.localDate === localDate && l.challengeId === input.challengeId),
    )
    state.slipEvents = state.slipEvents.filter((s) => !(s.userId === input.userId && s.challengeId === input.challengeId && s.date === localDate))
    if (input.value <= 0) {
      writeState(state)
      return null
    }
  }

  const log: ActionLog = {
    id: uuid(),
    challengeId: input.challengeId,
    userId: input.userId,
    actionId: input.actionId,
    value: input.value,
    localDate,
    note: input.note,
    mood: input.mood,
    place: input.place,
    source: input.source || 'manual',
    createdAt: new Date().toISOString(),
  }
  state.logs.unshift(log)
  state.achievements = upsertAchievements(state.achievements, state.logs, input.userId, input.actionId)
  writeState(state)
  return log
}

export function removeLog(logId: string) {
  const state = readState()
  const deleted = state.logs.find((l) => l.id === logId)
  state.logs = state.logs.filter((l) => l.id !== logId)
  writeState(state)
  return deleted || null
}

export function restoreLog(log: ActionLog) {
  const state = readState()
  state.logs.unshift(log)
  writeState(state)
}

export function toggleAbstinence(challengeId: string, actionId: string, userId: string, date = kievToday()) {
  const state = readState()
  const existing = state.logs.find((l) => l.challengeId === challengeId && l.actionId === actionId && l.userId === userId && l.localDate === date)
  if (existing) {
    state.logs = state.logs.filter((l) => l.id !== existing.id)
    writeState(state)
    return 'removed'
  }
  addLog({ challengeId, actionId, userId, value: 1, localDate: date })
  return 'added'
}

export function useJoker(challengeId: string, userId: string, localDate = kievToday()) {
  const state = readState()
  if (!state.jokers.some((j) => j.challengeId === challengeId && j.userId === userId && j.localDate === localDate)) {
    state.jokers.push({ challengeId, userId, localDate })
    writeState(state)
  }
}

export function addSlipEvent(input: Omit<SlipEvent, 'id' | 'createdAt'>) {
  const state = readState()
  const exists = state.slipEvents.some((s) => s.challengeId === input.challengeId && s.userId === input.userId && s.date === input.date)
  if (exists) return false

  const challenge = state.challenges.find((c) => c.id === input.challengeId)
  if (!challenge) return false

  state.logs = state.logs.filter((l) => !(l.challengeId === input.challengeId && l.userId === input.userId && l.localDate === input.date && l.actionId === challenge.actionId))
  state.slipEvents.unshift({ ...input, id: uuid(), createdAt: new Date().toISOString() })

  if (challenge.finePerFail && challenge.finePerFail > 0) {
    state.ledger.unshift({
      id: uuid(),
      challengeId: challenge.id,
      userId: input.userId,
      type: 'fine_fail',
      amountUah: -challenge.finePerFail,
      note: 'Slip fine',
      createdAt: new Date().toISOString(),
    })
  }

  writeState(state)
  return true
}

export function addLedger(row: Omit<LedgerRow, 'id' | 'createdAt'>) {
  const state = readState()
  state.ledger.unshift({ ...row, id: uuid(), createdAt: new Date().toISOString() })
  writeState(state)
}

export function makeInvite(challengeId: string, role: 'participant' | 'follower', fromUserId: string) {
  const state = readState()
  const invite = { id: uuid(), challengeId, role, fromUserId, token: Math.random().toString(36).slice(2, 10), createdAt: new Date().toISOString() }
  state.invites.unshift(invite)
  writeState(state)
  return `${typeof window !== 'undefined' ? window.location.origin : 'https://control.app'}/invite/${invite.token}`
}

export function joinByInvite(token: string, userId: string) {
  const state = readState()
  const invite = state.invites.find((i) => i.token === token)
  if (!invite) return false
  if (!state.members.some((m) => m.challengeId === invite.challengeId && m.userId === userId)) {
    state.members.push({ challengeId: invite.challengeId, userId, role: invite.role, baselineValue: 0 })
    writeState(state)
  }
  return true
}

export function addReaction(challengeId: string, fromUserId: string, toUserId: string, emoji: '🔥' | '👏' | '✅' | '💪', date = kievToday()) {
  const state = readState()
  if (emoji === '💪' && state.reactions.some((r) => r.challengeId === challengeId && r.fromUserId === fromUserId && r.toUserId === toUserId && r.date === date && r.emoji === '💪')) {
    return false
  }
  const reaction: ChallengeReaction = { id: uuid(), challengeId, fromUserId, toUserId, emoji, date, createdAt: new Date().toISOString() }
  state.reactions.unshift(reaction)
  writeState(state)
  return true
}

export function challengeDayStatus(challenge: Challenge, logs: ActionLog[], jokers: AppState['jokers'], slipEvents: AppState['slipEvents'], date: string, userId: string): DayStatus {
  const slipped = slipEvents.some((s) => s.challengeId === challenge.id && s.userId === userId && s.date === date)
  if (slipped) return 'slip'

  const dayLogs = logs.filter((l) => l.challengeId === challenge.id && l.localDate === date && l.userId === userId)
  const sum = dayLogs.reduce((acc, l) => acc + l.value, 0)
  if (challenge.ruleType === 'abstinence') {
    if (sum >= 1) return 'done'
  }
  if ((challenge.ruleType === 'count' || challenge.ruleType === 'duration') && dayLogs.length > 0) {
    if (!challenge.minPerDay || sum >= challenge.minPerDay) return 'done'
    return 'partial'
  }
  if (jokers.some((j) => j.challengeId === challenge.id && j.userId === userId && j.localDate === date)) return 'joker'
  if (date < kievToday()) return 'missed'
  return 'pending'
}

export function dayAggregateStatus(state: AppState, date: string, userId: string): DayStatus {
  const myChallenges = state.challenges.filter((c) => state.members.some((m) => m.challengeId === c.id && m.userId === userId && m.role !== 'follower'))
  if (myChallenges.length === 0) return 'pending'
  const statuses = myChallenges.map((c) => challengeDayStatus(c, state.logs, state.jokers, state.slipEvents, date, userId))
  if (statuses.some((s) => s === 'joker')) return 'joker'
  if (statuses.some((s) => s === 'slip')) return 'slip'
  if (statuses.every((s) => s === 'done')) return 'done'
  if (statuses.some((s) => s === 'done' || s === 'partial')) return 'partial'
  if (statuses.every((s) => s === 'missed')) return 'missed'
  return 'pending'
}

export function totalsByAction(logs: ActionLog[], members: AppState['members'], challengeIdByMemberUser: string | null, userId: string, period: 'month' | 'year' | 'lifetime') {
  const now = new Date(kievToday())
  const totals = logs
    .filter((l) => l.userId === userId)
    .filter((l) => {
      if (period === 'lifetime') return true
      const d = new Date(l.localDate)
      if (period === 'year') return d.getFullYear() === now.getFullYear()
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce<Record<string, number>>((acc, log) => {
      acc[log.actionId] = (acc[log.actionId] || 0) + log.value
      return acc
    }, {})

  members.filter((m) => m.userId === userId && (!challengeIdByMemberUser || m.challengeId === challengeIdByMemberUser)).forEach((m) => {
    if (m.baselineValue && m.baselineValue > 0) {
      const challengeAction = readState().challenges.find((c) => c.id === m.challengeId)?.actionId
      if (challengeAction) totals[challengeAction] = (totals[challengeAction] || 0) + m.baselineValue
    }
  })
  return totals
}

function upsertAchievements(existing: Achievement[], logs: ActionLog[], userId: string, actionId: string) {
  const userActionLogs = logs.filter((l) => l.userId === userId && l.actionId === actionId)
  const lifetime = userActionLogs.reduce((a, l) => a + l.value, 0)
  const thresholds = [100, 300, 500, 1000, 2000]
  const earnedTitles = new Set(existing.filter((a) => a.userId === userId).map((a) => `${a.title}:${a.description}`))
  const next = [...existing]

  thresholds.forEach((threshold) => {
    const key = `Milestone ${threshold}:${actionId}`
    if (lifetime >= threshold && !earnedTitles.has(key)) {
      next.unshift({
        id: uuid(),
        userId,
        title: `Milestone ${threshold}`,
        description: `${actionId}: накоплено ${threshold}+`,
        earnedAt: new Date().toISOString(),
      })
    }
  })

  return next
}
