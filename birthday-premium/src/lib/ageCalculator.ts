import { intervalToDuration, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

export interface LiveAge {
  years: number
  months: number
  days: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
}

export const BIRTH_DATE = new Date(2006, 6, 7)

export function calculateAge(now: Date): LiveAge {
  const duration = intervalToDuration({ start: BIRTH_DATE, end: now })
  return {
    years: duration.years ?? 0,
    months: duration.months ?? 0,
    days: duration.days ?? 0,
    totalHours: differenceInHours(now, BIRTH_DATE),
    totalMinutes: differenceInMinutes(now, BIRTH_DATE),
    totalSeconds: differenceInSeconds(now, BIRTH_DATE),
  }
}

export function formatBirthDate(): string {
  const d = BIRTH_DATE
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
