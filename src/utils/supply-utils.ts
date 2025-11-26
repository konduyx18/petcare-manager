/**
 * Supply Tracking Utility Functions
 * Handles date calculations, status determination, and formatting for supply schedules
 */

/**
 * Calculate the next reminder date based on last purchase and frequency
 */
export function calculateNextReminderDate(lastPurchase: Date, frequencyDays: number): Date {
  const nextDate = new Date(lastPurchase)
  nextDate.setDate(nextDate.getDate() + frequencyDays)
  return nextDate
}

/**
 * Get days until reminder (negative if overdue)
 */
export function getDaysUntilReminder(nextReminderDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const reminder = new Date(nextReminderDate)
  reminder.setHours(0, 0, 0, 0)
  
  const diffTime = reminder.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Determine reminder status based on days until due
 */
export function getReminderStatus(daysUntil: number): 'overdue' | 'urgent' | 'soon' | 'upcoming' {
  if (daysUntil < 0) return 'overdue'
  if (daysUntil <= 3) return 'urgent'
  if (daysUntil <= 7) return 'soon'
  return 'upcoming'
}

/**
 * Calculate progress percentage through the supply cycle
 */
export function getProgressPercentage(lastPurchase: Date, nextReminder: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const start = new Date(lastPurchase)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(nextReminder)
  end.setHours(0, 0, 0, 0)
  
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  
  if (totalDays <= 0) return 100
  
  const percentage = (elapsedDays / totalDays) * 100
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(percentage)))
}

/**
 * Format frequency days into human-readable text
 */
export function formatFrequency(frequencyDays: number): string {
  if (frequencyDays === 7) return 'Every week'
  if (frequencyDays === 14) return 'Every 2 weeks'
  if (frequencyDays === 21) return 'Every 3 weeks'
  if (frequencyDays === 30) return 'Every month'
  if (frequencyDays === 60) return 'Every 2 months'
  if (frequencyDays === 90) return 'Every 3 months'
  
  // For other values, show in weeks if divisible by 7
  if (frequencyDays % 7 === 0) {
    const weeks = frequencyDays / 7
    return `Every ${weeks} weeks`
  }
  
  // For other values, show in months if divisible by 30
  if (frequencyDays % 30 === 0) {
    const months = frequencyDays / 30
    return `Every ${months} months`
  }
  
  return `Every ${frequencyDays} days`
}

/**
 * Get Tailwind CSS classes for category badges
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: 'bg-blue-100 text-blue-800 border-blue-200',
    Medication: 'bg-red-100 text-red-800 border-red-200',
    Treats: 'bg-orange-100 text-orange-800 border-orange-200',
    Grooming: 'bg-purple-100 text-purple-800 border-purple-200',
    Toys: 'bg-green-100 text-green-800 border-green-200',
    Supplements: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  return colors[category] || colors.Other
}

/**
 * Get progress bar color based on status
 */
export function getProgressBarColor(status: 'overdue' | 'urgent' | 'soon' | 'upcoming'): string {
  const colors = {
    overdue: 'bg-gradient-to-r from-red-500 to-red-600',
    urgent: 'bg-gradient-to-r from-orange-500 to-orange-600',
    soon: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    upcoming: 'bg-gradient-to-r from-green-500 to-green-600'
  }
  
  return colors[status]
}

/**
 * Get countdown badge styling based on status
 */
export function getCountdownBadgeStyle(status: 'overdue' | 'urgent' | 'soon' | 'upcoming'): string {
  const styles = {
    overdue: 'bg-red-600 text-white border-red-700',
    urgent: 'bg-red-500 text-white border-red-600',
    soon: 'bg-orange-500 text-white border-orange-600',
    upcoming: 'bg-green-500 text-white border-green-600'
  }
  
  return styles[status]
}

/**
 * Format countdown text based on days until reminder
 */
export function formatCountdownText(daysUntil: number): string {
  if (daysUntil === 0) return 'Due TODAY'
  if (daysUntil < 0) return `OVERDUE by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`
  if (daysUntil === 1) return 'Order tomorrow'
  return `Order in ${daysUntil} days`
}
