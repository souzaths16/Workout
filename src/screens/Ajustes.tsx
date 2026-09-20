import { useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { buildableLoads } from '@/domain/inventory'
import { exportCsv, exportJson, importJson } from '@/domain/exportImport'
import { EVIDENCE, TIER_LABEL } from '@/domain/evidence'
import { download } from '@/lib/download'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { t } from '@/i18n/pt-BR'

export function Ajustes() {
  const st = useStore()
  const inv = st.settings.inventory
  const fileRef = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState<string | null>(null)
  const [newPlate, setNewPlate] = useState({ kg: '', count: '' })
  const [newKb, setNewKb] = useState('')
  const [newBand, setNewBand] = useState('')
  const [newAdj, setNewAdj] = useState({ min: '2.5', max: '24', step: '2.5' })
  const pairMax = buildableLoads(inv, 'dumbbell_pair').at(-1) ?? 0
  const singleMax = buildableLoads(inv, 'dumbbell_single').at(-1) ?? 0
  const state = { schemaVersion: st.schemaVersion, settings: st.settings, weeks: st.weeks, sessions: st.sessions, pullup: st.pullup, body: st.body, active: st.active }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-2xl font-bold">{t.ajustes.title}</h1>

      <Card><CardHeader><CardTitle>{t.ajustes.inventory}</CardTitle><CardDescription>Par de halteres até {pairMax} kg cada · halter único até {singleMax} kg</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>{t.ajustes.plates}</Label>
            <ul className="mt-1 space-y-1 text-sm">{inv.plates.map((p, i) => <li key={i} className="flex items-center justify-between rounded-md bg-muted px-2 py-1"><span>{p.kg} kg × {p.count}</span><Button size="sm" variant="ghost" onClick={() => st.updateInventory({ plates: inv.plates.filter((_, j) => j !== i) })}>{t.ajustes.remove}</Button></li>)}</ul>
            <div className="mt-2 flex gap-2"><Input placeholder="kg" inputMode="decimal" value={newPlate.kg} onChange={e => setNewPlate(p => ({ ...p, kg: e.target.value }))} /><Input placeholder="qtd" inputMode="numeric" value={newPlate.count} onChange={e => setNewPlate(p => ({ ...p, count: e.target.value }))} />
              <Button variant="secondary" onClick={() => { if (newPlate.kg && newPlate.count) { st.updateInventory({ plates: [...inv.plates, { kg: Number(newPlate.kg), count: Number(newPlate.count) }] }); setNewPlate({ kg: '', count: '' }) } }}>{t.ajustes.add}</Button></div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t.ajustes.handle}</Label><Input type="number" inputMode="decimal" step="0.1" value={inv.handleKg} onChange={e => st.updateInventory({ handleKg: Number(e.target.value) })} /></div>
            <div><Label>{t.ajustes.handles}</Label><Input type="number" inputMode="numeric" value={inv.handles} onChange={e => st.updateInventory({ handles: Number(e.target.value) })} /></div>
          </div>
          <div><Label>{t.ajustes.adjustable}</Label>
            <ul className="mt-1 space-y-1 text-sm">{inv.adjustable.map((a, i) => <li key={i} className="flex items-center justify-between rounded-md bg-muted px-2 py-1"><span>{a.minKg}–{a.maxKg} kg, passo {a.stepKg} {a.pair ? '(par)' : '(único)'}</span><Button size="sm" variant="ghost" onClick={() => st.updateInventory({ adjustable: inv.adjustable.filter((_, j) => j !== i) })}>{t.ajustes.remove}</Button></li>)}</ul>
            <div className="mt-2 flex gap-2"><Input placeholder="min" inputMode="decimal" value={newAdj.min} onChange={e => setNewAdj(p => ({ ...p, min: e.target.value }))} /><Input placeholder="max" inputMode="decimal" value={newAdj.max} onChange={e => setNewAdj(p => ({ ...p, max: e.target.value }))} /><Input placeholder="passo" inputMode="decimal" value={newAdj.step} onChange={e => setNewAdj(p => ({ ...p, step: e.target.value }))} />
              <Button variant="secondary" onClick={() => st.updateInventory({ adjustable: [...inv.adjustable, { minKg: Number(newAdj.min), maxKg: Number(newAdj.max), stepKg: Number(newAdj.step), pair: true }] })}>{t.ajustes.add}</Button></div></div>
          <div><Label>{t.ajustes.kettlebells}</Label>
            <div className="mt-1 flex flex-wrap gap-2">{inv.kettlebells.map((k, i) => <Badge key={i} variant="secondary" className="gap-1">{k} kg <button type="button" aria-label="remover" onClick={() => st.updateInventory({ kettlebells: inv.kettlebells.filter((_, j) => j !== i) })}>×</button></Badge>)}</div>
            <div className="mt-2 flex gap-2"><Input placeholder="kg" inputMode="decimal" value={newKb} onChange={e => setNewKb(e.target.value)} /><Button variant="secondary" onClick={() => { if (newKb) { st.updateInventory({ kettlebells: [...inv.kettlebells, Number(newKb)].sort((a, b) => a - b) }); setNewKb('') } }}>{t.ajustes.add}</Button></div></div>
          <div><Label>{t.ajustes.bands}</Label>
            <div className="mt-1 flex flex-wrap gap-2">{inv.bands.map((b, i) => <Badge key={i} variant="secondary" className="gap-1">{b} kg <button type="button" aria-label="remover" onClick={() => st.updateInventory({ bands: inv.bands.filter((_, j) => j !== i) })}>×</button></Badge>)}</div>
            <div className="mt-2 flex gap-2"><Input placeholder="kg" inputMode="decimal" value={newBand} onChange={e => setNewBand(e.target.value)} /><Button variant="secondary" onClick={() => { if (newBand) { st.updateInventory({ bands: [...inv.bands, Number(newBand)].sort((a, b) => a - b) }); setNewBand('') } }}>{t.ajustes.add}</Button></div></div>
          <div className="flex items-center justify-between"><Label>{t.ajustes.belt}</Label><Switch checked={inv.dipBelt} onCheckedChange={v => st.updateInventory({ dipBelt: v })} /></div>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>Programa</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>{t.ajustes.weekMode}</Label><div className="mt-1 grid grid-cols-2 gap-2"><Button variant={st.settings.weekMode === '6x45' ? 'default' : 'outline'} onClick={() => st.updateSettings({ weekMode: '6x45' })}>{t.ajustes.mode6}</Button><Button variant={st.settings.weekMode === '4x45' ? 'default' : 'outline'} onClick={() => st.updateSettings({ weekMode: '4x45', sessionCapMin: 45 })}>{t.ajustes.mode4}</Button></div><p className="mt-1 text-xs text-muted-foreground">Vale para semanas ainda não geradas.</p></div>
          <div className="flex items-center justify-between"><Label>{t.ajustes.rowRest}</Label><Switch checked={st.settings.rowingRestDay} onCheckedChange={v => st.updateSettings({ rowingRestDay: v })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t.ajustes.startDate}</Label><Input type="date" value={st.settings.startDate} onChange={e => st.updateSettings({ startDate: e.target.value })} /></div>
            <div><Label>{t.ajustes.cap}</Label><Input type="number" inputMode="numeric" value={st.settings.sessionCapMin} onChange={e => st.updateSettings({ sessionCapMin: Number(e.target.value) })} /></div>
            <div><Label>{t.ajustes.bodyweight}</Label><Input type="number" inputMode="decimal" step="0.1" value={st.settings.bodyweightKg} onChange={e => st.updateSettings({ bodyweightKg: Number(e.target.value) })} /></div>
          </div>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.ajustes.shopping}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{t.ajustes.buyNow}</p>
          <ul className="list-disc pl-5 text-muted-foreground"><li>Anilhas fracionadas de 0,5 kg × 4 que encaixem no cabo do kit (meça o furo; costuma ser 25 mm). Motivo: hoje o menor salto é 2,5 kg por halter, grande demais para elevação lateral e rosca.</li><li>Par de halteres ajustáveis até pelo menos 20 kg cada (tipo dial 2,5–24 kg), ou kettlebells de 16 e 20 kg. Motivo: terra romeno e búlgaro passam de 10 kg por mão cedo; enquanto isso o app soma bandas do seu kit por cima do halter, mas isso adia a compra, não substitui.</li></ul>
          <p className="font-medium">{t.ajustes.buyLater}</p>
          <ul className="list-disc pl-5 text-muted-foreground"><li>Cinto de mergulho + anilhas quando as paralelas chegarem a 3×12 ou a barra fixa a 3×5 estritas.</li><li>Faixa de 28–32 kg por mão (ou kettlebell de 24–32 kg) quando o terra romeno bater o teto.</li></ul>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.ajustes.export}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => download(`treino-${new Date().toISOString().slice(0, 10)}.json`, exportJson(state), 'application/json')}>{t.ajustes.exportJson}</Button>
          <Button variant="secondary" onClick={() => download(`treino-${new Date().toISOString().slice(0, 10)}.csv`, exportCsv(st.sessions), 'text/csv')}>{t.ajustes.exportCsv}</Button>
          <Button variant="outline" className="col-span-2" onClick={() => fileRef.current?.click()}>{t.ajustes.import}</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { st.importState(importJson(await f.text())); setErr(null) } catch (ex) { setErr((ex as Error).message) } e.target.value = '' }} />
          {err && <p className="col-span-2 text-sm text-destructive">{err}</p>}
          <Button variant="destructive" className="col-span-2" onClick={() => { if (confirm(t.ajustes.resetConfirm)) st.resetAll() }}>{t.ajustes.reset}</Button>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.ajustes.evidence}</CardTitle><CardDescription>Hierarquia: mulheres 40+ → mulheres → sexo misto/homens (extrapolado, sempre sinalizado).</CardDescription></CardHeader>
        <CardContent className="space-y-2">{EVIDENCE.map(e => <div key={e.n} className="rounded-md bg-muted p-2 text-sm"><div className="mb-1 flex items-center gap-2"><span className="font-medium">#{e.n}</span><Badge variant={e.tier === 'W40+' || e.tier === 'W' ? 'success' : e.tier === 'unknown' ? 'outline' : 'warning'}>{TIER_LABEL[e.tier]}</Badge></div><p>{e.claim}</p><p className="text-xs text-muted-foreground">{e.source} · {e.strength}</p></div>)}</CardContent></Card>
    </div>
  )
}
