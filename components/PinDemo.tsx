'use client'
import { useState } from 'react'
const pins = [
  { x: 14, y: 22, who: 'Aisha (client)', text: 'Can the headline be bigger?' },
  { x: 62, y: 48, who: 'Aisha (client)', text: 'Love this image. Keep it.' },
]
const blocks = [[6, 10, 52, 16], [6, 34, 36, 44], [48, 34, 44, 20], [48, 60, 44, 18]]

export default function PinDemo() {
  const [done, setDone] = useState<number[]>([])
  const [open, setOpen] = useState<number | null>(null)
  const left = pins.length - done.length
  return (
    <div id="demo" className="overflow-hidden rounded-2xl border border-line bg-card shadow-xl">
      <div className="flex justify-between border-b border-line px-4 py-3 text-[13px] text-mute">
        <span>Brand-homepage-v3.fig</span>
        <span className="rounded-full bg-soft px-2.5 text-xs font-semibold text-brand">{left ? `${left} open comments` : 'Approved ✓'}</span>
      </div>
      <div className="relative m-3.5 h-[280px] rounded-lg bg-gradient-to-br from-indigo-200 via-indigo-100 to-amber-200" onClick={() => setOpen(null)}>
        {blocks.map(([l, t, w, h]) => <i key={l + t} className="absolute rounded-lg bg-white/75" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }} />)}
        {pins.map((p, i) => (
          <button key={i} aria-label={`Comment ${i + 1}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onClick={(e) => { e.stopPropagation(); setOpen(i) }}
            className={`absolute h-[30px] w-[30px] -rotate-45 rounded-[50%_50%_50%_4px] border-2 border-white text-[13px] font-bold text-white ${done.includes(i) ? 'bg-ok' : 'bg-brand'}`}>
            <span className="block rotate-45">{i + 1}</span>
          </button>
        ))}
        {open !== null && (
          <div onClick={(e) => e.stopPropagation()} className="absolute w-48 rounded-xl border border-line bg-card p-3 text-[13px] shadow-lg"
            style={{ left: `${Math.min(pins[open].x, 55)}%`, top: `calc(${pins[open].y}% + 34px)` }}>
            <b>{pins[open].who}</b><p className="text-mute">{pins[open].text}</p>
            {done.includes(open) ? <p className="mt-1 text-ok">Resolved</p> : (
              <button className="mt-2 rounded-lg bg-ok px-2.5 py-1 font-semibold text-white" onClick={() => { setDone([...done, open]); setOpen(null) }}>Resolve</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
