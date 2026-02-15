'use client'

import { DayStatus } from '@/lib/types'

const colorMap: Record<DayStatus, string> = {
  done: 'bg-green-500 text-white',
  partial: 'bg-yellow-400 text-black',
  missed: 'bg-red-500 text-white',
  joker: 'bg-violet-500 text-white',
  slip: 'bg-rose-700 text-white',
  pending: 'bg-slate-100 text-slate-700',
}

export function MonthCalendar({
  statuses,
  month,
  onPick,
}: {
  month: Date
  statuses: Record<string, DayStatus>
  onPick: (date: string) => void
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const first = new Date(year, monthIndex, 1)
  const startWeekday = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const cells: Array<number | null> = []
  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="mb-2 text-lg font-bold">Календарь месяца</h3>
      <div className="mb-2 grid grid-cols-7 text-center text-xs text-slate-500">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx) => {
          if (!d) return <div key={idx} className="h-10" />
          const date = new Date(year, monthIndex, d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Kiev' })
          const status = statuses[date] || 'pending'
          return (
            <button key={idx} className={`h-10 rounded-lg text-sm font-semibold ${colorMap[status]}`} onClick={() => onPick(date)}>
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
