'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  actions: Action[]
  defaultActionId?: string
  onSave: (payload: { actionId: string; value: number; note?: string; mood?: 'good' | 'neutral' | 'hard'; place?: string }) => void
}

export function LogModal({ open, onClose, actions, defaultActionId, onSave }: Props) {
  const [actionId, setActionId] = useState(defaultActionId || actions[0]?.id || '')
  const [value, setValue] = useState(1)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<'good' | 'neutral' | 'hard'>('good')
  const [place, setPlace] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4">
      <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-4">
        <h3 className="text-xl font-bold">Добавить лог</h3>
        <label className="mt-3 block text-sm">Активность
          <select className="mt-1 w-full rounded-lg border p-2" value={actionId} onChange={(e) => setActionId(e.target.value)}>
            {actions.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </label>
        <label className="mt-2 block text-sm">Значение
          <input type="number" className="mt-1 w-full rounded-lg border p-2" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </label>
        <label className="mt-2 block text-sm">Ощущения
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => setMood('good')} className={`rounded-lg px-3 py-1 ${mood === 'good' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>🙂</button>
            <button type="button" onClick={() => setMood('neutral')} className={`rounded-lg px-3 py-1 ${mood === 'neutral' ? 'bg-amber-600 text-white' : 'bg-slate-100'}`}>😐</button>
            <button type="button" onClick={() => setMood('hard')} className={`rounded-lg px-3 py-1 ${mood === 'hard' ? 'bg-rose-600 text-white' : 'bg-slate-100'}`}>😣</button>
          </div>
        </label>
        <label className="mt-2 block text-sm">Где делал?
          <input className="mt-1 w-full rounded-lg border p-2" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="дом/зал/улица" />
        </label>
        <label className="mt-2 block text-sm">Комментарий
          <textarea className="mt-1 w-full rounded-lg border p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Кайфанул? тяжело?" />
        </label>
        <div className="mt-4 flex gap-2">
          <button type="button" className="flex-1 rounded-xl border py-2" onClick={onClose}>Отмена</button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-black py-2 text-white"
            onClick={() => {
              onSave({ actionId, value, note: note || undefined, mood, place: place || undefined })
              onClose()
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
