import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { TIER_LABEL, EVIDENCE } from '@/domain/evidence'
import type { Exercise } from '@/domain/types'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const tierVariant = (t: Exercise['evidence']['tier']) => t === 'W40+' || t === 'W' ? 'success' : t === 'unknown' ? 'outline' : 'warning'

export function EvidenceBadge({ ex }: { ex: Exercise }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-left"><Badge variant={tierVariant(ex.evidence.tier)}>{TIER_LABEL[ex.evidence.tier]}</Badge></button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{ex.nome}</DialogTitle>
          <DialogDescription>{ex.evidence.note}</DialogDescription>
          <ul className="mt-3 space-y-2 text-sm">
            {ex.evidence.refs.map(n => { const e = EVIDENCE.find(x => x.n === n); return e ? <li key={n} className="rounded-md bg-muted p-2"><span className="font-medium">#{n}</span> {e.claim} <span className="text-muted-foreground">— {e.source} · {e.strength}</span></li> : null })}
          </ul>
          <div className="mt-4 space-y-1 text-sm"><p className="font-medium">Dicas</p><ul className="list-disc pl-5 text-muted-foreground">{ex.cues.map(c => <li key={c}>{c}</li>)}</ul></div>
        </DialogContent>
      </Dialog>
    </>
  )
}
