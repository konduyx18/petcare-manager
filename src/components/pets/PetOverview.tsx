import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PawPrint, Scale, Barcode, Sparkles 
} from 'lucide-react'

interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
  breed: string | null
  date_of_birth: string | null
  weight_lbs: number | null
  microchip_number: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

interface PetOverviewProps {
  pet: Pet
}

export function PetOverview({ pet }: PetOverviewProps) {
  const infoSections = [
    {
      title: 'Basic Information',
      icon: PawPrint,
      items: [
        { label: 'Name', value: pet.name },
        { label: 'Species', value: pet.species, badge: true },
        { label: 'Breed', value: pet.breed || 'Not specified' },
      ]
    },
    {
      title: 'Physical Details',
      icon: Scale,
      items: [
        { label: 'Weight', value: pet.weight_lbs ? `${pet.weight_lbs} lbs` : 'Not recorded' },
        { label: 'Date of Birth', value: pet.date_of_birth || 'Not recorded' },
      ]
    },
    {
      title: 'Identification',
      icon: Barcode,
      items: [
        { label: 'Microchip Number', value: pet.microchip_number || 'Not registered' },
        { label: 'Pet ID', value: pet.id.slice(0, 8) + '...' },
      ]
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {infoSections.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.title} className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-green-600" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-600">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge variant="secondary" className="capitalize">
                      {item.value}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Notes/Additional Info Card */}
      <Card className="border-gray-200 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 italic">
            No additional notes yet. You can add custom notes in a future update!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
