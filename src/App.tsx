import { Suspense, lazy, useState } from 'react'
import { Hoje } from '@/screens/Hoje'
import { Semana } from '@/screens/Semana'
import { BarraFixa } from '@/screens/BarraFixa'
import { Corpo } from '@/screens/Corpo'
import { Ajustes } from '@/screens/Ajustes'
import { t } from '@/i18n/pt-BR'
import { cn } from '@/lib/utils'
import { Dumbbell, CalendarDays, TrendingUp, ArrowUpFromLine, Ruler, Settings } from 'lucide-react'

const Progresso = lazy(() => import('@/screens/Progresso').then(m => ({ default: m.Progresso })))

const TABS = [
  { id: 'hoje', label: t.tabs.hoje, Icon: Dumbbell, C: Hoje },
  { id: 'semana', label: t.tabs.semana, Icon: CalendarDays, C: Semana },
  { id: 'progresso', label: t.tabs.progresso, Icon: TrendingUp, C: Progresso },
  { id: 'barra', label: t.tabs.barra, Icon: ArrowUpFromLine, C: BarraFixa },
  { id: 'corpo', label: t.tabs.corpo, Icon: Ruler, C: Corpo },
  { id: 'ajustes', label: t.tabs.ajustes, Icon: Settings, C: Ajustes }
] as const

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>(() => { try { return (localStorage.getItem('treino-tab') as typeof TABS[number]['id']) || 'hoje' } catch { return 'hoje' } })
  const Screen = TABS.find(x => x.id === tab)!.C
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-16">
      <main><Suspense fallback={<p className="p-4 text-sm text-muted-foreground">…</p>}><Screen /></Suspense></main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto grid max-w-md grid-cols-6">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => { setTab(id); try { localStorage.setItem('treino-tab', id) } catch { /* ignore */ } }} className={cn('flex flex-col items-center gap-0.5 py-2 text-[10px]', tab === id ? 'text-primary' : 'text-muted-foreground')} aria-current={tab === id ? 'page' : undefined}>
              <Icon className="h-5 w-5" /><span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
