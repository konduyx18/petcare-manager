import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { calculateAge, getSpeciesBadgeColor, getSpeciesEmoji } from '@/utils/pet-utils'
import { EditPetDialog } from './EditPetDialog'
import { DeletePetDialog } from './DeletePetDialog'

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
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    navigate({ to: `/pets/${pet.id}` })
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteOpen(true)
  }

  const badgeColor = getSpeciesBadgeColor(pet.species)
  const speciesEmoji = getSpeciesEmoji(pet.species)
  const age = calculateAge(pet.date_of_birth)

  return (
    <>
      <Card
        className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-green-300 group"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pet Photo */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {(pet.thumbnail_url || pet.photo_url) ? (
            <img
              src={pet.thumbnail_url || pet.photo_url || ''}
              alt={pet.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl">{speciesEmoji}</span>
            </div>
          )}

          {/* Species Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r ${badgeColor} text-white text-sm font-semibold shadow-lg flex items-center gap-1`}>
            <span>{speciesEmoji}</span>
            <span className="capitalize">{pet.species}</span>
          </div>

          {/* Action Buttons - Only visible on hover */}
          <div
            className={`absolute top-3 left-3 flex gap-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Pet Info */}
        <div className="p-4 space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="text-gray-400">🎂</span>
              <span>{age}</span>
            </p>
            
            {pet.breed && (
              <p className="flex items-center gap-2">
                <span className="text-gray-400">🐾</span>
                <span>{pet.breed}</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <EditPetDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        pet={pet}
      />

      {/* Delete Dialog */}
      <DeletePetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pet={pet}
      />
    </>
  )
}
