import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { toISODate } from '@/domain/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { t } from '@/i18n/pt-BR'

export function Corpo() {
  const st = useStore()
  const [date, setDate] = useState(toISODate(new Date()))
  const [w, setW] = useState(''); const [l, setL] = useState(''); const [r, setR] = useState('')
  const num = (s: string) => (s === '' ? undefined : Number(s))
  return (
    <div className="p-4">
      <h1 className="mb-3 text-2xl font-bold">{t.corpo.title}</h1>
      <Card><CardHeader><CardDescription>{t.corpo.hint}</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Data</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="col-span-2"><Label>{t.corpo.weight}</Label><Input type="number" inputMode="decimal" step="0.1" value={w} onChange={e => setW(e.target.value)} /></div>
          <div><Label>{t.corpo.armL}</Label><Input type="number" inputMode="decimal" step="0.1" value={l} onChange={e => setL(e.target.value)} /></div>
          <div><Label>{t.corpo.armR}</Label><Input type="number" inputMode="decimal" step="0.1" value={r} onChange={e => setR(e.target.value)} /></div>
          <Button className="col-span-2" onClick={() => { st.addBody({ date, bodyweightKg: num(w), armLeftCm: num(l), armRightCm: num(r) }); if (num(w)) st.updateSettings({ bodyweightKg: Number(w) }); setW(''); setL(''); setR('') }}>{t.corpo.save}</Button>
        </CardContent></Card>
      {st.body.length > 0 && <Card className="mt-3"><CardHeader><CardTitle>Registros</CardTitle></CardHeader>
        <CardContent><table className="w-full text-sm"><thead className="text-muted-foreground"><tr><th className="text-left font-normal">Data</th><th className="text-right font-normal">kg</th><th className="text-right font-normal">E cm</th><th className="text-right font-normal">D cm</th></tr></thead>
          <tbody>{[...st.body].reverse().slice(0, 12).map(b => <tr key={b.date}><td>{b.date}</td><td className="text-right tabular-nums">{b.bodyweightKg ?? '—'}</td><td className="text-right tabular-nums">{b.armLeftCm ?? '—'}</td><td className="text-right tabular-nums">{b.armRightCm ?? '—'}</td></tr>)}</tbody></table></CardContent></Card>}
    </div>
  )
}
