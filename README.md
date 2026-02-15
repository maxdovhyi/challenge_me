# CONTROL — Challenge & Action Bank

Mobile-first web app (Next.js App Router + Tailwind) for challenge tracking with:

- Today quick log flow
- Challenge creation wizard
- Challenge detail with leaderboard
- Action Bank totals (month/year/lifetime)
- Achievements (milestones + personal record month)
- Year recap heatmap
- Manual money ledger (deposits/fines)

## Routes

- `/today`
- `/challenges`
- `/challenges/new`
- `/challenges/[id]`
- `/bank`
- `/profile`

## Data + persistence

MVP UI runs fully from `localStorage` for fast demo flow.
Supabase SQL schema and RLS policies are in `supabase/migrations/001_init.sql`.

## MVP decisions

- 1 challenge = 1 action
- Abstinence logic uses explicit `Clean day ✅` log (option A)
- Timezone: Europe/Kiev
- Bottom nav and back links for smooth app navigation
