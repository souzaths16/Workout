import { describe, it, expect } from 'vitest'
import { parseBodyWeightCsv } from './bodyImport'

describe('parseBodyWeightCsv', () => {
  it('parses a simple date,weight CSV', () => {
    const csv = 'date,weight\n2026-01-05,61.2\n2026-01-12,60.8\n'
    expect(parseBodyWeightCsv(csv)).toEqual([
      { date: '2026-01-05', bodyweightKg: 61.2 },
      { date: '2026-01-12', bodyweightKg: 60.8 }
    ])
  })
  it('accepts pt-BR headers and ISO datetimes, keeps the last sample per day', () => {
    const csv = 'data;peso\n2026-01-05 08:00:00 +0000;61,5\n2026-01-05 20:00:00 +0000;61,0\n'
    expect(parseBodyWeightCsv(csv)).toEqual([{ date: '2026-01-05', bodyweightKg: 61 }])
  })
  it('throws when it cannot find date/weight columns', () => {
    expect(() => parseBodyWeightCsv('a,b\n1,2\n')).toThrow(/data e peso/)
  })
  it('throws on an empty CSV', () => {
    expect(() => parseBodyWeightCsv('date,weight\n')).toThrow(/vazio/)
  })
})
