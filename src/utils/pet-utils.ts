import { differenceInDays } from 'date-fns'
import type { HealthRecord } from '@/hooks/useHealthRecords'

export function calculateAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return 'Unknown age'
  
  const birth = new Date(dateOfBirth)
  const today = new Date()
  
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  if (years === 0 && months === 0) {
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Born today! 🎉'
    if (days === 1) return '1 day old'
    return `${days} days old`
  }
  
  if (years === 0) {
    return months === 1 ? '1 month old' : `${months} months old`
  }
  
  if (months === 0) {
    return years === 1 ? '1 year old' : `${years} years old`
  }
  
  const yearText = years === 1 ? '1 year' : `${years} years`
  const monthText = months === 1 ? '1 month' : `${months} months`
  return `${yearText}, ${monthText}`
}

export function getSpeciesBadgeColor(species: string): string {
  const colors = {
    dog: 'from-green-400 to-emerald-500',
    cat: 'from-orange-400 to-amber-500',
    rabbit: 'from-pink-400 to-rose-500',
    bird: 'from-sky-400 to-blue-500',
    other: 'from-purple-400 to-violet-500',
  }
  return colors[species as keyof typeof colors] || colors.other
}

export function getSpeciesEmoji(species: string): string {
  const emojis = {
    dog: '🐕',
    cat: '🐱',
    rabbit: '🐰',
    bird: '🐦',
    other: '✨',
  }
  return emojis[species as keyof typeof emojis] || emojis.other
}

// Get next vaccine due date
export function getNextVaccineDate(healthRecords: HealthRecord[]): Date | null {
  const vaccinations = healthRecords.filter(
    r => r.record_type === 'vaccination' && r.next_due_date
  )

  if (vaccinations.length === 0) return null

  // Get future vaccinations only
  const futureVaccinations = vaccinations.filter(
    v => new Date(v.next_due_date!) > new Date()
  )

  if (futureVaccinations.length === 0) return null

  // Sort by next_due_date ascending
  const sorted = futureVaccinations.sort(
    (a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime()
  )

  return new Date(sorted[0].next_due_date!)
}

// Get health record count by type
export function getHealthRecordCount(records: HealthRecord[]) {
  return {
    vaccinations: records.filter(r => r.record_type === 'vaccination').length,
    vet_visits: records.filter(r => r.record_type === 'vet_visit').length,
    prescriptions: records.filter(r => r.record_type === 'prescription').length,
    procedures: records.filter(r => r.record_type === 'procedure').length,
  }
}

// Get last vet visit with "X days ago" format
export function getLastVetVisit(records: HealthRecord[]): string {
  const vetVisits = records
    .filter(r => r.record_type === 'vet_visit')
    .sort((a, b) => new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime())

  if (vetVisits.length === 0) return 'Never'

  const lastVisit = new Date(vetVisits[0].date_administered)
  const daysAgo = differenceInDays(new Date(), lastVisit)

  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 30) {
    const weeks = Math.floor(daysAgo / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }

  const months = Math.floor(daysAgo / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

// Format pet info string
export function formatPetInfo(pet: any): string {
  const parts = []

  if (pet.breed) parts.push(pet.breed)
  if (pet.date_of_birth) parts.push(calculateAge(pet.date_of_birth))
  if (pet.weight_lbs) parts.push(`${pet.weight_lbs} lbs`)

  return parts.join(' • ')
}
