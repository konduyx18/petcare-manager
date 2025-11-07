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
