import { describe, it, expect } from 'vitest'
import { buildableLoads, nextLoad, prevLoad, snapLoad, DEFAULT_INVENTORY } from './inventory'
import { prescribe } from './prescribe'
import { EXERCISE_BY_ID } from './exercises'
import { soreSwap } from './sore'
import { buildWeek, planBlocks, shouldTrim, swapDays, weekTotalSets } from './week'
import { recovery } from './recovery'
import { pullupResult } from './pullup'
import { epley, weeklyVolume } from './stats'
import { exportJson, importJson, exportCsv } from './exportImport'
import type { AppState, PullupState, Session, SessionExercise, Settings } from './types'
import { TEMPLATE_BY_ID } from './templates'

const settings: Settings = { startDate: '2026-09-21', inventory: DEFAULT_INVENTORY, rowingRestDay: true, sessionCapMin: 30, weekMode: '6x30', bodyweightKg: 61, stretchNoteSeen: false }

const hist = (load: number, reps: number[], rir: number): SessionExercise => ({
  exerciseId: 'rosca_inclinada',
  sets: reps.map((r, i) => ({ n: i + 1, suggestedLoadKg: load, suggestedReps: 8, actualLoadKg: load, actualReps: r, rir: rir as 0 | 1 | 2 | 3 | 4, done: true }))
})

describe('inventory', () => {
  it('builds the SPORTNOW pair loads (1 kg handle + symmetric plates, max one of each type per side for a pair)', () => {
    const loads = buildableLoads(DEFAULT_INVENTORY, 'dumbbell_pair')
    expect(loads[0]).toBe(1)
    expect(loads).toContain(3.5)   // 1 + 2×1.25
    expect(loads).toContain(10.5)  // 1 + 2×(2+1.5+1.25)
    expect(loads[loads.length - 1]).toBe(10.5)
  })
  it('single dumbbell can use two of each plate per side and kettlebells', () => {
    const loads = buildableLoads(DEFAULT_INVENTORY, 'dumbbell_single')
    expect(loads).toContain(8)     // kettlebell
    expect(loads[loads.length - 1]).toBe(20) // 1 + 2×(4+3+2.5)
  })
  it('snaps and steps', () => {
    const loads = [3, 4, 5.5]
    expect(snapLoad(loads, 4.2)).toBe(4)
    expect(nextLoad(loads, 4)).toBe(5.5)
    expect(prevLoad(loads, 4)).toBe(3)
    expect(nextLoad(loads, 5.5)).toBeNull()
  })
})

describe('prescribe (double progression)', () => {
  const ex = EXERCISE_BY_ID['rosca_inclinada']
  it('first session is a calibration at the snapped start load', () => {
    const p = prescribe(ex, [], DEFAULT_INVENTORY, 1, 3)
    expect(p.calibration).toBe(true)
    expect(p.loadKg).toBe(4)
    expect(p.reps).toEqual([12, 12, 12])
  })
  it('goes up when every set hits the top with RIR ≥ 1', () => {
    const p = prescribe(ex, [hist(5.5, [12, 12, 12], 2)], DEFAULT_INVENTORY, 3, 4)
    expect(p.loadKg).toBeGreaterThan(5.5)
    expect(p.reps).toEqual([8, 8, 8, 8])
  })
  it('holds and asks +1 rep when in range', () => {
    const p = prescribe(ex, [hist(5.5, [10, 9, 8], 1)], DEFAULT_INVENTORY, 3, 3)
    expect(p.loadKg).toBe(5.5)
    expect(p.reps).toEqual([11, 10, 9])
  })
  it('goes down when a set falls below the range', () => {
    const p = prescribe(ex, [hist(5.5, [8, 7, 6], 0)], DEFAULT_INVENTORY, 3, 3)
    expect(p.loadKg).toBeLessThan(5.5)
  })
  it('flags a purchase at the top of the inventory', () => {
    const p = prescribe(ex, [hist(10.5, [12, 12, 12], 2)], DEFAULT_INVENTORY, 3, 3)
    expect(p.buy).toBe(true)
    expect(p.loadKg).toBe(10.5)
  })
  it('marks the AMRAP set every 4th week', () => {
    expect(prescribe(ex, [hist(5.5, [10, 9, 8], 1)], DEFAULT_INVENTORY, 4, 3).amrapLast).toBe(true)
    expect(prescribe(ex, [hist(5.5, [10, 9, 8], 1)], DEFAULT_INVENTORY, 5, 3).amrapLast).toBe(false)
  })
  it('dips progress through bands then flag the belt', () => {
    const dips = EXERCISE_BY_ID['paralelas']
    const first = prescribe(dips, [], DEFAULT_INVENTORY, 1, 3)
    expect(first.assist).toBe('pesada')
    const h: SessionExercise = { exerciseId: 'paralelas', sets: [1, 2, 3].map(n => ({ n, suggestedLoadKg: null, suggestedReps: 6, actualLoadKg: 0, actualReps: 12, rir: 1, done: true, assist: null })) }
    const p = prescribe(dips, [h], DEFAULT_INVENTORY, 3, 3)
    expect(p.buy).toBe(true)
  })
})

