import type { MuscleGroup } from '@/domain/types'
/** Dark-surface categorical palette (validated, fixed order, never cycled). */
export const SERIES = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'] as const
export const GROUP_COLOR: Record<MuscleGroup, string> = {
  biceps: SERIES[0], triceps: SERIES[1], costas: SERIES[2], peito: SERIES[3], ombros: SERIES[4], quadriceps: SERIES[5], posterior_gluteos: SERIES[6], panturrilha: SERIES[7]
}
export const INK = { primary: '#f5f5f7', secondary: '#c3c2b7', muted: '#898781', grid: '#2c2c2e', axis: '#383838' }
export const chartMargin = { top: 8, right: 8, bottom: 0, left: -12 }
export const tooltipStyle = { contentStyle: { background: '#1b1b1e', border: '1px solid #383838', borderRadius: 8, fontSize: 12, color: INK.primary }, labelStyle: { color: INK.secondary }, itemStyle: { color: INK.primary } }
export const axisProps = { tick: { fill: INK.muted, fontSize: 11 }, axisLine: { stroke: INK.axis }, tickLine: false as const }
