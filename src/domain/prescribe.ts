import type { Exercise, Inventory, SessionExercise } from './types'
import { assistBands, bandLoads, buildableLoads, nextLoad, prevLoad, snapLoad } from './inventory'
import { LADDER_BY_STAGE } from './pullupLadder'

export interface Prescription {
  loadKg: number | null
  /** target reps per set (seconds for hang stages) */
  reps: number[]
  /** bodyweight/pull-up exercises: assistance band, in kg */
  assistKg: number | null
  /** dumbbell exercise at the inventory's top load: band added on top, in kg */
  bandKg: number | null
  amrapLast: boolean
  calibration: boolean
  /** prescription exceeds what the inventory can build */
  buy: boolean
  note?: string
}

const fill = (n: number, v: number) => Array.from({ length: n }, () => v)
const doneSets = (h: SessionExercise) => h.sets.filter(s => s.done && s.actualReps != null)
const meanRir = (sets: { rir: number | null }[]) => { const r = sets.map(s => s.rir).filter((x): x is number => x != null); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0 }

export function prescribe(ex: Exercise, history: SessionExercise[], inv: Inventory, weekIndex: number, sets: number): Prescription {
  const amrapLast = weekIndex > 0 && weekIndex % 4 === 0 && ex.loadType !== 'pullup_ladder'
  const [min, max] = ex.repRange

  if (ex.loadType === 'pullup_ladder') {
    const stage = LADDER_BY_STAGE(history.length ? (history[history.length - 1].stage ?? 0) : 0)
    return { loadKg: null, reps: fill(sets, stage.target), assistKg: null, bandKg: null, amrapLast: false, calibration: false, buy: false }
  }

  const last = [...history].reverse().find(h => doneSets(h).length > 0)

  if (ex.loadType === 'bodyweight') {
    const owned = assistBands(inv) // heaviest first
    if (!last) {
      const assistKg = owned[0] ?? null
      return { loadKg: assistKg ? null : 0, reps: fill(sets, min), assistKg, bandKg: null, amrapLast, calibration: true, buy: false, note: `Calibração: comece pela banda ${assistKg ?? ''} kg e ajuste até fechar ~8 repetições com 2–3 de reserva.` }
    }
    const ds = doneSets(last)
    const assistKg = ds[ds.length - 1].assistKg ?? null
    const extra = ds[ds.length - 1].actualLoadKg ?? 0
    const allTop = ds.every(s => (s.actualReps ?? 0) >= max) && meanRir(ds) >= 1
    const anyBelow = ds.some(s => (s.actualReps ?? 0) < min)
    if (allTop) {
      if (assistKg != null) {
        const i = owned.indexOf(assistKg)
        const lighter = i >= 0 ? owned[i + 1] : undefined
        return { loadKg: lighter != null ? null : 0, reps: fill(sets, min), assistKg: lighter ?? null, bandKg: null, amrapLast, calibration: false, buy: false }
      }
      if (inv.dipBelt) return { loadKg: extra + 2.5, reps: fill(sets, min), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: false }
      return { loadKg: extra, reps: fill(sets, max), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: true, note: 'Comprar: cinto de mergulho + anilhas para seguir progredindo.' }
    }
    if (anyBelow) {
      if (extra > 0) return { loadKg: Math.max(0, extra - 2.5), reps: fill(sets, min), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: false }
      const i = assistKg != null ? owned.indexOf(assistKg) : owned.length
      const heavier = owned[Math.max(0, i - 1)] ?? null
      return { loadKg: heavier != null ? null : 0, reps: fill(sets, min), assistKg: heavier, bandKg: null, amrapLast, calibration: false, buy: false }
    }
    const reps = fill(sets, min).map((_, i) => Math.min(max, (ds[Math.min(i, ds.length - 1)].actualReps ?? min) + 1))
    return { loadKg: assistKg != null ? null : extra, reps, assistKg, bandKg: null, amrapLast, calibration: false, buy: false }
  }

  // dumbbell_pair, dumbbell_single, band: all use buildableLoads + the double-progression ladder
  const loads = buildableLoads(inv, ex.loadType)
  if (!last) {
    const load = snapLoad(loads, ex.startKg ?? 4, 'nearest')
    return { loadKg: load, reps: fill(sets, max), assistKg: null, bandKg: null, amrapLast, calibration: true, buy: load == null, note: `Calibração: ajuste ${ex.loadType === 'band' ? 'a banda' : 'o peso'} até fechar ~12 repetições com 2–3 de reserva e registre o que usou.` }
  }
  const ds = doneSets(last)
  const load = ds[ds.length - 1].actualLoadKg ?? (snapLoad(loads, ex.startKg ?? 4) ?? 0)
  const bandKg = ds[ds.length - 1].bandKg ?? null
  const allTop = ds.every(s => (s.actualReps ?? 0) >= max) && meanRir(ds) >= 1
  const anyBelow = ds.some(s => (s.actualReps ?? 0) < min)

  if (allTop) {
    const up = nextLoad(loads, load)
    if (up != null) return { loadKg: up, reps: fill(sets, min), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: false }
    if (ex.bandTopUp) {
      const bands = bandLoads(inv)
      const nextBand = bandKg != null ? nextLoad(bands, bandKg) : (bands[0] ?? null)
      if (nextBand != null) return { loadKg: load, reps: fill(sets, min), assistKg: null, bandKg: nextBand, amrapLast, calibration: false, buy: false, note: 'Some a banda por cima do halter, na carga indicada.' }
      return { loadKg: load, reps: fill(sets, max), assistKg: null, bandKg: bandKg, amrapLast, calibration: false, buy: true, note: 'Comprar: você chegou ao máximo que consegue montar com seus pesos e bandas.' }
    }
    return { loadKg: load, reps: fill(sets, max), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: true, note: 'Comprar: você chegou ao máximo que consegue montar com seus pesos.' }
  }
  if (anyBelow) {
    if (ex.bandTopUp && bandKg != null) {
      const bands = bandLoads(inv)
      const prevBand = prevLoad(bands, bandKg)
      return { loadKg: load, reps: fill(sets, min), assistKg: null, bandKg: prevBand, amrapLast, calibration: false, buy: false }
    }
    const down = prevLoad(loads, load) ?? load
    return { loadKg: down, reps: fill(sets, min), assistKg: null, bandKg: null, amrapLast, calibration: false, buy: false }
  }
  const reps = fill(sets, min).map((_, i) => Math.min(max, (ds[Math.min(i, ds.length - 1)].actualReps ?? min) + 1))
  return { loadKg: load, reps, assistKg: null, bandKg, amrapLast, calibration: false, buy: false }
}
