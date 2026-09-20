import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { LADDER, ladderAssistKg } from '@/domain/pullupLadder'
import { nextTestDate } from '@/domain/pullup'
import { toISODate } from '@/domain/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { t } from '@/i18n/pt-BR'
import { cn } from '@/lib/utils'

export function BarraFixa() {
  const st = useStore()
  const today = toISODate(new Date())
  const [reps, setReps] = useState(0)
  const next = nextTestDate(st.pullup, st.settings.startDate, today)
  return (
    <div className="p-4">
      <h1 className="mb-1 text-2xl font-bold">{t.barra.title}</h1>
      <p className="mb-3 text-sm text-muted-foreground">{t.barra.criteria}</p>
      <div className="space-y-2">
        {LADDER.map(s => { const cur = s.stage === st.pullup.stage; const past = s.stage < st.pullup.stage; return (
          <Card key={s.stage} className={cn(cur && 'border-primary', past && 'opacity-60')}>
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle>{s.stage}. {s.nome}</CardTitle><CardDescription>{s.descricao} · {s.sets} × {s.target} {s.unit}</CardDescription></div>
              {cur && <Badge>{t.barra.stage} atual{s.assist === 'progress' ? ` · banda ${ladderAssistKg(st.pullup.stage, st.pullup, st.settings.inventory)} kg` : ''} · {st.pullup.consecutiveHits}/2</Badge>}
            </CardHeader>
          </Card>
        ) })}
      </div>
      <Card className="mt-3"><CardHeader><CardTitle>{t.barra.logTest}</CardTitle>{next && <CardDescription>{t.barra.nextTest}: {next}</CardDescription>}</CardHeader>
        <CardContent className="flex items-center gap-2"><Input type="number" inputMode="numeric" min={0} value={reps} onChange={e => setReps(Number(e.target.value))} className="w-24" aria-label="repetições estritas" /><Button onClick={() => st.logPullupTest(today, reps)}>{t.common.save}</Button></CardContent>
        {st.pullup.tests.length > 0 && <CardContent><p className="mb-1 text-sm font-medium">{t.barra.tests}</p><ul className="text-sm text-muted-foreground">{[...st.pullup.tests].reverse().map(x => <li key={x.date}>{x.date}: {x.strictReps}</li>)}</ul></CardContent>}
      </Card>
      <Card className="mt-3"><CardHeader><CardTitle>{t.barra.setStage}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">{LADDER.map(s => <Button key={s.stage} size="sm" variant={s.stage === st.pullup.stage ? 'default' : 'outline'} onClick={() => st.setPullupStage(s.stage)}>{s.stage}</Button>)}</CardContent></Card>
    </div>
  )
}
