import type { Exercise } from './types'

export const EXERCISES: Exercise[] = [
  {
    id: 'rosca_inclinada',
    nome: 'Rosca inclinada com halteres',
    primary: 'biceps', secondary: [],
    loadType: 'dumbbell_pair', repRange: [8, 12], restSec: 90, tempo: '3 s descendo, subida controlada',
    cues: ['Banco a ~45°, braços pendurados atrás da linha do tronco', 'Cotovelo fixo; desça até o braço quase reto', 'Sinta o alongamento no fundo de cada repetição'],
    warmupRule: 'ramp', startKg: 4,
    evidence: { tier: 'W', refs: [10], note: 'Mulheres: treinar o bíceps na posição alongada gerou mais hipertrofia distal (Pedrosa 2023, 19 mulheres).' },
    stretches: ['Alongamento de bíceps na parede (30 s por lado)']
  },
  {
    id: 'triceps_overhead',
    nome: 'Extensão de tríceps acima da cabeça',
    primary: 'triceps', secondary: [],
    loadType: 'dumbbell_single', repRange: [10, 15], restSec: 90, tempo: '3 s descendo, subida controlada',
    cues: ['Um halter com as duas mãos, cotovelos apontando para frente', 'Desça atrás da cabeça até sentir o alongamento', 'Estenda sem travar o cotovelo'],
    warmupRule: 'none', startKg: 6,
    evidence: { tier: 'X', refs: [29], note: 'Extrapolado: adultos jovens, sexo misto (Maeo 2023). Nenhum estudo só com mulheres encontrado.' },
    stretches: ['Alongamento de tríceps acima da cabeça (30 s por lado)']
  },
  {
    id: 'elevacao_lateral',
    nome: 'Elevação lateral com halteres',
    primary: 'ombros', secondary: [],
    loadType: 'dumbbell_pair', repRange: [12, 20], restSec: 60, tempo: '2 s descendo',
    cues: ['Leve inclinação do tronco à frente', 'Suba até a altura do ombro, cotovelo levemente flexionado', 'Desça devagar; sem balanço'],
    warmupRule: 'none', startKg: 3,
    evidence: { tier: 'X', refs: [33], note: 'Halter e cabo geram hipertrofia igual do deltoide lateral (24 pessoas treinadas, homens e mulheres, 2025).' },
    stretches: ['Alongamento de ombro cruzando o braço (30 s por lado)']
  },
  {
    id: 'escada_barra',
    nome: 'Escada da barra fixa',
    primary: 'costas', secondary: ['biceps'],
    loadType: 'pullup_ladder', repRange: [3, 5], restSec: 120, tempo: 'Negativas de 5 a 10 s',
    cues: ['Pegada pronada, um pouco além da largura dos ombros', 'Comece cada rep pendurada, ombros “encaixados”', 'Negativa: suba com salto, desça lento e completo'],
    warmupRule: 'none',
    evidence: { tier: 'W', refs: [9, 16, 37], note: 'Mulheres: incluir a fase excêntrica é essencial (Coratella 2022, 60 mulheres); relação força/massa prevê a primeira barra (Flanagan 2003). Escada em si: consenso prático, sem RCT.' },
    stretches: ['Alongamento de dorsal pendurada (20 s)']
  },
  {
    id: 'remada_apoiada',
    nome: 'Remada com halter apoiada no banco',
    primary: 'costas', secondary: ['biceps'],
    loadType: 'dumbbell_pair', repRange: [8, 12], restSec: 120, tempo: '2 s descendo',
    cues: ['Peito apoiado no banco inclinado, pés no chão', 'Puxe o cotovelo para trás e para o quadril', 'Deixe o halter descer até o braço reto'],
    warmupRule: 'ramp', startKg: 8,
    evidence: { tier: 'unknown', refs: [], note: 'Nenhum estudo comparando remadas para hipertrofia em mulheres. Escolha pela puxada horizontal com tronco apoiado.' },
    stretches: ['Alongamento de dorsal pendurada (20 s)']
  },
  {
    id: 'supino_inclinado',
    nome: 'Supino inclinado com halteres',
    primary: 'peito', secondary: ['triceps', 'ombros'],
    loadType: 'dumbbell_pair', repRange: [8, 12], restSec: 120, tempo: '3 s descendo',
    cues: ['Banco a ~30°', 'Desça até o cotovelo passar a linha do tronco', 'Suba e junte levemente os halteres'],
    warmupRule: 'ramp', startKg: 7,
    evidence: { tier: 'W', refs: [15, 32], note: 'Mulheres (EMG): inclinado ativa mais a porção clavicular (Luczak 2013, 24 mulheres). Crescimento: extrapolado de homens (Chaves 2020).' },
    stretches: ['Alongamento de peito no batente da porta (30 s)']
  },
  {
    id: 'paralelas',
    nome: 'Paralelas (dips)',
    primary: 'peito', secondary: ['triceps'],
    loadType: 'bodyweight', repRange: [6, 12], restSec: 120, tempo: '3 s descendo',
    cues: ['Use a banda presa nas barras se precisar', 'Desça até o ombro na altura do cotovelo', 'Tronco levemente inclinado para frente'],
    warmupRule: 'none',
    evidence: { tier: 'unknown', refs: [], note: 'Sem estudo de hipertrofia. Escolhido para carregar peito e tríceps com o peso do corpo, além do limite dos halteres.' },
    stretches: ['Alongamento de peito no batente da porta (30 s)', 'Alongamento de tríceps acima da cabeça (30 s por lado)']
  },
  {
    id: 'agachamento_bulgaro',
    nome: 'Agachamento búlgaro',
    primary: 'quadriceps', secondary: ['posterior_gluteos'],
    loadType: 'dumbbell_pair', repRange: [8, 12], restSec: 120, tempo: '3 s descendo',
    cues: ['Pé de trás no banco, halteres nas mãos', 'Desça fundo, joelho da frente alinhado com o pé', 'Nas 2 primeiras semanas, amplitude parcial se o joelho reclamar'],
    warmupRule: 'ramp', startKg: 6, painCheck: true,
    evidence: { tier: 'W', refs: [11, 13, 14, 34], note: 'Mulheres: variação de agachamento é livre (Enes 2024); progressão unilateral cresceu tanto quanto barra (Sci Rep 2023); amplitude longa favorece o quadríceps (Pedrosa 2022, 45 mulheres).' },
    stretches: ['Alongamento de quadríceps em pé (30 s por lado)', 'Alongamento de glúteo deitada (30 s por lado)']
  },
  {
    id: 'terra_romeno',
    nome: 'Terra romeno com halteres',
    primary: 'posterior_gluteos', secondary: [],
    loadType: 'dumbbell_pair', repRange: [8, 12], restSec: 120, tempo: '3 s descendo',
    cues: ['Joelhos levemente flexionados, coluna neutra', 'Empurre o quadril para trás até sentir o posterior alongar', 'Halteres rentes às pernas'],
    warmupRule: 'ramp', startKg: 10,
    evidence: { tier: 'X', refs: [30, 31], note: 'Extrapolado: treinar o posterior com quadril flexionado (alongado) cresce mais (Maeo 2021, 20 adultos). Nenhum estudo só com mulheres encontrado.' },
    stretches: ['Alongamento de posterior sentada (30 s por lado)']
  },
  {
    id: 'panturrilha',
    nome: 'Panturrilha em pé (parcial alongada)',
    primary: 'panturrilha', secondary: [],
    loadType: 'dumbbell_single', repRange: [12, 20], restSec: 60, tempo: '2 s descendo, pausa embaixo',
    cues: ['Ponta do pé numa anilha ou degrau', 'Desça o calcanhar o máximo possível e pause 1 s', 'Suba só até a metade: é a parte alongada que importa'],
    warmupRule: 'none', startKg: 8,
    evidence: { tier: 'W', refs: [12], note: 'Mulheres: parciais na posição alongada cresceram mais a panturrilha (Kassiano 2023, 42 mulheres).' },
    stretches: ['Alongamento de panturrilha na parede (30 s por lado)']
  }
]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map(e => [e.id, e]))
