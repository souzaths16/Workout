import type { DayTemplate, WeekMode } from './types'

export const TEMPLATES: DayTemplate[] = [
  { id: 'bracos_a', nome: 'Braços A', kind: 'lift', groups: ['biceps', 'triceps', 'ombros'], blocks: [
    { exerciseId: 'rosca_inclinada', sets: 4, pairedWith: 'triceps_overhead' },
    { exerciseId: 'triceps_overhead', sets: 4, pairedWith: 'rosca_inclinada' },
    { exerciseId: 'elevacao_lateral', sets: 3 }
  ] },
  { id: 'pernas_a', nome: 'Pernas A', kind: 'lift', groups: ['quadriceps', 'posterior_gluteos', 'panturrilha'], blocks: [
    { exerciseId: 'agachamento_bulgaro', sets: 4 },
    { exerciseId: 'terra_romeno', sets: 3 },
    { exerciseId: 'panturrilha', sets: 3 }
  ] },
  { id: 'puxar_a', nome: 'Puxar A + escada', kind: 'lift', groups: ['costas', 'biceps'], blocks: [
    { exerciseId: 'escada_barra', sets: 4 },
    { exerciseId: 'remada_apoiada', sets: 4 },
    { exerciseId: 'rosca_inclinada', sets: 3 }
  ] },
  { id: 'empurrar', nome: 'Empurrar', kind: 'lift', groups: ['peito', 'triceps'], blocks: [
    { exerciseId: 'supino_inclinado', sets: 4 },
    { exerciseId: 'paralelas', sets: 3 },
    { exerciseId: 'triceps_overhead', sets: 3 }
  ] },
  { id: 'pernas_b', nome: 'Pernas B', kind: 'lift', groups: ['quadriceps', 'posterior_gluteos', 'panturrilha', 'ombros'], blocks: [
    { exerciseId: 'agachamento_bulgaro', sets: 3 },
    { exerciseId: 'terra_romeno', sets: 4 },
    { exerciseId: 'panturrilha', sets: 3, pairedWith: 'elevacao_lateral' },
    { exerciseId: 'elevacao_lateral', sets: 3, pairedWith: 'panturrilha' }
  ] },
  { id: 'bracos_b', nome: 'Braços B + escada', kind: 'lift', groups: ['biceps', 'triceps', 'costas'], blocks: [
    { exerciseId: 'escada_barra', sets: 3 },
    { exerciseId: 'rosca_inclinada', sets: 4, pairedWith: 'triceps_overhead' },
    { exerciseId: 'triceps_overhead', sets: 4, pairedWith: 'rosca_inclinada' }
  ] },
  // 4 x 45 min alternative
  { id: 'superior_a', nome: 'Superior A', kind: 'lift', groups: ['biceps', 'triceps', 'costas', 'ombros'], blocks: [
    { exerciseId: 'escada_barra', sets: 4 },
    { exerciseId: 'remada_apoiada', sets: 4 },
    { exerciseId: 'rosca_inclinada', sets: 5, pairedWith: 'triceps_overhead' },
    { exerciseId: 'triceps_overhead', sets: 5, pairedWith: 'rosca_inclinada' },
    { exerciseId: 'elevacao_lateral', sets: 3 }
  ] },
  { id: 'inferior_a', nome: 'Inferior A', kind: 'lift', groups: ['quadriceps', 'posterior_gluteos', 'panturrilha'], blocks: [
    { exerciseId: 'agachamento_bulgaro', sets: 4 },
    { exerciseId: 'terra_romeno', sets: 4 },
    { exerciseId: 'panturrilha', sets: 3 }
  ] },
  { id: 'superior_b', nome: 'Superior B', kind: 'lift', groups: ['peito', 'triceps', 'biceps', 'costas', 'ombros'], blocks: [
    { exerciseId: 'escada_barra', sets: 3 },
    { exerciseId: 'supino_inclinado', sets: 4 },
    { exerciseId: 'paralelas', sets: 3 },
    { exerciseId: 'rosca_inclinada', sets: 5, pairedWith: 'triceps_overhead' },
    { exerciseId: 'triceps_overhead', sets: 4, pairedWith: 'rosca_inclinada' },
    { exerciseId: 'elevacao_lateral', sets: 3 }
  ] },
  { id: 'inferior_b', nome: 'Inferior B', kind: 'lift', groups: ['quadriceps', 'posterior_gluteos', 'panturrilha'], blocks: [
    { exerciseId: 'agachamento_bulgaro', sets: 3 },
    { exerciseId: 'terra_romeno', sets: 3 },
    { exerciseId: 'panturrilha', sets: 3 }
  ] },
  { id: 'remo', nome: 'Remo leve', kind: 'row', groups: [], blocks: [] },
  { id: 'descanso', nome: 'Descanso', kind: 'rest', groups: [], blocks: [] }
]

export const TEMPLATE_BY_ID: Record<string, DayTemplate> = Object.fromEntries(TEMPLATES.map(t => [t.id, t]))

/** Monday-first order of template ids for each week mode */
export const WEEK_LAYOUT: Record<WeekMode, string[]> = {
  '6x30': ['bracos_a', 'pernas_a', 'puxar_a', 'empurrar', 'pernas_b', 'bracos_b', 'descanso'],
  '4x45': ['superior_a', 'inferior_a', 'descanso', 'superior_b', 'inferior_b', 'descanso', 'descanso']
}
