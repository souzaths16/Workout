import { Redis } from '@upstash/redis'

const KEY = 'treino-backup'
const redis = Redis.fromEnv()

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sync-token')
}

/**
 * Single-user JSON backup: stores whatever AppState blob the app sends, keyed by a
 * fixed name (one Vercel deployment == one person's data), gated by a shared secret
 * token so the endpoint isn't world-writable.
 */
export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') { res.status(204).end(); return }

  const token = req.headers['x-sync-token']
  if (!token || token !== process.env.SYNC_TOKEN) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  if (req.method === 'GET') {
    const data = await redis.get(KEY)
    res.status(200).json(data ?? null)
    return
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    await redis.set(KEY, body)
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'method not allowed' })
}
