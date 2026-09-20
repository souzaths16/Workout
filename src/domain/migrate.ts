/**
 * Upgrade a persisted or imported state object to the current schema.
 * Runs on raw, untyped data — v1 states used string band levels
 * ('leve'/'media'/'pesada') where v2 uses the band's real kg.
 */
const LEGACY_BAND_KG: Record<string, number> = { leve: 10, media: 20, pesada: 40 }
const DEFAULT_BANDS = [10, 15, 20, 30, 40]

function migrateSetLog(raw: any): any {
  if (raw == null || typeof raw !== 'object') return raw
  const { assist, ...rest } = raw
  if (assist === undefined) return raw
  const assistKg = typeof assist === 'string' ? (LEGACY_BAND_KG[assist] ?? null) : assist
  return { ...rest, assistKg }
}

function migrateSession(raw: any): any {
  if (raw == null || typeof raw !== 'object') return raw
  return {
    ...raw,
    exercises: Array.isArray(raw.exercises) ? raw.exercises.map((e: any) => ({
      ...e,
      sets: Array.isArray(e.sets) ? e.sets.map(migrateSetLog) : e.sets
    })) : raw.exercises
  }
}

export function migrateState(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return raw
  const state = raw as any
  if (typeof state.schemaVersion === 'number' && state.schemaVersion >= 2) return state

  const settings = state.settings ?? {}
  const inventory = settings.inventory ?? {}
  const bands = Array.isArray(inventory.bands)
    ? (inventory.bands.length && typeof inventory.bands[0] === 'string'
        ? DEFAULT_BANDS
        : inventory.bands)
    : DEFAULT_BANDS
  const weekMode = settings.weekMode === '6x30' ? '6x45' : settings.weekMode
  const sessionCapMin = settings.sessionCapMin === 30 ? 45 : settings.sessionCapMin

  const pullup = state.pullup ?? { stage: 2, consecutiveHits: 0, tests: [] }

  return {
    ...state,
    schemaVersion: 2,
    settings: { ...settings, weekMode, sessionCapMin, inventory: { ...inventory, bands } },
    weeks: state.weeks,
    sessions: Array.isArray(state.sessions) ? state.sessions.map(migrateSession) : state.sessions,
    pullup: { ...pullup, assistKg: pullup.assistKg ?? null },
    active: state.active ? migrateSession(state.active) : state.active
  }
}
