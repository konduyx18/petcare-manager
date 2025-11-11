import { addHours, addDays, differenceInHours, isPast, parseISO } from 'date-fns'

export interface DoseSchedule {
  time: Date
  isPast: boolean
  isOverdue: boolean
}

export function parseFrequency(frequency: string): { hours: number; times_per_day: number } | null {
  // Parse: "Every 12 hours", "Twice daily", "3 times per day", "Once daily"
  const lowerFreq = frequency.toLowerCase()

  // Match "every X hours"
  const hoursMatch = lowerFreq.match(/every (\d+) hours?/)
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1])
    return { hours, times_per_day: 24 / hours }
  }

  // Match "once daily", "twice daily"
  const timesMap: Record<string, number> = {
    once: 1,
    twice: 2,
    three: 3,
    four: 4,
  }

  for (const [word, times] of Object.entries(timesMap)) {
    if (lowerFreq.includes(word)) {
      return { hours: 24 / times, times_per_day: times }
    }
  }

  // Match "X times per day"
  const timesMatch = lowerFreq.match(/(\d+) times? (per|a) day/)
  if (timesMatch) {
    const times = parseInt(timesMatch[1])
    return { hours: 24 / times, times_per_day: times }
  }

  return null
}

export function calculateNextDose(
  lastGivenTime: Date,
  frequency: string
): Date | null {
  const parsed = parseFrequency(frequency)
  if (!parsed) return null
  return addHours(lastGivenTime, parsed.hours)
}

export function isDoseOverdue(scheduledTime: Date, gracePeriodHours: number = 2): boolean {
  const now = new Date()
  const hoursSinceScheduled = differenceInHours(now, scheduledTime)
  return hoursSinceScheduled > gracePeriodHours
}

export function getRemainingDoses(
  startDate: string,
  endDate: string | null,
  frequency: string
): number | null {
  if (!endDate) return null

  const parsed = parseFrequency(frequency)
  if (!parsed) return null

  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const totalHours = differenceInHours(end, start)
  const totalDoses = Math.ceil(totalHours / parsed.hours)

  const now = new Date()
  const elapsedHours = differenceInHours(now, start)
  const dosesGiven = Math.floor(elapsedHours / parsed.hours)

  return Math.max(0, totalDoses - dosesGiven)
}

export function generateDoseSchedule(
  prescription: {
    start_date: string
    end_date: string | null
    frequency: string
    last_dose_time?: string
  }
): DoseSchedule[] {
  const parsed = parseFrequency(prescription.frequency)
  if (!parsed) return []

  const startDate = prescription.last_dose_time
    ? parseISO(prescription.last_dose_time)
    : parseISO(prescription.start_date)

  const endDate = prescription.end_date
    ? parseISO(prescription.end_date)
    : addDays(new Date(), 30)

  const schedule: DoseSchedule[] = []
  let currentTime = startDate

  while (currentTime <= endDate && schedule.length < 100) {
    const isPastDue = isPast(currentTime)
    const isOverdue = isDoseOverdue(currentTime)

    schedule.push({
      time: currentTime,
      isPast: isPastDue,
      isOverdue
    })

    currentTime = addHours(currentTime, parsed.hours)
  }

  return schedule
}

export function getNextDoseIn(nextDoseTime: Date): string {
  const now = new Date()
  const hours = differenceInHours(nextDoseTime, now)

  if (hours < 0) return 'Overdue'
  if (hours === 0) return 'Now'
  if (hours < 1) {
    const minutes = Math.round((nextDoseTime.getTime() - now.getTime()) / 60000)
    return `${minutes}m`
  }
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}
