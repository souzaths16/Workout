import type { Exercise } from './types'
import { EXERCISES } from './exercises'
import { parseCsv } from '@/lib/csv'

export interface FitbodEntry {
  name: string
  /** date (YYYY-MM-DD) of the most recent non-warmup set logged for this exercise */
  lastDate: string
  /** heaviest weight logged on that date — Fitbod's Weight(kg) is already per hand/held weight */
  suggestedKg: number
}

/** Our exercises whose startKg is a per-dumbbell/held load a Fitbod entry can seed. */
export const CALIBRATABLE_EXERCISES: Exercise[] = EXERCISES.filter(e => e.loadType === 'dumbbell_pair' || e.loadType === 'dumbbell_single')

const KEYWORD_HINTS: Record<string, string[]> = {
  rosca_inclinada: ['curl'],
  triceps_overhead: ['tricep'],
  elevacao_lateral: ['lateral raise'],
  remada_apoiada: ['row'],
  supino_inclinado: ['bench press'],
  agachamento_bulgaro: ['lunge', 'squat'],
  terra_romeno: ['romanian deadlift'],
  panturrilha: ['calf'],
}

export function parseFitbodCsv(text: string): Map<string, FitbodEntry> {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('CSV vazio.')
  const header = rows[0].map(h => h.trim().toLowerCase())
  const dateIdx = header.indexOf('date')
  const exIdx = header.indexOf('exercise')
  const wIdx = header.indexOf('weight(kg)')
  const warmIdx = header.indexOf('iswarmup')
  if (dateIdx < 0 || exIdx < 0 || wIdx < 0) {
    throw new Error('CSV não parece um export do Fitbod (esperava colunas Date, Exercise, Weight(kg)).')
  }

  const byName = new Map<string, { date: string; weight: number }[]>()
  for (const cols of rows.slice(1)) {
    const name = cols[exIdx]?.trim()
    const date = cols[dateIdx]?.slice(0, 10)
    const weight = Number(cols[wIdx])
    const isWarmup = warmIdx >= 0 && cols[warmIdx]?.trim().toLowerCase() === 'true'
    if (!name || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(weight) || weight <= 0 || isWarmup) continue
    if (!byName.has(name)) byName.set(name, [])
    byName.get(name)!.push({ date, weight })
  }

  const out = new Map<string, FitbodEntry>()
  for (const [name, sets] of byName) {
    const lastDate = sets.reduce((latest, s) => (s.date > latest ? s.date : latest), sets[0].date)
    const suggestedKg = Math.max(...sets.filter(s => s.date === lastDate).map(s => s.weight))
    out.set(name, { name, lastDate, suggestedKg })
  }
  return out
}

/** Best-effort keyword guess of which Fitbod exercise name matches each of our exercises; the caller lets the user confirm or override each pick. */
export function suggestFitbodMapping(entries: Map<string, FitbodEntry>): Record<string, string | null> {
  const names = [...entries.keys()]
  const out: Record<string, string | null> = {}
  for (const ex of CALIBRATABLE_EXERCISES) {
    const hints = KEYWORD_HINTS[ex.id] ?? []
    out[ex.id] = names.find(n => hints.some(h => n.toLowerCase().includes(h))) ?? null
  }
  return out
}
