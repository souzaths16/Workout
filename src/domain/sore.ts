import type { MuscleGroup, Session, WeekPlan } from './types'
import { TEMPLATE_BY_ID } from './templates'
import { lastTrained } from './recovery'
import { hoursBetween } from './dates'

export interface SoreResult { week: WeekPlan; outcome: 'swap' | 'row' | 'none'; swappedWith?: number }

function groupsRecovered(groups: MuscleGroup[], sessions: Session[], now: Date): boolean {
  return groups.every(g => { const l = lastTrained(g, sessions); return !l || hoursBetween(l.at, now) >= 48 })
}

/** Swap today's template with the nearest later day that avoids the sore groups and respects 48 h. */
export function soreSwap(week: WeekPlan, todayIdx: number, sore: MuscleGroup[], sessions: Session[], now: Date): SoreResult {
  const days = week.days.map(d => ({ ...d }))
  const today = days[todayIdx]
  const todayT = TEMPLATE_BY_ID[today.templateId]
  if (!todayT || todayT.kind !== 'lift') return { week, outcome: 'none' }
  if (!todayT.groups.some(g => sore.includes(g))) return { week, outcome: 'none' }

  for (let i = todayIdx + 1; i < days.length; i++) {
    const t = TEMPLATE_BY_ID[days[i].templateId]
    if (!t || t.kind !== 'lift' || days[i].status !== 'planned') continue
    if (t.groups.some(g => sore.includes(g))) continue
    if (!groupsRecovered(t.groups, sessions, now)) continue
    const a = today.templateId, b = days[i].templateId
    days[todayIdx] = { ...today, templateId: b, status: 'swapped', sourceTemplateId: a }
    days[i] = { ...days[i], templateId: a, status: 'swapped', sourceTemplateId: b }
    return { week: { ...week, days }, outcome: 'swap', swappedWith: i }
  }
  // no candidate: today becomes rowing, missed template goes to the first later rest day
  const restIdx = days.findIndex((d, i) => i > todayIdx && (d.templateId === 'descanso' || d.templateId === 'remo') && d.status === 'planned')
  const original = today.templateId
  days[todayIdx] = { ...today, templateId: 'remo', status: 'swapped', sourceTemplateId: original }
  if (restIdx >= 0) days[restIdx] = { ...days[restIdx], templateId: original, status: 'swapped', sourceTemplateId: days[restIdx].templateId }
  return { week: { ...week, days }, outcome: 'row', swappedWith: restIdx >= 0 ? restIdx : undefined }
}
