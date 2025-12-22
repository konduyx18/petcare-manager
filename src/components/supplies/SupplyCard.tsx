import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  ShoppingCart, 
  ExternalLink, 
  Edit, 
  Trash,
  AlertCircle 
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useMarkAsOrdered, useDeleteSupply, type SupplySchedule } from '@/hooks/useSupplySchedules'
import { useTrackAffiliateClick } from '@/hooks/useAffiliateTracking'
import { 
  getCategoryColor, 
  formatFrequency, 
  formatCountdownText,
  getProgressBarColor,
  getCountdownBadgeStyle
} from '@/utils/supply-utils'
import { format } from 'date-fns'
import SupplyForm from '@/components/supplies/SupplyForm'

interface SupplyCardProps {
  supply: Omit<SupplySchedule, 'updated_at'> & {
    updated_at?: string
    pets?: {
      id: string
      name: string
      photo_url: string | null
    }
  }
  onEdit?: (supply: SupplySchedule) => void
  onDelete?: (id: string) => void
}

export default function SupplyCard({ supply, onEdit, onDelete }: SupplyCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const markAsOrdered = useMarkAsOrdered()
  const deleteSupply = useDeleteSupply()
  const trackClick = useTrackAffiliateClick()

  const handleMarkAsOrdered = () => {
    markAsOrdered.mutate({
      id: supply.id,
      frequency_days: supply.frequency_days,
      product_name: supply.product_name
    })
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(supply.id)
    } else {
      deleteSupply.mutate({
        id: supply.id,
        product_name: supply.product_name
      })
    }
    setShowDeleteDialog(false)
  }

  const handleAffiliateButtonClick = (
    url: string, 
    affiliate: 'chewy' | 'amazon' | 'petco'
  ) => {
    trackClick.mutate({
      supply_schedule_id: supply.id,
      affiliate_name: affiliate,
      affiliate_url: url
    })
  }

  const petName = supply.pets?.name || 'Unknown Pet'
  const petInitial = petName.charAt(0).toUpperCase()
  const countdownText = formatCountdownText(supply.daysUntilReminder || 0)
  const statusBadgeStyle = getCountdownBadgeStyle(supply.reminderStatus || 'upcoming')
  const progressBarColor = getProgressBarColor(supply.reminderStatus || 'upcoming')

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Pet Info Header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={supply.pets?.photo_url || undefined} alt={petName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {petInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{petName}</p>
            </div>
            <Badge className={`${getCategoryColor(supply.category)} border`}>
              {supply.category}
            </Badge>
          </div>

          {/* Product Name */}
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
              {supply.product_name}
            </h3>
          </div>

          {/* Countdown Badge */}
          <div className="flex items-center gap-2">
            <Badge className={`${statusBadgeStyle} border px-3 py-1 text-sm font-semibold`}>
              {supply.reminderStatus === 'overdue' && (
                <AlertCircle className="h-4 w-4 mr-1" />
              )}
              {countdownText}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Supply cycle progress</span>
              <span>{supply.progressPercentage}%</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full ${progressBarColor} transition-all duration-500 rounded-full`}
                style={{ width: `${supply.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Last Ordered</p>
                <p className="font-medium text-foreground">
                  {format(new Date(supply.last_purchase_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Frequency</p>
                <p className="font-medium text-foreground">
                  {formatFrequency(supply.frequency_days)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Mark as Ordered Button */}
            <Button 
              onClick={handleMarkAsOrdered}
              disabled={markAsOrdered.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              aria-label={`Mark ${supply.product_name} as ordered`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {markAsOrdered.isPending ? 'Updating...' : 'Mark as Ordered'}
            </Button>

            {/* Affiliate Link Buttons */}
            {(supply.affiliate_links?.chewy || supply.affiliate_links?.amazon || supply.affiliate_links?.petco) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {supply.affiliate_links.chewy && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAffiliateButtonClick(supply.affiliate_links.chewy!, 'chewy')}
                    className="text-xs"
                    aria-label={`Buy ${supply.product_name} on Chewy`}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Chewy
                  </Button>
                )}
                {supply.affiliate_links.amazon && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAffiliateButtonClick(supply.affiliate_links.amazon!, 'amazon')}
                    className="text-xs"
                    aria-label={`Buy ${supply.product_name} on Amazon`}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Amazon
                  </Button>
                )}
                {supply.affiliate_links.petco && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAffiliateButtonClick(supply.affiliate_links.petco!, 'petco')}
                    className="text-xs"
                    aria-label={`Buy ${supply.product_name} on Petco`}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Petco
                  </Button>
                )}
              </div>
            )}

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="flex-1"
                aria-label={`Edit ${supply.product_name}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label={`Delete ${supply.product_name}`}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white"
          onInteractOutside={(e) => {
            // Prevent closing when clicking outside
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Edit Supply</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Update supply details and reorder schedule
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <SupplyForm 
            initialData={supply as SupplySchedule} 
            onSuccess={() => {
              setShowEditDialog(false)
              onEdit?.(supply as SupplySchedule)
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Delete Supply?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete <span className="font-medium">"{supply.product_name}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 text-gray-900 hover:bg-gray-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
