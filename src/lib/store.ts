'use client'

import { Action, Achievement, ActionLog, AppState, Challenge, DayStatus, LedgerRow } from './types'

const STORAGE_KEY = 'control-app-state-v1'

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })

const uuid = () => crypto.randomUUID()

const defaultActions: Action[] = [
  { id: 'a1', key: 'no_porn_day', title: 'No Porn', unit: 'clean days', valueType: 'abstinence', category: 'abstinence', suggestedQuickAdd: [1] },
  { id: 'a2', key: 'meditation_minutes', title: 'Meditation', unit: 'minutes', valueType: 'duration', category: 'mindfulness', suggestedQuickAdd: [5, 10, 15] },
  { id: 'a3', key: 'pushups', title: 'Pushups', unit: 'reps', valueType: 'count', category: 'strength', suggestedQuickAdd: [10, 25, 50] },
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

export function createChallenge(challenge: Omit<Challenge, 'id' | 'status'>, userId: string) {
  const state = readState()
  const id = uuid()
  state.challenges.unshift({ ...challenge, id, status: 'active' })
  state.members.push({ challengeId: id, userId, role: 'owner' })
  writeState(state)
  return id
}

export function addLog(challengeId: string, actionId: string, userId: string, value: number, localDate = today()) {
  const state = readState()
  state.logs.unshift({ id: uuid(), challengeId, userId, actionId, value, localDate, createdAt: new Date().toISOString() })
  state.achievements = upsertAchievements(state.achievements, state.logs, userId, actionId)
  writeState(state)
}

export function useJoker(challengeId: string, userId: string, localDate = today()) {
  const state = readState()
  if (!state.jokers.some((j) => j.challengeId === challengeId && j.userId === userId && j.localDate === localDate)) {
    state.jokers.push({ challengeId, userId, localDate })
    writeState(state)
  }
}

export function addLedger(row: Omit<LedgerRow, 'id' | 'createdAt'>) {
  const state = readState()
  state.ledger.unshift({ ...row, id: uuid(), createdAt: new Date().toISOString() })
  writeState(state)
}

export function challengeDayStatus(challenge: Challenge, logs: ActionLog[], jokers: AppState['jokers'], date: string, userId: string): DayStatus {
  const dayLogs = logs.filter((l) => l.challengeId === challenge.id && l.localDate === date && l.userId === userId)
  const sum = dayLogs.reduce((acc, l) => acc + l.value, 0)
  if (challenge.ruleType === 'abstinence') {
    if (sum >= 1) return 'done'
  }
  if ((challenge.ruleType === 'count' || challenge.ruleType === 'duration') && dayLogs.length > 0) {
    if (!challenge.minPerDay || sum >= challenge.minPerDay) return 'done'
  }
  if (jokers.some((j) => j.challengeId === challenge.id && j.userId === userId && j.localDate === date)) return 'joker'
  if (date < today()) return 'missed'
  return 'pending'
}

export function totalsByAction(logs: ActionLog[], userId: string, period: 'month' | 'year' | 'lifetime') {
  const now = new Date(today())
  return logs
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
}

function upsertAchievements(existing: Achievement[], logs: ActionLog[], userId: string, actionId: string) {
  const userActionLogs = logs.filter((l) => l.userId === userId && l.actionId === actionId)
  const lifetime = userActionLogs.reduce((a, l) => a + l.value, 0)
  const thresholds = [100, 300, 500, 1000, 2000]
  const earnedTitles = new Set(existing.filter((a) => a.userId === userId).map((a) => a.title))
  const next = [...existing]

  thresholds.forEach((threshold) => {
    const title = `Milestone ${threshold}`
    if (lifetime >= threshold && !earnedTitles.has(title)) {
      next.unshift({
        id: uuid(),
        userId,
        title,
        description: `Накоплено ${threshold}+ total`,
        earnedAt: new Date().toISOString(),
      })
    }
  })

  const monthly = new Map<string, number>()
  userActionLogs.forEach((l) => {
    const key = l.localDate.slice(0, 7)
    monthly.set(key, (monthly.get(key) || 0) + l.value)
  })
  const bestMonth = Math.max(...monthly.values(), 0)
  const currentMonth = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' }).slice(0, 7)
  if ((monthly.get(currentMonth) || 0) === bestMonth && bestMonth > 0 && !earnedTitles.has('Personal Record Month')) {
    next.unshift({
      id: uuid(),
      userId,
      title: 'Personal Record Month',
      description: `Новый рекорд месяца: ${bestMonth}`,
      earnedAt: new Date().toISOString(),
    })
  }

  return next
}
