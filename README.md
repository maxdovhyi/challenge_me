# CONTROL — Challenge & Action Bank

Mobile-first web app for daily challenge discipline with social accountability.

## Main routes

- `/today` — быстрый лог, undo, logs today, abstinence toggle, slip-flow
- `/dashboard` — active challenges + bank + calendar + day drawer
- `/friends` — invite links + challenge a friend duel flow
- `/challenges/new` — wizard с duration presets, days indicator, baseline onboarding
- `/challenges/[id]` — detail, leaderboard, ping/reactions, money block
- `/invite/[token]` — join by invite role (participant/follower)

## MVP behavior

- 1 challenge = 1 action
- Abstinence: только одно событие в день (clean/slip/missed), no multi-count
- Non-challenge logs поддерживаются (Wim Hof и др.) и идут в Action Bank
- Mid-challenge baseline: можно добавить already completed amount
- Duel prize поддерживается как manual `prize_commitment`

## Data + persistence

UI state хранится в `localStorage`.
Supabase SQL schema + RLS остаётся в `supabase/migrations/001_init.sql`.
