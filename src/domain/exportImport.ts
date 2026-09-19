import type { AppState, Session } from './types'
import { appStateSchema } from './schema'
import { EXERCISE_BY_ID } from './exercises'
import { TEMPLATE_BY_ID } from './templates'

export const exportJson = (state: AppState): string => JSON.stringify(state, null, 2)

export function exportCsv(sessions: Session[]): string {
  const rows = [['data', 'dia', 'exercicio', 'serie', 'carga_kg', 'reps', 'rir', 'amrap', 'banda', 'duracao_s']]
  for (const s of sessions.filter(s => s.finishedAt).sort((a, b) => a.date.localeCompare(b.date))) {
    for (const se of s.exercises) for (const set of se.sets.filter(x => x.done)) {
      rows.push([s.date, TEMPLATE_BY_ID[s.templateId]?.nome ?? s.templateId, EXERCISE_BY_ID[se.exerciseId]?.nome ?? se.exerciseId,
        String(set.n), set.actualLoadKg == null ? '' : String(set.actualLoadKg), String(set.actualReps ?? ''), String(set.rir ?? ''),
        set.amrap ? '1' : '0', set.assist ?? '', String(s.durationSec ?? '')])
    }
  }
  return rows.map(r => r.map(v => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(';')).join('\n')
}

export function importJson(text: string): AppState {
  const parsed = appStateSchema.safeParse(JSON.parse(text))
  if (!parsed.success) throw new Error('Arquivo inválido: ' + parsed.error.issues.slice(0, 3).map(i => i.path.join('.') + ' ' + i.message).join('; '))
  return parsed.data as AppState
}
