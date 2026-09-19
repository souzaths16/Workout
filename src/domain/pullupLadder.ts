export interface LadderStage {
  stage: number
  nome: string
  descricao: string
  sets: number
  /** reps per set, or hold seconds for hang stages */
  target: number
  unit: 'reps' | 'seg'
  assist: 'pesada' | 'leve' | null
  negativeSec?: number
}

export const LADDER: LadderStage[] = [
  { stage: 0, nome: 'Pendurada', descricao: 'Segure pendurada na barra, ombros ativos.', sets: 3, target: 25, unit: 'seg', assist: null },
  { stage: 1, nome: 'Escapular', descricao: 'Pendurada, puxe as escápulas para baixo sem dobrar o cotovelo.', sets: 3, target: 8, unit: 'reps', assist: null },
  { stage: 2, nome: 'Negativas 5 s', descricao: 'Suba com salto, desça em 5 s até o braço reto.', sets: 3, target: 4, unit: 'reps', assist: null, negativeSec: 5 },
  { stage: 3, nome: 'Negativas 8–10 s + banda pesada', descricao: '2 séries de negativas lentas e 2 séries completas com a banda pesada.', sets: 4, target: 4, unit: 'reps', assist: 'pesada', negativeSec: 8 },
  { stage: 4, nome: 'Banda leve', descricao: 'Repetições completas com a banda mais fina.', sets: 4, target: 5, unit: 'reps', assist: 'leve' },
  { stage: 5, nome: 'Primeira estrita', descricao: 'Tente 1 repetição estrita; complete a série com banda leve.', sets: 3, target: 1, unit: 'reps', assist: null },
  { stage: 6, nome: 'Estritas', descricao: 'Repetições estritas, sem banda.', sets: 3, target: 3, unit: 'reps', assist: null }
]

export const LADDER_BY_STAGE = (s: number) => LADDER[Math.max(0, Math.min(LADDER.length - 1, s))]
