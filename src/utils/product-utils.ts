/**
 * Get Tailwind CSS classes for category badge styling
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: 'bg-blue-100 text-blue-800 border-blue-200',
    Medication: 'bg-red-100 text-red-800 border-red-200',
    Treats: 'bg-orange-100 text-orange-800 border-orange-200',
    Grooming: 'bg-purple-100 text-purple-800 border-purple-200',
    Toys: 'bg-green-100 text-green-800 border-green-200',
    Supplements: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[category] || colors.Other
}

/**
 * Get emoji for pet type
 */
export function getPetTypeEmoji(petType: string): string {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    both: '🐾',
  }
  return emojis[petType] || '🐾'
}

/**
 * Get button styling classes for affiliate store
 */
export function getStoreButtonClass(store: string): string {
  const classes: Record<string, string> = {
    chewy: 'bg-blue-600 hover:bg-blue-700 text-white',
    amazon: 'bg-orange-600 hover:bg-orange-700 text-white',
    petco: 'bg-red-600 hover:bg-red-700 text-white',
  }
  return classes[store] || 'bg-gray-600 hover:bg-gray-700 text-white'
}

/**
 * Get store display name
 */
export function getStoreName(store: string): string {
  const names: Record<string, string> = {
    chewy: 'Chewy',
    amazon: 'Amazon',
    petco: 'Petco',
  }
  return names[store] || store
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
