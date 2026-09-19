import type { MuscleGroup, Session } from './types'
import { EXERCISE_BY_ID } from './exercises'
import { hoursBetween } from './dates'

export function groupSetsInSession(s: Session, group: MuscleGroup): number {
  let n = 0
  for (const se of s.exercises) {
    const ex = EXERCISE_BY_ID[se.exerciseId]; if (!ex) continue
    const done = se.sets.filter(x => x.done).length
    if (ex.primary === group) n += done
    else if (ex.secondary.includes(group)) n += done * 0.5
  }
  return n
}

export function lastTrained(group: MuscleGroup, sessions: Session[]): { at: Date; sets: number } | null {
  const finished = sessions.filter(s => s.finishedAt).sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  for (let i = finished.length - 1; i >= 0; i--) {
    const sets = groupSetsInSession(finished[i], group)
    if (sets > 0) return { at: new Date(finished[i].finishedAt ?? finished[i].startedAt), sets }
  }
  return null
}

/** 0–100 %; full at 48 h (≤6 sets) or 72 h (>6 sets) */
export function recovery(group: MuscleGroup, sessions: Session[], now: Date): number {
  const last = lastTrained(group, sessions)
  if (!last) return 100
  const needed = last.sets > 6 ? 72 : 48
  return Math.max(0, Math.min(100, Math.round((hoursBetween(last.at, now) / needed) * 100)))
}
