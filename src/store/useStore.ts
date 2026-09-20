import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, BodyLog, MuscleGroup, Rir, Session, SessionExercise, SetLog, Settings, WeekPlan, Inventory } from '@/domain/types'
import { DEFAULT_INVENTORY } from '@/domain/inventory'
import { buildWeek, planBlocks, shouldTrim, swapDays } from '@/domain/week'
import { TEMPLATE_BY_ID } from '@/domain/templates'
import { EXERCISE_BY_ID } from '@/domain/exercises'
import { prescribe } from '@/domain/prescribe'
import { soreSwap } from '@/domain/sore'
import { pullupResult } from '@/domain/pullup'
import { LADDER_BY_STAGE, ladderAssistKg } from '@/domain/pullupLadder'
import { migrateState } from '@/domain/migrate'
import { mondayOf, toISODate, weekIndexOf } from '@/domain/dates'
import { pushBackup } from '@/lib/sync'

const SCHEMA_VERSION = 2

export const defaultSettings = (): Settings => ({
  startDate: toISODate(new Date()), inventory: DEFAULT_INVENTORY, rowingRestDay: true, sessionCapMin: 45, weekMode: '6x45', bodyweightKg: 61, stretchNoteSeen: false
})

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export interface Store extends AppState {
  ensureWeek: (date: string) => WeekPlan
  getWeek: (date: string) => WeekPlan | undefined
  startSession: (date: string, templateId: string) => Session
  updateSet: (exIdx: number, setIdx: number, patch: Partial<SetLog>) => void
  setPain: (exIdx: number, score: number) => void
  finishSession: (rowingMin?: number) => void
  discardSession: () => void
  logRowing: (date: string, minutes: number) => void
  markSore: (date: string, groups: MuscleGroup[]) => ReturnType<typeof soreSwap>['outcome']
  swapWithDay: (date: string, otherDate: string) => void
  toggleLightWeek: (date: string) => void
  logPullupTest: (date: string, strictReps: number) => void
  setPullupStage: (stage: number) => void
  addBody: (log: BodyLog) => void
  updateSettings: (patch: Partial<Settings>) => void
  updateInventory: (patch: Partial<Inventory>) => void
  importState: (s: AppState) => void
  resetAll: () => void
}

