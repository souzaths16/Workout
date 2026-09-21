import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TEMPLATE_BY_ID } from '@/domain/templates'
import type { WeekPlan } from '@/domain/types'
import { weekdayLabel } from '@/domain/dates'
import { t } from '@/i18n/pt-BR'

export function ChooseDaySheet({ open, onOpenChange, week, excludeDate, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; week: WeekPlan; excludeDate: string; onPick: (date: string) => void }) {
  const options = week.days.filter(d => d.date !== excludeDate && d.status !== 'done' && TEMPLATE_BY_ID[d.templateId]?.kind === 'lift')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t.hoje.chooseTitle}</DialogTitle>
        <DialogDescription>{t.hoje.chooseHint}</DialogDescription>
        <div className="mt-4 space-y-2">
          {options.length === 0 && <p className="text-sm text-muted-foreground">{t.hoje.chooseNone}</p>}
          {options.map(d => (
            <button key={d.date} type="button" onClick={() => { onPick(d.date); onOpenChange(false) }}
              className="flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm hover:bg-accent">
              <span><span className="text-muted-foreground">{weekdayLabel(d.date)} · </span>{TEMPLATE_BY_ID[d.templateId]?.nome}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
