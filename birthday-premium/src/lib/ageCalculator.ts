export interface LiveAge {
  years: number
  totalMonths: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
}

export const BIRTH_DATE = new Date(2006, 6, 7)

export function calculateAge(now: Date): LiveAge {
  const diffMs = now.getTime() - BIRTH_DATE.getTime()
  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(diffMs / 60000)
  const totalHours = Math.floor(diffMs / 3600000)
  const totalDays = Math.floor(diffMs / 86400000)

  const by = BIRTH_DATE.getFullYear()
  const bm = BIRTH_DATE.getMonth()
  const bdd = BIRTH_DATE.getDate()
  const ny = now.getFullYear()
  const nm = now.getMonth()
  const nd = now.getDate()

  const totalMonths = (ny - by) * 12 + (nm - bm) - (nd < bdd ? 1 : 0)
  const years = Math.floor(totalMonths / 12)

  return { years, totalMonths, totalDays, totalHours, totalMinutes, totalSeconds }
}

const MONTHS_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export function formatBirthDate(): string {
  return `${BIRTH_DATE.getDate()} ${MONTHS_NAMES[BIRTH_DATE.getMonth()]} ${BIRTH_DATE.getFullYear()}`
}
