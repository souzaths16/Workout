import type { BandLevel, Exercise, Inventory, SessionExercise } from './types'
import { buildableLoads, nextLoad, prevLoad, snapLoad } from './inventory'
import { LADDER_BY_STAGE } from './pullupLadder'

export interface Prescription {
  loadKg: number | null
  /** target reps per set (seconds for hang stages) */
  reps: number[]
  assist: BandLevel | null
  amrapLast: boolean
  calibration: boolean
  /** prescription exceeds what the inventory can build */
  buy: boolean
  note?: string
}

const ASSIST_ORDER: BandLevel[] = ['pesada', 'media', 'leve']
const fill = (n: number, v: number) => Array.from({ length: n }, () => v)
const doneSets = (h: SessionExercise) => h.sets.filter(s => s.done && s.actualReps != null)
const meanRir = (sets: { rir: number | null }[]) => { const r = sets.map(s => s.rir).filter((x): x is number => x != null); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0 }

export function prescribe(ex: Exercise, history: SessionExercise[], inv: Inventory, weekIndex: number, sets: number): Prescription {
  const amrapLast = weekIndex > 0 && weekIndex % 4 === 0 && ex.loadType !== 'pullup_ladder'
  const [min, max] = ex.repRange

  if (ex.loadType === 'pullup_ladder') {
    const stage = LADDER_BY_STAGE(history.length ? (history[history.length - 1].stage ?? 0) : 0)
    return { loadKg: null, reps: fill(sets, stage.target), assist: stage.assist, amrapLast: false, calibration: false, buy: false }
  }

  const last = [...history].reverse().find(h => doneSets(h).length > 0)

  if (ex.loadType === 'bodyweight') {
    const owned = ASSIST_ORDER.filter(b => inv.bands.includes(b))
    if (!last) {
      const assist = owned[0] ?? null
      return { loadKg: assist ? null : 0, reps: fill(sets, min), assist, amrapLast, calibration: true, buy: false, note: 'Calibração: escolha a banda que permite ~8 repetições com 2–3 de reserva.' }
    }
    const ds = doneSets(last)
    const assist = ds[ds.length - 1].assist ?? null
    const extra = ds[ds.length - 1].actualLoadKg ?? 0
    const allTop = ds.every(s => (s.actualReps ?? 0) >= max) && meanRir(ds) >= 1
    const anyBelow = ds.some(s => (s.actualReps ?? 0) < min)
    if (allTop) {
      if (assist) {
        const i = owned.indexOf(assist)
        const lighter = owned[i + 1] ?? null
        return { loadKg: lighter ? null : 0, reps: fill(sets, min), assist: lighter, amrapLast, calibration: false, buy: false }
      }
      if (inv.dipBelt) return { loadKg: extra + 2.5, reps: fill(sets, min), assist: null, amrapLast, calibration: false, buy: false }
      return { loadKg: extra, reps: fill(sets, max), assist: null, amrapLast, calibration: false, buy: true, note: 'Comprar: cinto de mergulho + anilhas para seguir progredindo.' }
    }
    if (anyBelow) {
      if (extra > 0) return { loadKg: Math.max(0, extra - 2.5), reps: fill(sets, min), assist: null, amrapLast, calibration: false, buy: false }
      const i = assist ? owned.indexOf(assist) : owned.length
      const heavier = owned[Math.max(0, i - 1)] ?? null
      return { loadKg: heavier ? null : 0, reps: fill(sets, min), assist: heavier, amrapLast, calibration: false, buy: false }
    }
    const reps = fill(sets, min).map((_, i) => Math.min(max, (ds[Math.min(i, ds.length - 1)].actualReps ?? min) + 1))
    return { loadKg: assist ? null : extra, reps, assist, amrapLast, calibration: false, buy: false }
  }

  const loads = buildableLoads(inv, ex.loadType)
  if (!last) {
    const load = snapLoad(loads, ex.startKg ?? 4, 'nearest')
    return { loadKg: load, reps: fill(sets, max), assist: null, amrapLast, calibration: true, buy: load == null, note: 'Calibração: ajuste o peso até fechar ~12 repetições com 2–3 de reserva e registre o que usou.' }
  }
  const ds = doneSets(last)
  const load = ds[ds.length - 1].actualLoadKg ?? (snapLoad(loads, ex.startKg ?? 4) ?? 0)
  const allTop = ds.every(s => (s.actualReps ?? 0) >= max) && meanRir(ds) >= 1
  const anyBelow = ds.some(s => (s.actualReps ?? 0) < min)
  if (allTop) {
    const up = nextLoad(loads, load)
    if (up == null) return { loadKg: load, reps: fill(sets, max), assist: null, amrapLast, calibration: false, buy: true, note: 'Comprar: você chegou ao máximo que consegue montar com seus pesos.' }
    return { loadKg: up, reps: fill(sets, min), assist: null, amrapLast, calibration: false, buy: false }
  }
  if (anyBelow) {
    const down = prevLoad(loads, load) ?? load
    return { loadKg: down, reps: fill(sets, min), assist: null, amrapLast, calibration: false, buy: false }
  }
  const reps = fill(sets, min).map((_, i) => Math.min(max, (ds[Math.min(i, ds.length - 1)].actualReps ?? min) + 1))
  return { loadKg: load, reps, assist: null, amrapLast, calibration: false, buy: false }
}
