export type RuleType = 'abstinence' | 'count' | 'duration'
export type MemberRole = 'owner' | 'participant' | 'follower'
export type ChallengeStatus = 'draft' | 'active' | 'completed'
export type DayStatus = 'done' | 'missed' | 'joker' | 'pending' | 'partial' | 'slip'

export interface Profile {
  id: string
  username: string
}

export interface Action {
  id: string
  key: string
  title: string
  unit: string
  valueType: RuleType
  category: string
  suggestedQuickAdd: number[]
}

export interface Challenge {
  id: string
  title: string
  description: string
  ownerId: string
  actionId: string
  ruleType: RuleType
  minPerDay?: number
  startDate: string
  endDate: string
  status: ChallengeStatus
  jokersPerPeriod: number
  finePerMiss?: number
  finePerFail?: number
  durationDays: number
  prizeUah?: number
}

export interface ChallengeMember {
  challengeId: string
  userId: string
  role: MemberRole
  baselineValue?: number
}

export interface ActionLog {
  id: string
  challengeId?: string
  userId: string
  actionId: string
  value: number
  localDate: string
  note?: string
  mood?: 'good' | 'neutral' | 'hard'
  place?: string
  source?: 'manual' | 'baseline'
  createdAt: string
}

export interface Joker {
  challengeId: string
  userId: string
  localDate: string
}

export interface LedgerRow {
  id: string
  challengeId: string
  userId: string
  type: 'deposit' | 'fine_miss' | 'fine_fail' | 'payout' | 'adjustment' | 'prize_commitment'
  amountUah: number
  note?: string
  createdAt: string
}

export interface Achievement {
  id: string
  userId: string
  title: string
  description: string
  earnedAt: string
}

export interface Friend {
  id: string
  username: string
}

export interface Invite {
  id: string
  challengeId: string
  role: 'participant' | 'follower'
  token: string
  createdAt: string
  fromUserId: string
}

export interface SlipEvent {
  id: string
  challengeId: string
  userId: string
  date: string
  trigger: 'stress' | 'boredom' | 'loneliness' | 'fatigue' | 'arousal' | 'alcohol' | 'social_media'
  timeBucket: 'morning' | 'day' | 'evening' | 'night'
  place: 'bed' | 'home' | 'work' | 'toilet' | 'outside'
  recovery: ('walk_10' | 'cold_shower' | 'breathing_2' | 'message_friend' | 'sleep')[]
  note?: string
  createdAt: string
}

export interface ChallengeReaction {
  id: string
  challengeId: string
  fromUserId: string
  toUserId: string
  date: string
  emoji: '🔥' | '👏' | '✅' | '💪'
  createdAt: string
}

export interface AppState {
  profile: Profile
  actions: Action[]
  challenges: Challenge[]
  members: ChallengeMember[]
  logs: ActionLog[]
  jokers: Joker[]
  ledger: LedgerRow[]
  achievements: Achievement[]
  friends: Friend[]
  invites: Invite[]
  slipEvents: SlipEvent[]
  reactions: ChallengeReaction[]
}
