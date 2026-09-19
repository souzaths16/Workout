import type { Inventory, LoadType } from './types'

const round2 = (n: number) => Math.round(n * 100) / 100

export const DEFAULT_INVENTORY: Inventory = {
  plates: [{ kg: 2, count: 4 }, { kg: 1.5, count: 4 }, { kg: 1.25, count: 4 }],
  handleKg: 1,
  handles: 2,
  adjustable: [],
  kettlebells: [8],
  bands: ['leve', 'media', 'pesada'],
  dipBelt: false
}

/** Every dumbbell weight that can be built for a pair (both hands) or a single dumbbell. */
export function buildableLoads(inv: Inventory, loadType: LoadType): number[] {
  const out = new Set<number>()
  const pair = loadType === 'dumbbell_pair'
  const divisor = pair ? 4 : 2
  const handlesNeeded = pair ? 2 : 1
  if (inv.handles >= handlesNeeded) {
    // per-side multiset of plates; each type limited by count/divisor
    const limits = inv.plates.map(p => Math.floor(p.count / divisor))
    const rec = (i: number, perSide: number) => {
      if (i === inv.plates.length) { out.add(round2(inv.handleKg + 2 * perSide)); return }
      for (let k = 0; k <= limits[i]; k++) rec(i + 1, perSide + k * inv.plates[i].kg)
    }
    rec(0, 0)
  }
  for (const a of inv.adjustable) {
    if (pair && !a.pair) continue
    for (let w = a.minKg; w <= a.maxKg + 1e-9; w += a.stepKg) out.add(round2(w))
  }
  if (!pair) for (const k of inv.kettlebells) out.add(round2(k))
  return [...out].sort((x, y) => x - y)
}

export function snapLoad(loads: number[], target: number, mode: 'nearest' | 'up' | 'down' = 'nearest'): number | null {
  if (loads.length === 0) return null
  if (mode === 'up') return loads.find(l => l >= target - 1e-9) ?? null
  if (mode === 'down') { const c = loads.filter(l => l <= target + 1e-9); return c.length ? c[c.length - 1] : null }
  return loads.reduce((best, l) => Math.abs(l - target) < Math.abs(best - target) ? l : best, loads[0])
}
export const nextLoad = (loads: number[], current: number): number | null => loads.find(l => l > current + 1e-9) ?? null
export const prevLoad = (loads: number[], current: number): number | null => { const c = loads.filter(l => l < current - 1e-9); return c.length ? c[c.length - 1] : null }
export const maxLoad = (loads: number[]): number => loads.length ? loads[loads.length - 1] : 0
