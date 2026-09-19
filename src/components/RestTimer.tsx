import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { t } from '@/i18n/pt-BR'

export function RestTimer({ seconds, startKey }: { seconds: number; startKey: number }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => { if (startKey > 0) setLeft(seconds) }, [startKey, seconds])
  useEffect(() => {
    if (left == null || left <= 0) return
    const id = setInterval(() => setLeft(l => (l == null ? null : l - 1)), 1000)
    return () => clearInterval(id)
  }, [left])
  useEffect(() => { if (left === 0 && 'vibrate' in navigator) navigator.vibrate?.(200) }, [left])
  if (left == null) return null
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-between rounded-lg border bg-card px-4 py-2 shadow-lg">
      <span className="text-sm text-muted-foreground">{t.hoje.rest}</span>
      <span className={left === 0 ? 'text-2xl font-bold text-success' : 'text-2xl font-bold tabular-nums'}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => setLeft(l => (l ?? 0) + 30)}>+30</Button>
        <Button size="sm" variant="ghost" onClick={() => setLeft(null)}>{t.common.close}</Button>
      </div>
    </div>
  )
}
