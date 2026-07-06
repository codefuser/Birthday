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
  const bd = BIRTH_DATE
  let years = now.getFullYear() - bd.getFullYear()
  let months = now.getMonth() - bd.getMonth()
  let days = now.getDate() - bd.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  const diffMs = now.getTime() - bd.getTime()
  const totalHours = Math.floor(diffMs / 36e5)
  const totalMinutes = Math.floor(diffMs / 6e4)
  const totalSeconds = Math.floor(diffMs / 1e3)

  return { years, months, days, totalHours, totalMinutes, totalSeconds }
}

export function formatBirthDate(): string {
  const d = BIRTH_DATE
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