describe('week and session plan', () => {
  it('lays out 6 lifting days, Sunday rowing when enabled', () => {
    const w = buildWeek('2026-09-21', settings)
    expect(w.days.map(d => d.templateId)).toEqual(['bracos_a', 'pernas_a', 'puxar_a', 'empurrar', 'pernas_b', 'bracos_b', 'remo'])
  })
  it('caps sets at 3 in weeks 1–2 and halves on a light week', () => {
    const t = TEMPLATE_BY_ID['bracos_a']
    expect(planBlocks(t, 1, false, false).map(b => b.sets)).toEqual([3, 3, 3])
    expect(planBlocks(t, 3, false, false).map(b => b.sets)).toEqual([4, 4, 3])
    expect(planBlocks(t, 3, true, false).map(b => b.sets)).toEqual([2, 2, 2])
    expect(planBlocks(t, 3, false, true).map(b => b.sets)).toEqual([4, 4, 2])
  })
  it('trims only after two consecutive over-cap sessions', () => {
    const mk = (d: number): Session => ({ id: String(d), date: '2026-09-21', templateId: 'bracos_a', startedAt: 'x', finishedAt: 'y', durationSec: d, exercises: [] })
    expect(shouldTrim('bracos_a', [mk(2000), mk(1900)], 30)).toBe(true)
    expect(shouldTrim('bracos_a', [mk(2000), mk(1700)], 30)).toBe(false)
  })
  it('swapDays pulls a lift day onto a rest/row day, keeping total sets and every other day untouched', () => {
    const w = buildWeek('2026-09-21', settings) // Sunday (idx 6) is 'remo'
    const before = weekTotalSets(w)
    const r = swapDays(w, 6, 0) // bring Monday's Braços A onto Sunday
    expect(r.days[6].templateId).toBe('bracos_a')
    expect(r.days[6].status).toBe('swapped')
    expect(r.days[6].sourceTemplateId).toBe('remo')
    expect(r.days[0].templateId).toBe('remo')
    expect(r.days[0].sourceTemplateId).toBe('bracos_a')
    expect(r.days.slice(1, 6)).toEqual(w.days.slice(1, 6))
    expect(weekTotalSets(r)).toBe(before)
  })
})

describe('sore swap', () => {
  const w = buildWeek('2026-09-21', settings)
  it('swaps today with the nearest recovered day and keeps total sets', () => {
    const before = weekTotalSets(w)
    const r = soreSwap(w, 0, ['biceps'], [], new Date('2026-09-21T08:00:00'))
    expect(r.outcome).toBe('swap')
    expect(r.week.days[0].templateId).toBe('pernas_a')
    expect(r.week.days[1].templateId).toBe('bracos_a')
    expect(weekTotalSets(r.week)).toBe(before)
  })
  it('respects the 48 h rule for the incoming day', () => {
    const legs: Session = { id: 'l', date: '2026-09-20', templateId: 'pernas_b', startedAt: '2026-09-20T18:00:00', finishedAt: '2026-09-20T18:30:00',
      exercises: [{ exerciseId: 'agachamento_bulgaro', sets: [{ n: 1, suggestedLoadKg: 6, suggestedReps: 8, actualLoadKg: 6, actualReps: 8, rir: 2, done: true }] }] }
    const r = soreSwap(w, 0, ['biceps'], [legs], new Date('2026-09-21T08:00:00'))
    expect(r.week.days[0].templateId).not.toBe('pernas_a')
    expect(r.week.days[0].templateId).toBe('empurrar')
    expect(weekTotalSets(r.week)).toBe(weekTotalSets(w))
  })
  it('falls back to rowing and moves the missed day to the rest slot', () => {
    const r = soreSwap(w, 5, ['biceps', 'triceps', 'costas'], [], new Date('2026-09-26T08:00:00'))
    expect(r.outcome).toBe('row')
    expect(r.week.days[5].templateId).toBe('remo')
    expect(r.week.days[6].templateId).toBe('bracos_b')
  })
})

describe('recovery, pull-up, stats, export', () => {
  const s: Session = { id: 'a', date: '2026-09-21', templateId: 'bracos_a', startedAt: '2026-09-21T08:00:00', finishedAt: '2026-09-21T08:30:00', durationSec: 1800,
    exercises: [{ exerciseId: 'rosca_inclinada', sets: [1, 2, 3, 4].map(n => ({ n, suggestedLoadKg: 5.5, suggestedReps: 8, actualLoadKg: 5.5, actualReps: 10, rir: 1, done: true })) }] }
  it('recovery decays to 100 % at 48 h', () => {
    expect(recovery('biceps', [s], new Date('2026-09-22T08:30:00'))).toBe(50)
    expect(recovery('biceps', [s], new Date('2026-09-23T09:00:00'))).toBe(100)
    expect(recovery('quadriceps', [s], new Date('2026-09-22T08:30:00'))).toBe(100)
  })
  it('ladder advances after two consecutive hits', () => {
    let st: PullupState = { stage: 2, consecutiveHits: 0, tests: [] }
    st = pullupResult(st, true); expect(st.stage).toBe(2)
    st = pullupResult(st, false); expect(st.consecutiveHits).toBe(0)
    st = pullupResult(pullupResult(st, true), true); expect(st.stage).toBe(3)
  })
  it('epley and weekly volume', () => {
    expect(epley(10, 10)).toBe(13.3)
    const v = weeklyVolume([s])
    expect(v[0].sets.biceps).toBe(4)
  })
  it('export/import round trip', () => {
    const state: AppState = { schemaVersion: 1, settings, weeks: [buildWeek('2026-09-21', settings)], sessions: [s], pullup: { stage: 2, consecutiveHits: 0, tests: [] }, body: [], active: null }
    expect(importJson(exportJson(state))).toEqual(state)
    expect(exportCsv([s]).split('\n').length).toBe(5)
    expect(() => importJson('{"nope":1}')).toThrow()
  })
})
