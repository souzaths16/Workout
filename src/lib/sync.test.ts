import { describe, it, expect, vi, afterEach } from 'vitest'
import { pushBackup, pullBackup } from './sync'
import type { AppState } from '@/domain/types'
import { DEFAULT_INVENTORY } from '@/domain/inventory'

const settings = {
  startDate: '2026-01-01', inventory: DEFAULT_INVENTORY, rowingRestDay: true, sessionCapMin: 45,
  weekMode: '6x45' as const, bodyweightKg: 61, stretchNoteSeen: false
}
const state: AppState = {
  schemaVersion: 2, settings, weeks: [], sessions: [],
  pullup: { stage: 2, consecutiveHits: 0, tests: [] }, body: [], active: null
}

afterEach(() => vi.unstubAllGlobals())

describe('pushBackup', () => {
  it('PUTs the state with the auth header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await pushBackup('https://x.vercel.app/', 'tok', state)
    expect(fetchMock).toHaveBeenCalledWith('https://x.vercel.app/api/sync', expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({ 'x-sync-token': 'tok' })
    }))
  })
  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    await expect(pushBackup('https://x.vercel.app', 'tok', state)).rejects.toThrow(/401/)
  })
})

describe('pullBackup', () => {
  it('returns the parsed state on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => state }))
    expect(await pullBackup('https://x.vercel.app', 'tok')).toEqual(state)
  })
  it('throws when there is no backup yet', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => null }))
    await expect(pullBackup('https://x.vercel.app', 'tok')).rejects.toThrow(/backup/)
  })
  it('throws on an invalid payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nonsense: true }) }))
    await expect(pullBackup('https://x.vercel.app', 'tok')).rejects.toThrow(/inválido/)
  })
})
