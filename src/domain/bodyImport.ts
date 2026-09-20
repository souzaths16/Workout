import type { BodyLog } from './types'
import { parseCsv } from '@/lib/csv'

const DATE_KEYS = ['date', 'data', 'start date', 'startdate']
const WEIGHT_KEYS = ['weight', 'peso', 'value', 'valor']

/**
 * Generic "date, weight" CSV, for hand-made sheets or a Shortcuts export off
 * Apple Health (HealthU+ etc write weight samples there). Headers are matched
 * loosely (pt-BR or en) and only rows with a YYYY-MM-DD-prefixed date parse.
 */
export function parseBodyWeightCsv(text: string): BodyLog[] {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('CSV vazio.')
  const header = rows[0].map(h => h.toLowerCase())
  const dateIdx = header.findIndex(h => DATE_KEYS.some(k => h.startsWith(k)))
  const weightIdx = header.findIndex(h => WEIGHT_KEYS.some(k => h.startsWith(k)))
  if (dateIdx < 0 || weightIdx < 0) {
    throw new Error('Não encontrei colunas de data e peso. Use cabeçalhos como "date,weight" ou "data,peso" (primeira linha).')
  }
  const byDate = new Map<string, number>()
  for (const cols of rows.slice(1)) {
    const date = (cols[dateIdx] ?? '').slice(0, 10)
    const w = Number((cols[weightIdx] ?? '').replace(',', '.'))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(w) || w <= 0) continue
    byDate.set(date, w)
  }
  return [...byDate.entries()].map(([date, bodyweightKg]) => ({ date, bodyweightKg })).sort((a, b) => a.date.localeCompare(b.date))
}
