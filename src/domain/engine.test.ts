import { describe, it, expect } from 'vitest'
import { bandLoads, buildableLoads, nextLoad, prevLoad, snapLoad, DEFAULT_INVENTORY } from './inventory'
import { prescribe } from './prescribe'
import { EXERCISE_BY_ID } from './exercises'
import { soreSwap } from './sore'
import { buildWeek, planBlocks, shouldTrim, swapDays, weekTotalSets } from './week'
import { recovery } from './recovery'
import { pullupResult } from './pullup'
import { ladderAssistKg } from './pullupLadder'
import { epley, weeklyVolume } from './stats'
import { exportJson, importJson, exportCsv } from './exportImport'
import { migrateState } from './migrate'
import type { AppState, PullupState, Session, SessionExercise, Settings } from './types'
import { TEMPLATE_BY_ID } from './templates'

const settings: Settings = { startDate: '2026-09-21', inventory: DEFAULT_INVENTORY, rowingRestDay: true, sessionCapMin: 45, weekMode: '6x45', bodyweightKg: 61, stretchNoteSeen: false }

const hist = (load: number, reps: number[], rir: number, bandKg?: number | null): SessionExercise => ({
  exerciseId: 'rosca_inclinada',
  sets: reps.map((r, i) => ({ n: i + 1, suggestedLoadKg: load, suggestedReps: 8, actualLoadKg: load, actualReps: r, rir: rir as 0 | 1 | 2 | 3 | 4, done: true, bandKg }))
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
  it('band loads include 0 (no band), every single band and every distinct pair stacked', () => {
    const loads = buildableLoads(DEFAULT_INVENTORY, 'band')
    // 0 + 5 singles (10,15,20,30,40) + 10 distinct pairs, minus duplicate sums (10+30=40=15+... none collide here except pair sums equal to a single: 10+30=40 and 20+20 is not formed since bands are distinct)
    expect(loads).toEqual([0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70])
  })
  it('bandLoads excludes the zero (no-band) option, for use as a top-up', () => {
    const loads = bandLoads(DEFAULT_INVENTORY)
    expect(loads).not.toContain(0)
    expect(loads[0]).toBe(10)
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
  it('marks the AMRAP set every 4th week', () => {
    expect(prescribe(ex, [hist(5.5, [10, 9, 8], 1)], DEFAULT_INVENTORY, 4, 3).amrapLast).toBe(true)
    expect(prescribe(ex, [hist(5.5, [10, 9, 8], 1)], DEFAULT_INVENTORY, 5, 3).amrapLast).toBe(false)
  })
  it('dips progress through the owned bands (heaviest first) then flag the belt', () => {
    const dips = EXERCISE_BY_ID['paralelas']
    const first = prescribe(dips, [], DEFAULT_INVENTORY, 1, 3)
    expect(first.assistKg).toBe(40)
    const h: SessionExercise = { exerciseId: 'paralelas', sets: [1, 2, 3].map(n => ({ n, suggestedLoadKg: null, suggestedReps: 6, actualLoadKg: 0, actualReps: 12, rir: 1, done: true, assistKg: 40 })) }
    const lighter = prescribe(dips, [h], DEFAULT_INVENTORY, 3, 3)
    expect(lighter.assistKg).toBe(30)
    const hNoBand: SessionExercise = { exerciseId: 'paralelas', sets: [1, 2, 3].map(n => ({ n, suggestedLoadKg: null, suggestedReps: 6, actualLoadKg: 0, actualReps: 12, rir: 1, done: true, assistKg: null })) }
    const p = prescribe(dips, [hNoBand], DEFAULT_INVENTORY, 3, 3)
    expect(p.buy).toBe(true)
  })
  it('terra romeno tops up with a band once the dumbbell inventory maxes out, and backs off the band on a miss', () => {
    const terra = EXERCISE_BY_ID['terra_romeno']
    expect(terra.bandTopUp).toBe(true)
    const atTop = hist(10.5, [12, 12, 12], 2) // 10.5 kg/hand is the pair max in DEFAULT_INVENTORY
    const p1 = prescribe(terra, [{ ...atTop, exerciseId: 'terra_romeno' }], DEFAULT_INVENTORY, 3, 3)
    expect(p1.loadKg).toBe(10.5)
    expect(p1.bandKg).toBe(10)
    const withBand10 = hist(10.5, [12, 12, 12], 2, 10)
    const p2 = prescribe(terra, [{ ...withBand10, exerciseId: 'terra_romeno' }], DEFAULT_INVENTORY, 3, 3)
    expect(p2.bandKg).toBe(15)
    const missedWithBand15 = hist(10.5, [12, 12, 5], 0, 15)
    const p3 = prescribe(terra, [{ ...missedWithBand15, exerciseId: 'terra_romeno' }], DEFAULT_INVENTORY, 3, 3)
    expect(p3.bandKg).toBe(10)
  })
  it('band-only exercises calibrate then progress through the buildable band loads', () => {
    const sq = EXERCISE_BY_ID['agachamento_banda']
    const first = prescribe(sq, [], DEFAULT_INVENTORY, 1, 3)
    expect(first.calibration).toBe(true)
    expect(first.loadKg).toBe(20)
    const atTop = hist(20, [20, 20, 20], 2)
    const p = prescribe(sq, [{ ...atTop, exerciseId: 'agachamento_banda' }], DEFAULT_INVENTORY, 3, 3)
    expect(p.loadKg).toBe(25)
  })
})

describe('pull-up ladder: banded stage', () => {
  it('steps down through the owned bands on two hits, heaviest to lightest', () => {
    const st: PullupState = { stage: 4, consecutiveHits: 1, tests: [], assistKg: 30 }
    const r = pullupResult(st, true, DEFAULT_INVENTORY)
    expect(r.stage).toBe(4)
    expect(r.assistKg).toBe(20)
    expect(r.consecutiveHits).toBe(0)
  })
  it('advances to the next stage once already on the lightest band', () => {
    const st: PullupState = { stage: 4, consecutiveHits: 1, tests: [], assistKg: 10 }
    const r = pullupResult(st, true, DEFAULT_INVENTORY)
    expect(r.stage).toBe(5)
    expect(r.assistKg).toBeNull()
  })
  it('ladderAssistKg starts one band lighter than the heaviest when entering stage 4', () => {
    const st: PullupState = { stage: 4, consecutiveHits: 0, tests: [], assistKg: null }
    expect(ladderAssistKg(4, st, DEFAULT_INVENTORY)).toBe(30)
    expect(ladderAssistKg(3, st, DEFAULT_INVENTORY)).toBe(40)
    expect(ladderAssistKg(6, st, DEFAULT_INVENTORY)).toBeNull()
  })
})

describe('week and session plan', () => {
  it('lays out 6 lifting days, Sunday rowing when enabled', () => {
    const w = buildWeek('2026-09-21', settings)
    expect(w.days.map(d => d.templateId)).toEqual(['bracos_a', 'pernas_a', 'puxar_a', 'empurrar', 'pernas_b', 'bracos_b', 'remo'])
  })
  it('caps sets at 3 in weeks 1–2 and halves on a light week', () => {
    const t = TEMPLATE_BY_ID['bracos_a'] // 4 blocks: 4,4,3,3 sets in weeks ≥ 4
    expect(planBlocks(t, 1, false, false).map(b => b.sets)).toEqual([3, 3, 3, 3])
    expect(planBlocks(t, 3, false, false).map(b => b.sets)).toEqual([4, 4, 3, 3])
    expect(planBlocks(t, 3, true, false).map(b => b.sets)).toEqual([2, 2, 2, 2])
    expect(planBlocks(t, 3, false, true).map(b => b.sets)).toEqual([4, 4, 3, 2])
  })
  it('trims only after two consecutive over-cap sessions', () => {
    const mk = (d: number): Session => ({ id: String(d), date: '2026-09-21', templateId: 'bracos_a', startedAt: 'x', finishedAt: 'y', durationSec: d, exercises: [] })
    expect(shouldTrim('bracos_a', [mk(3000), mk(2900)], 45)).toBe(true)
    expect(shouldTrim('bracos_a', [mk(3000), mk(2500)], 45)).toBe(false)
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
  it('ladder advances after two consecutive hits (non-banded stage)', () => {
    let st: PullupState = { stage: 1, consecutiveHits: 0, tests: [] }
    st = pullupResult(st, true, DEFAULT_INVENTORY); expect(st.stage).toBe(1)
    st = pullupResult(st, false, DEFAULT_INVENTORY); expect(st.consecutiveHits).toBe(0)
    st = pullupResult(pullupResult(st, true, DEFAULT_INVENTORY), true, DEFAULT_INVENTORY); expect(st.stage).toBe(2)
  })
  it('epley and weekly volume', () => {
    expect(epley(10, 10)).toBe(13.3)
    const v = weeklyVolume([s])
    expect(v[0].sets.biceps).toBe(4)
  })
  it('export/import round trip', () => {
    const state: AppState = { schemaVersion: 2, settings, weeks: [buildWeek('2026-09-21', settings)], sessions: [s], pullup: { stage: 2, consecutiveHits: 0, tests: [], assistKg: null }, body: [], active: null }
    expect(importJson(exportJson(state))).toEqual(state)
    expect(exportCsv([s]).split('\n').length).toBe(5)
    expect(() => importJson('{"nope":1}')).toThrow()
  })
})

describe('migration from schema v1 (string band levels) to v2 (band kg)', () => {
  const v1 = {
    schemaVersion: 1,
    settings: {
      startDate: '2026-01-01',
      inventory: { plates: DEFAULT_INVENTORY.plates, handleKg: 1, handles: 2, adjustable: [], kettlebells: [8], bands: ['leve', 'media', 'pesada'], dipBelt: false },
      rowingRestDay: true, sessionCapMin: 30, weekMode: '6x30', bodyweightKg: 61, stretchNoteSeen: false
    },
    weeks: [],
    sessions: [{
      id: 'a', date: '2026-01-01', templateId: 'empurrar', startedAt: '2026-01-01T08:00:00',
      exercises: [{ exerciseId: 'paralelas', sets: [{ n: 1, suggestedLoadKg: null, suggestedReps: 6, actualLoadKg: 0, actualReps: 12, rir: 1, done: true, assist: 'pesada' }] }]
    }],
    pullup: { stage: 2, consecutiveHits: 0, tests: [] },
    body: [],
    active: null
  }
  it('rewrites bands, week mode, session cap and per-set assist into the v2 shape', () => {
    const migrated = migrateState(v1) as any
    expect(migrated.schemaVersion).toBe(2)
    expect(migrated.settings.weekMode).toBe('6x45')
    expect(migrated.settings.sessionCapMin).toBe(45)
    expect(migrated.settings.inventory.bands).toEqual([10, 15, 20, 30, 40])
    expect(migrated.sessions[0].exercises[0].sets[0].assistKg).toBe(40)
    expect(migrated.sessions[0].exercises[0].sets[0].assist).toBeUndefined()
    expect(migrated.pullup.assistKg).toBeNull()
  })
  it('importJson accepts a v1 export and migrates it on the way in', () => {
    const state = importJson(JSON.stringify(v1))
    expect(state.settings.weekMode).toBe('6x45')
    expect(state.sessions[0].exercises[0].sets[0].assistKg).toBe(40)
  })
})
