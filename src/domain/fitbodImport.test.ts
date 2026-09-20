import { describe, it, expect } from 'vitest'
import { parseFitbodCsv, suggestFitbodMapping } from './fitbodImport'

const CSV = `Date,Exercise,Reps,Weight(kg),Duration(s),Distance(m),Incline,Resistance,isWarmup,Note,multiplier
2026-02-19 09:12:37 +0000,Dumbbell Bicep Curl, 4,7.5,0.0,0.0,0.0,0.0,false,, 2.0
2026-02-19 09:12:37 +0000,Dumbbell Bicep Curl, 5,7.5,0.0,0.0,0.0,0.0,false,, 2.0
2026-01-01 09:00:00 +0000,Dumbbell Bicep Curl, 5,5.0,0.0,0.0,0.0,0.0,true,, 2.0
2026-02-19 09:12:37 +0000,Dumbbell Romanian Deadlift, 8,10.0,0.0,0.0,0.0,0.0,false,, 2.0
`

describe('parseFitbodCsv', () => {
  it('keeps the heaviest non-warmup set from the most recent session per exercise', () => {
    const entries = parseFitbodCsv(CSV)
    expect(entries.get('Dumbbell Bicep Curl')).toEqual({ name: 'Dumbbell Bicep Curl', lastDate: '2026-02-19', suggestedKg: 7.5 })
    expect(entries.get('Dumbbell Romanian Deadlift')?.suggestedKg).toBe(10)
  })
  it('throws on an unrecognized CSV', () => {
    expect(() => parseFitbodCsv('a,b\n1,2\n')).toThrow(/Fitbod/)
  })
})

describe('suggestFitbodMapping', () => {
  it('guesses matching exercises by keyword', () => {
    const entries = parseFitbodCsv(CSV)
    const mapping = suggestFitbodMapping(entries)
    expect(mapping.rosca_inclinada).toBe('Dumbbell Bicep Curl')
    expect(mapping.terra_romeno).toBe('Dumbbell Romanian Deadlift')
    expect(mapping.panturrilha).toBeNull()
  })
})
