export function Heatmap({ values }: { values: number[] }) {
  return (
    <div className="grid grid-cols-12 gap-1">
      {values.map((value, i) => {
        const level = value > 20 ? 'bg-slate-900' : value > 10 ? 'bg-slate-700' : value > 0 ? 'bg-slate-500' : 'bg-slate-200'
        return <div key={i} className={`h-4 w-4 rounded ${level}`} />
      })}
    </div>
  )
}
