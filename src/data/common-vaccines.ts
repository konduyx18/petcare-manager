export interface CommonVaccine {
  name: string
  species: string[] // 'dog', 'cat', 'rabbit', etc.
  frequency: number // in months
  description: string
  category: 'core' | 'non-core'
}

export const commonVaccines: CommonVaccine[] = [
  // Dogs - Core
  {
    name: 'Rabies',
    species: ['dog'],
    frequency: 12, // Annual
    description: 'Required by law in most states',
    category: 'core'
  },
  {
    name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
    species: ['dog'],
    frequency: 36, // Every 3 years after initial series
    description: 'Core vaccine series',
    category: 'core'
  },
  {
    name: 'Bordetella (Kennel Cough)',
    species: ['dog'],
    frequency: 12,
    description: 'Recommended for dogs in boarding/daycare',
    category: 'non-core'
  },
  {
    name: 'Lyme Disease',
    species: ['dog'],
    frequency: 12,
    description: 'For dogs in tick-prone areas',
    category: 'non-core'
  },
  {
    name: 'Canine Influenza',
    species: ['dog'],
    frequency: 12,
    description: 'For social dogs',
    category: 'non-core'
  },
  {
    name: 'Leptospirosis',
    species: ['dog'],
    frequency: 12,
    description: 'For dogs exposed to wildlife/water',
    category: 'non-core'
  },

  // Cats - Core
  {
    name: 'Rabies',
    species: ['cat'],
    frequency: 12,
    description: 'Required by law in most states',
    category: 'core'
  },
  {
    name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
    species: ['cat'],
    frequency: 36,
    description: 'Core vaccine series',
    category: 'core'
  },
  {
    name: 'FeLV (Feline Leukemia)',
    species: ['cat'],
    frequency: 12,
    description: 'For cats that go outdoors',
    category: 'non-core'
  },

  // Rabbits
  {
    name: 'RHDV (Rabbit Hemorrhagic Disease)',
    species: ['rabbit'],
    frequency: 12,
    description: 'Important protection against deadly virus',
    category: 'core'
  },
  {
    name: 'Myxomatosis',
    species: ['rabbit'],
    frequency: 12,
    description: 'For outdoor rabbits',
    category: 'non-core'
  }
]

export function getVaccinesForSpecies(species: string): CommonVaccine[] {
  return commonVaccines.filter(v => v.species.includes(species.toLowerCase()))
}

export function getCoreVaccines(species: string): CommonVaccine[] {
  return commonVaccines.filter(v => 
    v.species.includes(species.toLowerCase()) && v.category === 'core'
  )
}
