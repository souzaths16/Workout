export const toISODate = (d: Date): string => {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const parseISODate = (s: string): Date => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s: string, n: number): string => { const d = parseISODate(s); d.setDate(d.getDate() + n); return toISODate(d) }
/** Monday of the week containing the date */
export const mondayOf = (s: string): string => { const d = parseISODate(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return toISODate(d) }
export const daysBetween = (a: string, b: string): number => Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000)
/** 1-based training week index relative to the program start (Monday of the start week) */
export const weekIndexOf = (startDate: string, date: string): number => Math.floor(daysBetween(mondayOf(startDate), date) / 7) + 1
export const hoursBetween = (a: Date, b: Date): number => (b.getTime() - a.getTime()) / 3600000
export const WEEKDAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
