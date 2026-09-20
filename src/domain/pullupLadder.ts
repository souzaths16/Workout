import type { Inventory, PullupState } from './types'
import { assistBands } from './inventory'

export interface LadderStage {
  stage: number
  nome: string
  descricao: string
  sets: number
  /** reps per set, or hold seconds for hang stages */
  target: number
  unit: 'reps' | 'seg'
  /** 'max': heaviest band owned. 'progress': steps down through the owned bands as you improve. 'min': lightest band owned. null: no band. */
  assist: 'max' | 'progress' | 'min' | null
  negativeSec?: number
}

export const LADDER: LadderStage[] = [
  { stage: 0, nome: 'Pendurada', descricao: 'Segure pendurada na barra, ombros ativos.', sets: 3, target: 25, unit: 'seg', assist: null },
  { stage: 1, nome: 'Escapular', descricao: 'Pendurada, puxe as escápulas para baixo sem dobrar o cotovelo.', sets: 3, target: 8, unit: 'reps', assist: null },
  { stage: 2, nome: 'Negativas 5 s', descricao: 'Suba com salto, desça em 5 s até o braço reto.', sets: 3, target: 4, unit: 'reps', assist: null, negativeSec: 5 },
  { stage: 3, nome: 'Negativas 8–10 s + banda mais pesada', descricao: '2 séries de negativas lentas e 2 séries completas com a banda mais pesada do kit.', sets: 4, target: 4, unit: 'reps', assist: 'max', negativeSec: 8 },
  { stage: 4, nome: 'Bandas decrescentes', descricao: 'Repetições completas; troque para a próxima banda mais leve a cada duas sessões seguidas no alvo.', sets: 4, target: 5, unit: 'reps', assist: 'progress' },
  { stage: 5, nome: 'Primeira estrita', descricao: 'Tente 1 repetição estrita; complete a série com a banda mais leve do kit.', sets: 3, target: 1, unit: 'reps', assist: 'min' },
  { stage: 6, nome: 'Estritas', descricao: 'Repetições estritas, sem banda.', sets: 3, target: 3, unit: 'reps', assist: null }
]

export const LADDER_BY_STAGE = (s: number) => LADDER[Math.max(0, Math.min(LADDER.length - 1, s))]

/** kg of the band to use right now for the given stage, or null when no band is used. */
export function ladderAssistKg(stage: number, pullup: PullupState, inv: Inventory): number | null {
  const s = LADDER_BY_STAGE(stage)
  const owned = assistBands(inv) // heaviest first
  if (s.assist === null) return null
  if (s.assist === 'max') return owned[0] ?? null
  if (s.assist === 'min') return owned[owned.length - 1] ?? null
  // 'progress': the band recorded on pullup.assistKg if still owned, else start one step lighter than the heaviest
  if (pullup.assistKg != null && owned.includes(pullup.assistKg)) return pullup.assistKg
  return owned[1] ?? owned[0] ?? null
}