export const useStore = create<Store>()(persist((set, get) => ({
  schemaVersion: SCHEMA_VERSION,
  settings: defaultSettings(),
  weeks: [], sessions: [], pullup: { stage: 2, consecutiveHits: 0, tests: [], assistKg: null }, body: [], active: null,

  getWeek: (date) => get().weeks.find(w => w.weekStart === mondayOf(date)),
  ensureWeek: (date) => {
    const ws = mondayOf(date)
    const existing = get().weeks.find(w => w.weekStart === ws)
    if (existing) return existing
    const w = buildWeek(ws, get().settings)
    set(s => ({ weeks: [...s.weeks, w].sort((a, b) => a.weekStart.localeCompare(b.weekStart)) }))
    return w
  },

  startSession: (date, templateId) => {
    const st = get()
    const t = TEMPLATE_BY_ID[templateId]
    const week = st.ensureWeek(date)
    const wi = weekIndexOf(st.settings.startDate, date)
    const trim = shouldTrim(templateId, st.sessions, st.settings.sessionCapMin)
    const blocks = planBlocks(t, wi, !!week.light, trim)
    const exercises: SessionExercise[] = blocks.map(b => {
      const base = EXERCISE_BY_ID[b.exerciseId]
      const override = st.settings.startKgOverrides?.[base.id]
      const ex = override != null ? { ...base, startKg: override } : base
      const history = st.sessions.filter(s => s.finishedAt).flatMap(s => s.exercises.filter(e => e.exerciseId === ex.id))
      const p = prescribe(ex, history, st.settings.inventory, wi, b.sets)
      const stage = ex.loadType === 'pullup_ladder' ? st.pullup.stage : undefined
      const ladder = stage != null ? LADDER_BY_STAGE(stage) : null
      const sets: SetLog[] = Array.from({ length: b.sets }, (_, i) => ({
        n: i + 1,
        suggestedLoadKg: p.loadKg,
        suggestedReps: ladder ? ladder.target : p.reps[i],
        actualLoadKg: p.loadKg,
        actualReps: null,
        rir: null,
        done: false,
        amrap: p.amrapLast && i === b.sets - 1,
        assistKg: ladder ? ladderAssistKg(stage!, st.pullup, st.settings.inventory) : p.assistKg,
        bandKg: p.bandKg,
        holdSec: ladder && ladder.unit === 'seg' ? null : undefined
      }))
      return { exerciseId: ex.id, sets, stage }
    })
    const session: Session = { id: uid(), date, templateId, startedAt: new Date().toISOString(), exercises, light: !!week.light }
    set({ active: session })
    return session
  },

  updateSet: (exIdx, setIdx, patch) => set(s => {
    if (!s.active) return {}
    const exercises = s.active.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.map((x, j) => j !== setIdx ? x : { ...x, ...patch }) })
    return { active: { ...s.active, exercises } }
  }),
  setPain: (exIdx, score) => set(s => {
    if (!s.active) return {}
    return { active: { ...s.active, exercises: s.active.exercises.map((e, i) => i === exIdx ? { ...e, painScore: score } : e) } }
  }),

  finishSession: (rowingMin) => set(s => {
    if (!s.active) return {}
    const finishedAt = new Date().toISOString()
    const durationSec = Math.round((new Date(finishedAt).getTime() - new Date(s.active.startedAt).getTime()) / 1000)
    const session: Session = { ...s.active, finishedAt, durationSec, rowingMin }
    // pull-up ladder result
    let pullup = s.pullup
    const ladderEx = session.exercises.find(e => EXERCISE_BY_ID[e.exerciseId]?.loadType === 'pullup_ladder')
    if (ladderEx) {
      const stage = LADDER_BY_STAGE(pullup.stage)
      const done = ladderEx.sets.filter(x => x.done)
      const allHit = done.length === ladderEx.sets.length && done.every(x => (stage.unit === 'seg' ? (x.holdSec ?? 0) : (x.actualReps ?? 0)) >= stage.target && (x.rir ?? 0) <= 1)
      pullup = pullupResult(pullup, allHit, s.settings.inventory)
    }
    const weeks = s.weeks.map(w => w.weekStart !== mondayOf(session.date) ? w : { ...w, days: w.days.map(d => d.date === session.date ? { ...d, status: 'done' as const } : d) })
    return { active: null, sessions: [...s.sessions, session], weeks, pullup }
  }),
  discardSession: () => set({ active: null }),

  logRowing: (date, minutes) => set(s => {
    const session: Session = { id: uid(), date, templateId: 'remo', startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), durationSec: minutes * 60, exercises: [], rowingMin: minutes }
    const weeks = s.weeks.map(w => w.weekStart !== mondayOf(date) ? w : { ...w, days: w.days.map(d => d.date === date ? { ...d, status: 'done' as const } : d) })
    return { sessions: [...s.sessions, session], weeks }
  }),

  markSore: (date, groups) => {
    const st = get()
    const week = st.ensureWeek(date)
    const idx = week.days.findIndex(d => d.date === date)
    const r = soreSwap(week, idx, groups, st.sessions, new Date())
    if (r.outcome !== 'none') set(s => ({ weeks: s.weeks.map(w => w.weekStart === week.weekStart ? r.week : w), active: null }))
    return r.outcome
  },
  swapWithDay: (date, otherDate) => {
    const st = get()
    const week = st.ensureWeek(date)
    const i = week.days.findIndex(d => d.date === date)
    const j = week.days.findIndex(d => d.date === otherDate)
    if (i < 0 || j < 0 || week.days[i].status !== 'planned' || week.days[j].status !== 'planned') return
    const updated = swapDays(week, i, j)
    set(s => ({ weeks: s.weeks.map(w => w.weekStart === week.weekStart ? updated : w), active: null }))
  },
  toggleLightWeek: (date) => { get().ensureWeek(date); set(s => ({ weeks: s.weeks.map(w => w.weekStart === mondayOf(date) ? { ...w, light: !w.light } : w) })) },

  logPullupTest: (date, strictReps) => set(s => ({ pullup: { ...s.pullup, tests: [...s.pullup.tests, { date, strictReps }], stage: strictReps >= 3 ? 6 : strictReps >= 1 ? Math.max(s.pullup.stage, 5) : s.pullup.stage } })),
  setPullupStage: (stage) => set(s => ({ pullup: { ...s.pullup, stage, consecutiveHits: 0, assistKg: null } })),
  addBody: (log) => set(s => ({ body: [...s.body.filter(b => b.date !== log.date), log].sort((a, b) => a.date.localeCompare(b.date)) })),
  updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
  updateInventory: (patch) => set(s => ({ settings: { ...s.settings, inventory: { ...s.settings.inventory, ...patch } } })),
  importState: (st) => set({ schemaVersion: st.schemaVersion, settings: st.settings, weeks: st.weeks, sessions: st.sessions, pullup: st.pullup, body: st.body, active: st.active }),
  resetAll: () => set({ settings: defaultSettings(), weeks: [], sessions: [], pullup: { stage: 2, consecutiveHits: 0, tests: [], assistKg: null }, body: [], active: null })
}), {
  name: 'treino-v1',
  storage: createJSONStorage(() => localStorage),
  version: SCHEMA_VERSION,
  partialize: (s) => ({ schemaVersion: s.schemaVersion, settings: s.settings, weeks: s.weeks, sessions: s.sessions, pullup: s.pullup, body: s.body, active: s.active }),
  migrate: (persisted) => migrateState(persisted) as Store
}))

let syncTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe((s) => {
  if (!s.settings.syncUrl || !s.settings.syncToken) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const state: AppState = { schemaVersion: s.schemaVersion, settings: s.settings, weeks: s.weeks, sessions: s.sessions, pullup: s.pullup, body: s.body, active: s.active }
    pushBackup(s.settings.syncUrl!, s.settings.syncToken!, state).catch(() => {})
  }, 2000)
})

export type { Rir }
