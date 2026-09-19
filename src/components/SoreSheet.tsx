import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MUSCLE_GROUPS, type MuscleGroup } from '@/domain/types'
import { t } from '@/i18n/pt-BR'
import { cn } from '@/lib/utils'

export function SoreSheet({ open, onOpenChange, onApply }: { open: boolean; onOpenChange: (o: boolean) => void; onApply: (g: MuscleGroup[]) => void }) {
  const [sel, setSel] = useState<MuscleGroup[]>([])
  const toggle = (g: MuscleGroup) => setSel(s => (s.includes(g) ? s.filter(x => x !== g) : [...s, g]))
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t.sore.title}</DialogTitle>
        <DialogDescription>{t.semana.rule}</DialogDescription>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {MUSCLE_GROUPS.map(g => (
            <button key={g} type="button" onClick={() => toggle(g)} className={cn('rounded-md border px-3 py-3 text-sm', sel.includes(g) ? 'border-primary bg-primary/15 text-foreground' : 'bg-muted text-muted-foreground')}>{t.groups[g]}</button>
          ))}
        </div>
        <Button className="mt-4 w-full" disabled={!sel.length} onClick={() => { onApply(sel); setSel([]); onOpenChange(false) }}>{t.sore.apply}</Button>
      </DialogContent>
    </Dialog>
  )
}
