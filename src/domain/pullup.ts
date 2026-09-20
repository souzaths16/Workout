import type { Inventory, PullupState } from './types'
import { LADDER, ladderAssistKg } from './pullupLadder'
import { addDays } from './dates'

export function pullupResult(state: PullupState, allHit: boolean, inv: Inventory): PullupState {
  if (!allHit) return { ...state, consecutiveHits: 0 }
  const hits = state.consecutiveHits + 1
  if (hits < 2) return { ...state, consecutiveHits: hits }

  const stage = LADDER[state.stage]
  if (stage.assist === 'progress') {
    const owned = [...inv.bands].sort((a, b) => b - a) // heaviest first
    const current = ladderAssistKg(state.stage, state, inv)
    const idx = current != null ? owned.indexOf(current) : -1
    const lighter = idx >= 0 ? owned[idx + 1] : undefined
    if (lighter != null) return { ...state, assistKg: lighter, consecutiveHits: 0 }
    // already on the lightest band owned: move on to the next stage
    return { ...state, stage: Math.min(state.stage + 1, LADDER.length - 1), assistKg: null, consecutiveHits: 0 }
  }
  if (state.stage < LADDER.length - 1) return { ...state, stage: state.stage + 1, consecutiveHits: 0 }
  return { ...state, consecutiveHits: hits }
}

/** strict-rep test every 14 days once stage ≥ 3 */
export function nextTestDate(state: PullupState, startDate: string, today: string): string | null {
  if (state.stage < 3) return null
  const last = state.tests.length ? state.tests[state.tests.length - 1].date : null
  const base = last ?? startDate
  let d = addDays(base, 14)
  while (d < today) d = addDays(d, 14)
  return d
}
