export interface LiveAge {
  years: number
  months: number
  days: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
}

export const BIRTH_DATE = new Date(2006, 6, 7)

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function daysInMonth(m: number, y: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
}

export function calculateAge(now: Date): LiveAge {
  const bd = BIRTH_DATE
  const by = bd.getFullYear()
  const bm = bd.getMonth()
  const bd_ = bd.getDate()
  const ny = now.getFullYear()
  const nm = now.getMonth()
  const nd = now.getDate()

  let years = ny - by
  let months = nm - bm
  let days = nd - bd_

  if (days < 0) {
    months--
    days += daysInMonth(nm === 0 ? 11 : nm - 1, nm === 0 ? ny - 1 : ny)
  }

  if (months < 0) {
    years--
    months += 12
  }

  if (days < 0) {
    months--
    days += daysInMonth(nm === 0 ? 11 : nm - 1, nm === 0 ? ny - 1 : ny)
  }

  if (months < 0) {
    years--
    months += 12
  }

  const diffMs = now.getTime() - bd.getTime()
  const totalHours = Math.floor(diffMs / 3600000)
  const totalMinutes = Math.floor(diffMs / 60000)
  const totalSeconds = Math.floor(diffMs / 1000)

  return { years, months, days, totalHours, totalMinutes, totalSeconds }
}

export function formatBirthDate(): string {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${BIRTH_DATE.getDate()} ${months[BIRTH_DATE.getMonth()]} ${BIRTH_DATE.getFullYear()}`
}
