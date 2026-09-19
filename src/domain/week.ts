import type { Block, DayTemplate, Session, Settings, WeekPlan } from './types'
import { WEEK_LAYOUT, TEMPLATE_BY_ID } from './templates'
import { addDays } from './dates'

export function buildWeek(weekStart: string, settings: Settings): WeekPlan {
  const layout = WEEK_LAYOUT[settings.weekMode]
  return {
    weekStart,
    days: layout.map((templateId, i) => {
      const id = templateId === 'descanso' && settings.rowingRestDay && i === 6 ? 'remo' : templateId
      return { date: addDays(weekStart, i), templateId: id, status: 'planned' as const }
    })
  }
}

export function setsForBlock(block: Block, weekIndex: number, light: boolean): number {
  let s = weekIndex <= 2 ? Math.min(block.sets, 3) : block.sets
  if (light) s = Math.max(2, Math.ceil(s / 2))
  return s
}

/** true when the last two finished sessions of this template both exceeded the cap */
export function shouldTrim(templateId: string, sessions: Session[], capMin: number): boolean {
  const last = sessions.filter(s => s.templateId === templateId && s.finishedAt && s.durationSec != null).slice(-2)
  return last.length === 2 && last.every(s => (s.durationSec ?? 0) > capMin * 60)
}

export function planBlocks(t: DayTemplate, weekIndex: number, light: boolean, trim: boolean): Block[] {
  const blocks = t.blocks.map(b => ({ ...b, sets: setsForBlock(b, weekIndex, light) }))
  if (trim && blocks.length) { const b = blocks[blocks.length - 1]; b.sets = Math.max(2, b.sets - 1) }
  return blocks
}

export const templateSets = (templateId: string): number => (TEMPLATE_BY_ID[templateId]?.blocks ?? []).reduce((a, b) => a + b.sets, 0)
export const weekTotalSets = (w: WeekPlan): number => w.days.reduce((a, d) => a + templateSets(d.templateId), 0)
