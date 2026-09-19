import { useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useStore } from '@/store/useStore'
import { MUSCLE_GROUPS } from '@/domain/types'
import { EXERCISES, EXERCISE_BY_ID } from '@/domain/exercises'
import { adherence, bestE1rm, e1rmSeries, weeklyVolume } from '@/domain/stats'
import { LADDER } from '@/domain/pullupLadder'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GROUP_COLOR, SERIES, INK, chartMargin, tooltipStyle, axisProps } from '@/components/charts/theme'
import { t } from '@/i18n/pt-BR'

const short = (d: string) => `${d.slice(8)}/${d.slice(5, 7)}`
const H = 220

export function Progresso() {
  const st = useStore()
  const liftEx = EXERCISES.filter(e => e.loadType === 'dumbbell_pair' || e.loadType === 'dumbbell_single')
  const [exId, setExId] = useState(liftEx[0].id)
  const volume = useMemo(() => weeklyVolume(st.sessions).map(v => ({ week: short(v.week), ...v.sets })), [st.sessions])
  const e1 = useMemo(() => e1rmSeries(st.sessions, exId).map(x => ({ ...x, d: short(x.date) })), [st.sessions, exId])
  const best = bestE1rm(st.sessions, exId)
  const adh = useMemo(() => adherence(st.weeks).map(a => ({ ...a, w: short(a.week) })), [st.weeks, st.sessions])
  const stageSeries = useMemo(() => st.sessions.filter(s => s.finishedAt).flatMap(s => s.exercises.filter(e => e.stage != null).map(e => ({ d: short(s.date), date: s.date, stage: e.stage as number }))).sort((a, b) => a.date.localeCompare(b.date)), [st.sessions])
  const tests = st.pullup.tests.map(x => ({ d: short(x.date), reps: x.strictReps }))
  const body = st.body.map(b => ({ d: short(b.date), peso: b.bodyweightKg, esq: b.armLeftCm, dir: b.armRightCm }))
  const empty = <p className="p-4 text-sm text-muted-foreground">{t.progresso.empty}</p>

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold">{t.progresso.title}</h1>

      <Card><CardHeader><CardTitle>{t.progresso.volume}</CardTitle></CardHeader>
        <CardContent className="px-1">{volume.length === 0 ? empty : (
          <ResponsiveContainer width="100%" height={H + 40}>
            <BarChart data={volume} margin={chartMargin} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis dataKey="week" {...axisProps} /><YAxis {...axisProps} allowDecimals={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: INK.secondary }} formatter={(v: string) => t.groups[v] ?? v} />
              {MUSCLE_GROUPS.map((g, i) => <Bar isAnimationActive={false} key={g} dataKey={g} stackId="a" fill={GROUP_COLOR[g]} stroke="#1b1b1e" strokeWidth={1} radius={i === MUSCLE_GROUPS.length - 1 ? [4, 4, 0, 0] : 0} name={g} />)}
            </BarChart>
          </ResponsiveContainer>)}
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.progresso.e1rm}</CardTitle>
          <select value={exId} onChange={e => setExId(e.target.value)} className="mt-1 h-10 rounded-md border border-input bg-background px-2 text-sm" aria-label="exercício">{liftEx.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select>
          {best && <CardDescription>Melhor: {best.e1rm} kg ({best.load} kg × {best.reps}) em {best.date}</CardDescription>}
        </CardHeader>
        <CardContent className="px-1">{e1.length === 0 ? empty : (
          <ResponsiveContainer width="100%" height={H}>
            <LineChart data={e1} margin={chartMargin}>
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis dataKey="d" {...axisProps} /><YAxis {...axisProps} domain={['auto', 'auto']} unit=" kg" />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kg`, EXERCISE_BY_ID[exId].nome]} />
              <Line isAnimationActive={false} type="monotone" dataKey="e1rm" stroke={SERIES[0]} strokeWidth={2} dot={{ r: 4, fill: SERIES[0], stroke: '#1b1b1e', strokeWidth: 2 }} activeDot={{ r: 6 }} name="1RM est." />
            </LineChart>
          </ResponsiveContainer>)}
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.progresso.pullup}</CardTitle><CardDescription>Estágio atual: {st.pullup.stage} · {LADDER[st.pullup.stage].nome}</CardDescription></CardHeader>
        <CardContent className="space-y-3 px-1">
          {stageSeries.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={H - 40}>
              <LineChart data={stageSeries} margin={chartMargin}>
                <CartesianGrid vertical={false} stroke={INK.grid} />
                <XAxis dataKey="d" {...axisProps} /><YAxis {...axisProps} domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5, 6]} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} · ${LADDER[v].nome}`, 'Estágio']} />
                <Line isAnimationActive={false} type="stepAfter" dataKey="stage" stroke={SERIES[2]} strokeWidth={2} dot={false} name="Estágio" />
              </LineChart>
            </ResponsiveContainer>)}
          {tests.length > 0 && (
            <ResponsiveContainer width="100%" height={H - 60}>
              <BarChart data={tests} margin={chartMargin} barCategoryGap="40%">
                <CartesianGrid vertical={false} stroke={INK.grid} />
                <XAxis dataKey="d" {...axisProps} /><YAxis {...axisProps} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v: number) => [v, 'Estritas']} />
                <ReferenceLine y={1} stroke={INK.axis} />
                <Bar isAnimationActive={false} dataKey="reps" fill={SERIES[2]} radius={[4, 4, 0, 0]} name="Estritas" />
              </BarChart>
            </ResponsiveContainer>)}
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.progresso.adherence}</CardTitle></CardHeader>
        <CardContent className="px-1">{adh.length === 0 ? empty : (
          <ResponsiveContainer width="100%" height={H - 20}>
            <BarChart data={adh} margin={chartMargin} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis dataKey="w" {...axisProps} /><YAxis {...axisProps} allowDecimals={false} domain={[0, 7]} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: INK.secondary }} />
              <Bar isAnimationActive={false} dataKey="planned" fill={INK.axis} radius={[4, 4, 0, 0]} name="Planejados" />
              <Bar isAnimationActive={false} dataKey="done" fill={SERIES[0]} radius={[4, 4, 0, 0]} name="Feitos" />
            </BarChart>
          </ResponsiveContainer>)}
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t.progresso.body}</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-1">{body.length === 0 ? empty : (<>
          <ResponsiveContainer width="100%" height={H - 60}>
            <LineChart data={body} margin={chartMargin}>
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis dataKey="d" {...axisProps} /><YAxis {...axisProps} domain={['auto', 'auto']} unit=" kg" />
              <Tooltip {...tooltipStyle} />
              <Line isAnimationActive={false} type="monotone" dataKey="peso" stroke={SERIES[0]} strokeWidth={2} dot={{ r: 4, fill: SERIES[0], stroke: '#1b1b1e', strokeWidth: 2 }} connectNulls name="Peso (kg)" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={H - 40}>
            <LineChart data={body} margin={chartMargin}>
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis dataKey="d" {...axisProps} /><YAxis {...axisProps} domain={['auto', 'auto']} unit=" cm" />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: INK.secondary }} />
              <Line isAnimationActive={false} type="monotone" dataKey="esq" stroke={SERIES[0]} strokeWidth={2} dot={{ r: 4, fill: SERIES[0], stroke: '#1b1b1e', strokeWidth: 2 }} connectNulls name="Braço E (cm)" />
              <Line isAnimationActive={false} type="monotone" dataKey="dir" stroke={SERIES[1]} strokeWidth={2} dot={{ r: 4, fill: SERIES[1], stroke: '#1b1b1e', strokeWidth: 2 }} connectNulls name="Braço D (cm)" />
            </LineChart>
          </ResponsiveContainer></>)}
        </CardContent></Card>
    </div>
  )
}
