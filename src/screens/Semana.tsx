import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { TEMPLATE_BY_ID } from '@/domain/templates'
import { EXERCISE_BY_ID } from '@/domain/exercises'
import { MUSCLE_GROUPS } from '@/domain/types'
import { addDays, mondayOf, toISODate, WEEKDAYS_PT, weekIndexOf } from '@/domain/dates'
import { recovery } from '@/domain/recovery'
import { templateSets, weekTotalSets } from '@/domain/week'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { t } from '@/i18n/pt-BR'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusVariant = (s: string) => (s === 'done' ? 'success' : s === 'swapped' ? 'warning' : s === 'skipped' ? 'outline' : 'secondary')
const statusLabel: Record<string, string> = { done: t.semana.done, swapped: t.semana.swapped, skipped: t.semana.skipped, planned: t.semana.planned }

export function Semana() {
  const today = toISODate(new Date())
  const [ws, setWs] = useState(mondayOf(today))
  const st = useStore()
  const week = st.getWeek(ws)
  useEffect(() => { if (!week) st.ensureWeek(ws) }, [week, ws]) // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState<string | null>(null)
  const now = new Date()
  if (!week) return null
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="semana anterior" onClick={() => setWs(addDays(ws, -7))}><ChevronLeft /></Button>
        <div className="text-center"><h1 className="text-xl font-bold">{t.semana.title} {weekIndexOf(st.settings.startDate, ws)}</h1><p className="text-xs text-muted-foreground">{ws} · {t.semana.total}: {weekTotalSets(week)}</p></div>
        <Button variant="ghost" size="icon" aria-label="próxima semana" onClick={() => setWs(addDays(ws, 7))}><ChevronRight /></Button>
      </div>
      <Card className="mb-3"><CardHeader><CardTitle>{t.semana.recovery}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
          {MUSCLE_GROUPS.map(g => { const r = recovery(g, st.sessions, now); return (
            <div key={g}><div className="flex justify-between text-xs"><span>{t.groups[g]}</span><span className="tabular-nums text-muted-foreground">{r}%</span></div><Progress value={r} barClass={r >= 100 ? 'bg-success' : r >= 50 ? 'bg-warning' : 'bg-destructive'} /></div>
          ) })}
        </CardContent></Card>
      <div className="space-y-2">
        {week.days.map((d, i) => { const tp = TEMPLATE_BY_ID[d.templateId]; const isToday = d.date === today; return (
          <Card key={d.date} className={cn(isToday && 'border-primary')}>
            <button type="button" className="w-full text-left" onClick={() => setOpen(open === d.date ? null : d.date)}>
              <CardHeader className="flex-row items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{WEEKDAYS_PT[i]} · {d.date.slice(8)}/{d.date.slice(5, 7)}</p><CardTitle>{tp?.nome ?? d.templateId}</CardTitle>
                  {tp?.kind === 'lift' && <p className="text-xs text-muted-foreground">{templateSets(d.templateId)} {t.semana.sets} · {tp.groups.map(g => t.groups[g]).join(', ')}</p>}</div>
                <Badge variant={statusVariant(d.status)}>{statusLabel[d.status]}</Badge>
              </CardHeader>
            </button>
            {open === d.date && tp?.kind === 'lift' && (
              <CardContent><ul className="space-y-1 text-sm">{tp.blocks.map(b => <li key={b.exerciseId} className="flex justify-between"><span>{EXERCISE_BY_ID[b.exerciseId].nome}</span><span className="text-muted-foreground">{b.sets} × {EXERCISE_BY_ID[b.exerciseId].repRange.join('–')}</span></li>)}</ul></CardContent>
            )}
          </Card>
        ) })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t.semana.rule}</p>
    </div>
  )
}
