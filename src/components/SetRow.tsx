import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Exercise, Rir, SetLog } from '@/domain/types'
import { LADDER_BY_STAGE } from '@/domain/pullupLadder'
import { t } from '@/i18n/pt-BR'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const RIRS: Rir[] = [0, 1, 2, 3, 4]

export function SetHeader({ ex, stage }: { ex: Exercise; stage?: number }) {
  const ladder = ex.loadType === 'pullup_ladder' ? LADDER_BY_STAGE(stage ?? 0) : null
  const loadLabel = ex.loadType === 'pullup_ladder' ? '' : ex.loadType === 'bodyweight' ? t.hoje.assist : ex.loadType === 'band' ? t.hoje.bandKg : t.hoje.load
  return (
    <div className="grid grid-cols-[1.5rem_1fr_1fr_auto_2.5rem] items-center gap-1.5 px-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
      <span>#</span><span className="text-center">{loadLabel}</span><span className="text-center">{ladder?.unit === 'seg' ? t.hoje.seconds : t.hoje.reps}</span><span className="w-[7.25rem] text-center">{t.hoje.rir}</span><span />
    </div>
  )
}

export function SetRow({ ex, set, stage, onChange, onDone }: { ex: Exercise; set: SetLog; stage?: number; onChange: (p: Partial<SetLog>) => void; onDone: () => void }) {
  const ladder = ex.loadType === 'pullup_ladder' ? LADDER_BY_STAGE(stage ?? 0) : null
  const isHold = ladder?.unit === 'seg'
  const showLoad = ex.loadType === 'dumbbell_pair' || ex.loadType === 'dumbbell_single' || ex.loadType === 'band' || (ex.loadType === 'bodyweight' && set.assistKg == null)
  return (
    <div className={cn('grid grid-cols-[1.5rem_1fr_1fr_auto_2.5rem] items-center gap-1.5 rounded-md px-0.5 py-1', set.done && 'bg-success/10')}>
      <div className="text-sm text-muted-foreground">{set.n}{set.amrap && <Badge variant="warning" className="ml-0.5 px-1 py-0 text-[9px]">{t.hoje.amrap}</Badge>}</div>
      {showLoad ? (
        <div className="flex flex-col items-center gap-0.5">
          <Input type="number" inputMode="decimal" step="0.5" min={0} value={set.actualLoadKg ?? ''} placeholder={set.suggestedLoadKg == null ? '' : String(set.suggestedLoadKg)}
            onChange={e => onChange({ actualLoadKg: e.target.value === '' ? null : Number(e.target.value) })} className="h-10 px-1 text-center" aria-label="carga" />
          {set.bandKg != null && <span className="text-[10px] text-muted-foreground">{t.hoje.topUp} {set.bandKg} kg</span>}
        </div>
      ) : (
        <div className="text-center text-xs text-muted-foreground">{set.assistKg != null ? `${t.hoje.assist} ${set.assistKg} kg` : ladder && !isHold ? ladder.nome : '—'}</div>
      )}
      <Input type="number" inputMode="numeric" min={0} value={(isHold ? set.holdSec : set.actualReps) ?? ''} placeholder={set.amrap ? 'máx' : String(set.suggestedReps)}
        onChange={e => onChange(isHold ? { holdSec: e.target.value === '' ? null : Number(e.target.value) } : { actualReps: e.target.value === '' ? null : Number(e.target.value) })} className="h-10 px-1 text-center" aria-label="reps" />
      <div className="flex gap-0.5" aria-label={t.hoje.rir}>
        {RIRS.map(r => <button key={r} type="button" onClick={() => onChange({ rir: r })} className={cn('h-9 w-5 rounded text-xs', set.rir === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{r}</button>)}
      </div>
      <button type="button" aria-label="concluir série" onClick={() => { if (!set.done) { const patch: Partial<SetLog> = { done: true }; if (!isHold && set.actualReps == null) patch.actualReps = set.suggestedReps; if (isHold && set.holdSec == null) patch.holdSec = set.suggestedReps; if (showLoad && set.actualLoadKg == null) patch.actualLoadKg = set.suggestedLoadKg; if (set.rir == null) patch.rir = 2; onChange(patch); onDone() } else onChange({ done: false }) }}
        className={cn('flex h-10 w-10 items-center justify-center rounded-md border', set.done ? 'border-success bg-success text-white' : 'border-input')}><Check className="h-5 w-5" /></button>
    </div>
  )
}
