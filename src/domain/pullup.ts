import type { PullupState } from './types'
import { LADDER } from './pullupLadder'
import { addDays } from './dates'

export function pullupResult(state: PullupState, allHit: boolean): PullupState {
  if (!allHit) return { ...state, consecutiveHits: 0 }
  const hits = state.consecutiveHits + 1
  if (hits >= 2 && state.stage < LADDER.length - 1) return { ...state, stage: state.stage + 1, consecutiveHits: 0 }
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
