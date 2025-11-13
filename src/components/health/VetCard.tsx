import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTogglePrimaryVet, type Vet } from '@/hooks/useVets'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Edit, 
  Trash2, 
  Star,
  Building2,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface VetCardProps {
  vet: Vet
  onEdit: () => void
  onDelete: () => void
}

export function VetCard({ vet, onEdit, onDelete }: VetCardProps) {
  const togglePrimary = useTogglePrimaryVet()

  const handleTogglePrimary = async () => {
    try {
      await togglePrimary.mutateAsync({
        id: vet.id,
        isPrimary: !vet.is_primary,
      })
      toast.success(
        vet.is_primary ? 'Removed as primary vet' : 'Set as primary vet',
        {
          description: vet.clinic_name,
        }
      )
    } catch (error) {
      console.error('Error toggling primary vet:', error)
      toast.error('Failed to update primary vet')
    }
  }

  const handleCall = () => {
    if (vet.phone) {
      window.location.href = `tel:${vet.phone}`
    }
  }

  const handleEmail = () => {
    if (vet.email) {
      window.location.href = `mailto:${vet.email}`
    }
  }

  const handleDirections = () => {
    if (vet.address) {
      const encodedAddress = encodeURIComponent(vet.address)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    }
  }

  const handleWebsite = () => {
    if (vet.website) {
      window.open(vet.website, '_blank')
    }
  }

  return (
    <Card className={`transition-all hover:shadow-lg ${vet.is_primary ? 'border-2 border-yellow-400 bg-yellow-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">{vet.clinic_name}</h3>
            </div>
            
            {vet.vet_name && (
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <User className="h-4 w-4" />
                <p className="text-sm">{vet.vet_name}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {vet.is_primary && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Primary
              </Badge>
            )}
            {vet.usage_count !== undefined && vet.usage_count > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Used {vet.usage_count}x
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {vet.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{vet.phone}</span>
            </div>
          )}

          {vet.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{vet.email}</span>
            </div>
          )}

          {vet.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{vet.address}</span>
            </div>
          )}

          {vet.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="truncate">{vet.website}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {vet.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 italic line-clamp-2">{vet.notes}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {vet.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCall}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}

          {vet.email && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEmail}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}

          {vet.address && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDirections}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Directions
            </Button>
          )}

          {vet.website && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleWebsite}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Website
            </Button>
          )}
        </div>

        {/* Management Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTogglePrimary}
            disabled={togglePrimary.isPending}
            className={`flex-1 gap-2 ${vet.is_primary ? 'text-yellow-600 hover:text-yellow-700' : ''}`}
          >
            <Star className={`h-4 w-4 ${vet.is_primary ? 'fill-current' : ''}`} />
            {vet.is_primary ? 'Primary' : 'Set Primary'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="flex-1 gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
