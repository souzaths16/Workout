import type { AppState } from '@/domain/types'
import { appStateSchema } from '@/domain/schema'

const endpoint = (url: string) => `${url.replace(/\/$/, '')}/api/sync`

export async function pushBackup(url: string, token: string, state: AppState): Promise<void> {
  const res = await fetch(endpoint(url), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-sync-token': token },
    body: JSON.stringify(state)
  })
  if (!res.ok) throw new Error(`Falha ao sincronizar (${res.status})`)
}

export async function pullBackup(url: string, token: string): Promise<AppState> {
  const res = await fetch(endpoint(url), { headers: { 'x-sync-token': token } })
  if (!res.ok) throw new Error(`Falha ao restaurar (${res.status})`)
  const data = await res.json()
  if (data == null) throw new Error('Ainda não há backup salvo nessa nuvem.')
  const parsed = appStateSchema.safeParse(data)
  if (!parsed.success) throw new Error('Backup na nuvem em formato inválido.')
  return parsed.data as AppState
}
