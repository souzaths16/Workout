import type { MuscleGroup, Session, WeekPlan } from './types'
import { MUSCLE_GROUPS } from './types'
import { mondayOf } from './dates'
import { groupSetsInSession } from './recovery'
import { TEMPLATE_BY_ID } from './templates'

export const epley = (load: number, reps: number): number => Math.round(load * (1 + reps / 30) * 10) / 10

export function e1rmSeries(sessions: Session[], exerciseId: string): { date: string; e1rm: number; load: number; reps: number }[] {
  const out: { date: string; e1rm: number; load: number; reps: number }[] = []
  for (const s of sessions.filter(s => s.finishedAt).sort((a, b) => a.date.localeCompare(b.date))) {
    let best: { e1rm: number; load: number; reps: number } | null = null
    for (const se of s.exercises.filter(e => e.exerciseId === exerciseId)) {
      for (const set of se.sets) {
        if (!set.done || set.actualLoadKg == null || !set.actualReps) continue
        const e = epley(set.actualLoadKg, set.actualReps)
        if (!best || e > best.e1rm) best = { e1rm: e, load: set.actualLoadKg, reps: set.actualReps }
      }
    }
    if (best) out.push({ date: s.date, ...best })
  }
  return out
}

export function bestE1rm(sessions: Session[], exerciseId: string) { return e1rmSeries(sessions, exerciseId).reduce<{ date: string; e1rm: number; load: number; reps: number } | null>((b, x) => (!b || x.e1rm > b.e1rm ? x : b), null) }

export function weeklyVolume(sessions: Session[]): { week: string; sets: Record<MuscleGroup, number> }[] {
  const byWeek = new Map<string, Record<MuscleGroup, number>>()
  for (const s of sessions.filter(s => s.finishedAt)) {
    const wk = mondayOf(s.date)
    const rec = byWeek.get(wk) ?? (Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0])) as Record<MuscleGroup, number>)
    for (const g of MUSCLE_GROUPS) rec[g] += groupSetsInSession(s, g)
    byWeek.set(wk, rec)
  }
  return [...byWeek.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([week, sets]) => ({ week, sets }))
}

export function adherence(weeks: WeekPlan[]): { week: string; planned: number; done: number }[] {
  return weeks.map(w => {
    const planned = w.days.filter(d => TEMPLATE_BY_ID[d.templateId]?.kind === 'lift').length
    const done = w.days.filter(d => d.status === 'done').length
    return { week: w.weekStart, planned, done }
  }).sort((a, b) => a.week.localeCompare(b.week))
}
