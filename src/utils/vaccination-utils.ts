import { addMonths, differenceInDays, isPast, parseISO } from 'date-fns'

export interface VaccinationStatus {
  status: 'overdue' | 'due-soon' | 'upcoming' | 'current'
  daysUntilDue: number
  message: string
  color: string
}

export function getVaccinationStatus(nextDueDate: string | null | undefined): VaccinationStatus {
  if (!nextDueDate) {
    return {
      status: 'current',
      daysUntilDue: 0,
      message: 'No due date set',
      color: 'gray'
    }
  }

  const dueDate = parseISO(nextDueDate)
  const today = new Date()
  const daysUntil = differenceInDays(dueDate, today)

  if (isPast(dueDate) && daysUntil < 0) {
    return {
      status: 'overdue',
      daysUntilDue: daysUntil,
      message: `Overdue by ${Math.abs(daysUntil)} days`,
      color: 'red'
    }
  }

  if (daysUntil <= 30) {
    return {
      status: 'due-soon',
      daysUntilDue: daysUntil,
      message: `Due in ${daysUntil} days`,
      color: 'orange'
    }
  }

  if (daysUntil <= 60) {
    return {
      status: 'upcoming',
      daysUntilDue: daysUntil,
      message: `Due in ${daysUntil} days`,
      color: 'blue'
    }
  }

  return {
    status: 'current',
    daysUntilDue: daysUntil,
    message: `Due in ${daysUntil} days`,
    color: 'green'
  }
}

export function calculateNextDueDate(
  lastAdministered: string,
  frequencyMonths: number
): string {
  const lastDate = parseISO(lastAdministered)
  const nextDate = addMonths(lastDate, frequencyMonths)
  return nextDate.toISOString().split('T')[0]
}
