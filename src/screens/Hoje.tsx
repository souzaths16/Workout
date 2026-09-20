import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { TEMPLATE_BY_ID } from '@/domain/templates'
import { EXERCISE_BY_ID } from '@/domain/exercises'
import { toISODate, weekIndexOf } from '@/domain/dates'
import { prescribe } from '@/domain/prescribe'
import { planBlocks, shouldTrim } from '@/domain/week'
import { LADDER_BY_STAGE } from '@/domain/pullupLadder'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SetRow, SetHeader } from '@/components/SetRow'
import { RestTimer } from '@/components/RestTimer'
import { SoreSheet } from '@/components/SoreSheet'
import { ChooseDaySheet } from '@/components/ChooseDaySheet'
import { EvidenceBadge } from '@/components/EvidenceBadge'
import { t } from '@/i18n/pt-BR'
import { cn } from '@/lib/utils'

function useClock(startedAt?: string) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  return startedAt ? Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000)) : 0
}

export function Hoje() {
  const today = toISODate(new Date())
  const st = useStore()
  const week = st.getWeek(today)
  useEffect(() => { if (!week) st.ensureWeek(today) }, [week, today]) // eslint-disable-line react-hooks/exhaustive-deps
  const day = week?.days.find(d => d.date === today)
  const template = day ? TEMPLATE_BY_ID[day.templateId] : undefined
  const wi = weekIndexOf(st.settings.startDate, today)
  const [soreOpen, setSoreOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [rowMin, setRowMin] = useState(20)
  const [restKey, setRestKey] = useState(0)
  const [restSec, setRestSec] = useState(90)
  const [warm, setWarm] = useState<boolean[]>([false, false])
  const [chooseOpen, setChooseOpen] = useState(false)
  const active = st.active && st.active.date === today ? st.active : null
  const elapsed = useClock(active?.startedAt)
  const capSec = st.settings.sessionCapMin * 60

  const preview = useMemo(() => {
    if (!template || template.kind !== 'lift') return []
    const blocks = planBlocks(template, wi, !!week?.light, shouldTrim(template.id, st.sessions, st.settings.sessionCapMin))
    return blocks.map(b => {
      const ex = EXERCISE_BY_ID[b.exerciseId]
      const history = st.sessions.filter(s => s.finishedAt).flatMap(s => s.exercises.filter(e => e.exerciseId === ex.id))
      return { block: b, ex, p: prescribe(ex, history, st.settings.inventory, wi, b.sets) }
    })
  }, [template, wi, week?.light, st.sessions, st.settings])

  if (!week || !day || !template) return <p className="p-4 text-muted-foreground">{t.hoje.noWeek}</p>

  const header = (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.common.week} {wi} · {day.date}</p>
        <h1 className="text-2xl font-bold">{template.nome}</h1>
      </div>
      {week.light && <Badge variant="warning">{t.hoje.lightOn}</Badge>}
    </div>
  )

  if (st.active && st.active.date !== today) {
    return (
      <div className="p-4">{header}
        <Card><CardHeader><CardTitle>Treino de {st.active.date} ainda aberto</CardTitle><CardDescription>Conclua ou descarte antes de começar o de hoje.</CardDescription></CardHeader>
          <CardContent className="flex gap-2"><Button onClick={() => st.finishSession()}>{t.hoje.finish}</Button><Button variant="outline" onClick={() => st.discardSession()}>{t.hoje.discard}</Button></CardContent></Card>
      </div>
    )
  }

  if (template.kind === 'rest' || template.kind === 'row') {
    return (
      <div className="p-4">{header}
        <Card>
          <CardHeader><CardTitle>{template.kind === 'rest' ? t.hoje.restDay : t.hoje.rowDay}</CardTitle><CardDescription>{t.hoje.rowHint}</CardDescription></CardHeader>
          <CardContent>
            {day.status === 'done' ? <Badge variant="success">{t.semana.done}</Badge> : (
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="numeric" value={rowMin} onChange={e => setRowMin(Number(e.target.value))} className="w-24" aria-label={t.hoje.minutes} />
                <span className="text-sm text-muted-foreground">{t.hoje.minutes}</span>
                <Button onClick={() => st.logRowing(today, rowMin)}>{t.hoje.logRow}</Button>
              </div>
            )}
          </CardContent>
        </Card>
        {day.status !== 'done' && (
          <Button variant="outline" className="mt-3 w-full" onClick={() => setChooseOpen(true)}>{t.hoje.trainInstead}</Button>
        )}
        <ChooseDaySheet open={chooseOpen} onOpenChange={setChooseOpen} week={week} excludeDate={today} onPick={otherDate => st.swapWithDay(today, otherDate)} />
      </div>
    )
  }

  if (day.status === 'done' && !active) {
    return <div className="p-4">{header}<Card><CardHeader><CardTitle>{t.hoje.doneToday}</CardTitle><CardDescription>{t.hoje.alreadyDone}</CardDescription></CardHeader></Card></div>
  }

  if (!active) {
    return (
      <div className="p-4">{header}
        {msg && <p className="mb-3 rounded-md bg-muted p-3 text-sm">{msg}</p>}
        <div className="space-y-3">
          {preview.map(({ block, ex, p }) => (
            <Card key={block.exerciseId + block.sets}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2"><CardTitle>{ex.nome}</CardTitle><EvidenceBadge ex={ex} /></div>
                <CardDescription>
                  {block.sets} × {ex.loadType === 'pullup_ladder' ? `${LADDER_BY_STAGE(st.pullup.stage).target} ${LADDER_BY_STAGE(st.pullup.stage).unit} · ${LADDER_BY_STAGE(st.pullup.stage).nome}` : `${p.reps[0]}${p.reps[0] !== p.reps[p.reps.length - 1] ? '–' + p.reps[p.reps.length - 1] : ''} reps`}
                  {p.loadKg != null && ex.loadType !== 'pullup_ladder' ? ` · ${p.loadKg} kg${ex.loadType === 'dumbbell_pair' ? ' por halter' : ''}` : ''}
                  {p.assist ? ` · ${t.hoje.assist} ${p.assist}` : ''}
                  {block.pairedWith ? ` · ${t.hoje.paired} ${EXERCISE_BY_ID[block.pairedWith].nome.split(' ')[0].toLowerCase()}` : ''}
                </CardDescription>
                {p.calibration && <Badge variant="outline" className="w-fit">{t.hoje.calibration}</Badge>}
                {p.buy && <Badge variant="warning" className="w-fit">{t.hoje.buy}</Badge>}
                {p.note && <p className="text-xs text-muted-foreground">{p.note}</p>}
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setSoreOpen(true)}>{t.hoje.sore}</Button>
          <Button variant="outline" onClick={() => st.toggleLightWeek(today)}>{t.hoje.light}</Button>
        </div>
        <Button size="lg" className="mt-3 w-full" onClick={() => { st.startSession(today, template.id); setWarm([false, false]) }}>{t.hoje.start}</Button>
        <SoreSheet open={soreOpen} onOpenChange={setSoreOpen} onApply={g => { const r = st.markSore(today, g); setMsg(r === 'swap' ? t.sore.swap : r === 'row' ? t.sore.row : t.sore.none) }} />
      </div>
    )
  }

  const stretches = [...new Set(active.exercises.flatMap(e => EXERCISE_BY_ID[e.exerciseId].stretches))]
  const over = elapsed > capSec
  return (
    <div className="p-4 pb-28">{header}
      <div className={cn('mb-3 flex items-center justify-between rounded-md border px-3 py-2 text-sm', over ? 'border-warning text-warning' : 'text-muted-foreground')}>
        <span>{t.hoje.clock}</span><span className="text-lg font-semibold tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span><span>{over ? t.hoje.over : `/ ${st.settings.sessionCapMin} min`}</span>
      </div>
      <Card className="mb-3"><CardHeader><CardTitle>{t.hoje.warmup}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[t.hoje.warmupRow, t.hoje.warmupRamp].map((w, i) => (
            <label key={w} className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={warm[i]} onChange={e => setWarm(a => a.map((v, j) => (j === i ? e.target.checked : v)))} /><span className={warm[i] ? 'line-through text-muted-foreground' : ''}>{w}</span></label>
          ))}
        </CardContent></Card>
      <div className="space-y-3">
        {active.exercises.map((se, exIdx) => {
          const ex = EXERCISE_BY_ID[se.exerciseId]
          const block = TEMPLATE_BY_ID[active.templateId].blocks.find(b => b.exerciseId === ex.id)
          const stage = se.stage
          return (
            <Card key={ex.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2"><CardTitle>{ex.nome}</CardTitle><EvidenceBadge ex={ex} /></div>
                <CardDescription>{ex.repRange[0]}–{ex.repRange[1]} {ex.loadType === 'pullup_ladder' ? LADDER_BY_STAGE(stage ?? 0).unit : 'reps'} · {ex.tempo}{block?.pairedWith ? ` · ${t.hoje.paired} ${EXERCISE_BY_ID[block.pairedWith].nome.split(' ')[0].toLowerCase()}` : ''}</CardDescription>
                {ex.loadType === 'pullup_ladder' && <p className="text-xs text-muted-foreground">{LADDER_BY_STAGE(stage ?? 0).nome}: {LADDER_BY_STAGE(stage ?? 0).descricao}</p>}
                {se.sets[0]?.suggestedLoadKg == null && ex.loadType !== 'pullup_ladder' && ex.loadType !== 'bodyweight' && <Badge variant="warning" className="w-fit">{t.hoje.buy}</Badge>}
              </CardHeader>
              <CardContent className="space-y-1">
                <SetHeader ex={ex} stage={stage} />
                {se.sets.map((s, setIdx) => (
                  <SetRow key={s.n} ex={ex} set={s} stage={stage} onChange={p => st.updateSet(exIdx, setIdx, p)} onDone={() => { setRestSec(block?.pairedWith ? 60 : ex.restSec); setRestKey(k => k + 1) }} />
                ))}
                {ex.painCheck && (
                  <div className="mt-2 flex items-center gap-2 text-sm"><span className="text-muted-foreground">{t.hoje.pain}</span>
                    <input type="range" min={0} max={10} value={se.painScore ?? 0} onChange={e => st.setPain(exIdx, Number(e.target.value))} className="flex-1" /><span className="w-5 text-right tabular-nums">{se.painScore ?? 0}</span></div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="mt-3"><CardHeader><CardTitle>{t.hoje.cooldown}</CardTitle>{!st.settings.stretchNoteSeen && <CardDescription>{t.hoje.stretchNote}</CardDescription>}</CardHeader>
        <CardContent><ul className="list-disc pl-5 text-sm text-muted-foreground">{stretches.map(s => <li key={s}>{s}</li>)}</ul></CardContent></Card>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <Button size="lg" onClick={() => { st.finishSession(); if (!st.settings.stretchNoteSeen) st.updateSettings({ stretchNoteSeen: true }) }}>{t.hoje.finish}</Button>
        <Button size="lg" variant="ghost" onClick={() => { if (confirm(t.hoje.discard + '?')) st.discardSession() }}>{t.hoje.discard}</Button>
      </div>
      <RestTimer seconds={restSec} startKey={restKey} />
    </div>
  )
}
