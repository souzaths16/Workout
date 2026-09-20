export type MuscleGroup =
  | 'biceps' | 'triceps' | 'peito' | 'costas' | 'ombros'
  | 'quadriceps' | 'posterior_gluteos' | 'panturrilha'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'biceps', 'triceps', 'costas', 'peito', 'ombros', 'quadriceps', 'posterior_gluteos', 'panturrilha'
]

export type LoadType = 'dumbbell_pair' | 'dumbbell_single' | 'bodyweight' | 'pullup_ladder' | 'band'
export type EvidenceTier = 'W40+' | 'W' | 'X' | 'M' | 'unknown'

export interface Exercise {
  id: string
  nome: string
  primary: MuscleGroup
  secondary: MuscleGroup[]
  loadType: LoadType
  repRange: [number, number]
  restSec: number
  tempo: string
  cues: string[]
  warmupRule: 'ramp' | 'none'
  /** default first-session load per dumbbell (or single dumbbell, or band) before snapping */
  startKg?: number
  /** dumbbell exercise: once the inventory's top load is reached, add a band on top instead of flagging a purchase */
  bandTopUp?: boolean
  evidence: { tier: EvidenceTier; refs: number[]; note: string }
  /** knee check after the session */
  painCheck?: boolean
  /** stretch names for the cool-down */
  stretches: string[]
}

export interface Block { exerciseId: string; sets: number; pairedWith?: string }

export type DayKind = 'lift' | 'row' | 'rest'
export interface DayTemplate {
  id: string
  nome: string
  kind: DayKind
  groups: MuscleGroup[]
  blocks: Block[]
}

export type DayStatus = 'planned' | 'done' | 'skipped' | 'swapped'
export interface PlannedDay { date: string; templateId: string; status: DayStatus; sourceTemplateId?: string }
export interface WeekPlan { weekStart: string; light?: boolean; days: PlannedDay[] }

export type Rir = 0 | 1 | 2 | 3 | 4
export interface SetLog {
  n: number
  suggestedLoadKg: number | null
  suggestedReps: number
  actualLoadKg: number | null
  actualReps: number | null
  rir: Rir | null
  done: boolean
  amrap?: boolean
  /** bodyweight/pull-up ladder exercises: assistance band used, in kg */
  assistKg?: number | null
  /** dumbbell exercise at the top of the inventory: band added on top, in kg */
  bandKg?: number | null
  /** pull-up ladder: hold seconds for hang stages */
  holdSec?: number | null
}
export interface SessionExercise { exerciseId: string; sets: SetLog[]; painScore?: number; stage?: number }
export interface Session {
  id: string
  date: string
  templateId: string
  startedAt: string
  finishedAt?: string
  durationSec?: number
  exercises: SessionExercise[]
  rowingMin?: number
  notes?: string
  light?: boolean
}

export interface PullupTest { date: string; strictReps: number }
export interface PullupState { stage: number; consecutiveHits: number; tests: PullupTest[]; assistKg?: number | null }

export interface BodyLog { date: string; bodyweightKg?: number; armLeftCm?: number; armRightCm?: number }

export interface PlateSet { kg: number; count: number }
export interface AdjustableSet { minKg: number; maxKg: number; stepKg: number; pair: boolean }
export interface Inventory {
  plates: PlateSet[]
  handleKg: number
  handles: number
  adjustable: AdjustableSet[]
  kettlebells: number[]
  /** elastic bands owned, by resistance in kg */
  bands: number[]
  dipBelt: boolean
}

export type WeekMode = '6x45' | '4x45'
export interface Settings {
  startDate: string
  inventory: Inventory
  rowingRestDay: boolean
  sessionCapMin: number
  weekMode: WeekMode
  bodyweightKg: number
  stretchNoteSeen: boolean
  /** per-exercise first-session load (kg), overriding Exercise.startKg — e.g. calibrated from an imported Fitbod history */
  startKgOverrides?: Record<string, number>
}

export interface AppState {
  schemaVersion: number
  settings: Settings
  weeks: WeekPlan[]
  sessions: Session[]
  pullup: PullupState
  body: BodyLog[]
  /** session currently in progress (not yet finished) */
  active: Session | null
}
