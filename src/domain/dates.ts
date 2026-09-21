export const toISODate = (d: Date): string => {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const parseISODate = (s: string): Date => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s: string, n: number): string => { const d = parseISODate(s); d.setDate(d.getDate() + n); return toISODate(d) }
/** Monday of the ISO calendar week containing the date */
export const mondayOf = (s: string): string => { const d = parseISODate(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return toISODate(d) }
/** Start of the training week containing `date`, anchored to the weekday the program started on (not necessarily Monday) */
export const weekStartOf = (startDate: string, date: string): string => {
  const anchorWd = parseISODate(startDate).getDay()
  const d = parseISODate(date)
  const diff = (d.getDay() - anchorWd + 7) % 7
  d.setDate(d.getDate() - diff)
  return toISODate(d)
}
export const daysBetween = (a: string, b: string): number => Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000)
/** 1-based training week index relative to the program start date */
export const weekIndexOf = (startDate: string, date: string): number => Math.floor(daysBetween(startDate, date) / 7) + 1
export const hoursBetween = (a: Date, b: Date): number => (b.getTime() - a.getTime()) / 3600000
export const WEEKDAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const WEEKDAY_BY_JSDAY_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
/** Portuguese weekday abbreviation for an actual calendar date (independent of the day's position in a training week) */
export const weekdayLabel = (date: string): string => WEEKDAY_BY_JSDAY_PT[parseISODate(date).getDay()]
