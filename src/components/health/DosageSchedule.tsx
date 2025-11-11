import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMarkDoseAsGiven, useSkipDose, usePrescriptionDoses } from '@/hooks/usePrescriptions'
import { generateDoseSchedule, getNextDoseIn } from '@/utils/prescription-utils'
import { format, isToday, isPast } from 'date-fns'
import { Clock, Check, X, AlertCircle, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { HealthRecord } from '@/hooks/useHealthRecords'

interface DosageScheduleProps {
  prescription: HealthRecord
}

export function DosageSchedule({ prescription }: DosageScheduleProps) {
  const details = prescription.prescription_details as any
  const { data: doses } = usePrescriptionDoses(prescription.id)
  
  const [markDialogOpen, setMarkDialogOpen] = useState(false)
  const [skipDialogOpen, setSkipDialogOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [notes, setNotes] = useState('')
  const [skipReason, setSkipReason] = useState('')

  const markAsGiven = useMarkDoseAsGiven()
  const skipDose = useSkipDose()

  if (!details?.frequency || !details?.start_date) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">No dosage schedule available</p>
        </CardContent>
      </Card>
    )
  }

  const schedule = generateDoseSchedule({
    start_date: details.start_date,
    end_date: details.end_date || null,
    frequency: details.frequency,
  })

  // Get next upcoming dose
  const nextDose = schedule.find(s => !s.isPast)
  const upcomingDoses = schedule.filter(s => !s.isPast).slice(0, 5)
  const recentDoses = schedule.filter(s => s.isPast).slice(0, 5)

  const handleMarkAsGiven = async () => {
    if (!selectedTime) return

    try {
      await markAsGiven.mutateAsync({
        prescriptionId: prescription.id,
        scheduledTime: selectedTime.toISOString(),
        notes: notes || undefined,
      })

      toast.success('✅ Dose marked as given!', {
        description: format(selectedTime, 'MMM dd, yyyy h:mm a')
      })

      setMarkDialogOpen(false)
      setNotes('')
      setSelectedTime(null)
    } catch (error) {
      toast.error('Failed to mark dose as given')
    }
  }

  const handleSkipDose = async () => {
    if (!selectedTime || !skipReason.trim()) {
      toast.error('Please provide a reason for skipping')
      return
    }

    try {
      await skipDose.mutateAsync({
        prescriptionId: prescription.id,
        scheduledTime: selectedTime.toISOString(),
        reason: skipReason,
      })

      toast.success('Dose skipped', {
        description: format(selectedTime, 'MMM dd, yyyy h:mm a')
      })

      setSkipDialogOpen(false)
      setSkipReason('')
      setSelectedTime(null)
    } catch (error) {
      toast.error('Failed to skip dose')
    }
  }

  const getDoseStatus = (scheduledTime: Date) => {
    const dose = doses?.find(d => 
      new Date(d.scheduled_time).getTime() === scheduledTime.getTime()
    )

    if (dose?.given_time) {
      return { type: 'given', label: 'Given', color: 'bg-green-100 text-green-700' }
    }
    if (dose?.skipped) {
      return { type: 'skipped', label: 'Skipped', color: 'bg-gray-100 text-gray-700' }
    }

    const doseSchedule = schedule.find(s => s.time.getTime() === scheduledTime.getTime())
    if (doseSchedule?.isOverdue) {
      return { type: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' }
    }
    if (doseSchedule?.isPast) {
      return { type: 'missed', label: 'Missed', color: 'bg-orange-100 text-orange-700' }
    }

    return { type: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
  }

  // Helper functions for dose status checks
  const isDoseGiven = (scheduledTime: Date) => {
    const dose = doses?.find(d => 
      new Date(d.scheduled_time).getTime() === scheduledTime.getTime()
    )
    return !!dose?.given_time
  }

  const isDoseSkipped = (scheduledTime: Date) => {
    const dose = doses?.find(d => 
      new Date(d.scheduled_time).getTime() === scheduledTime.getTime()
    )
    return !!dose?.skipped
  }

  const isDoseOverdue = (scheduledTime: Date) => {
    return isPast(scheduledTime) && !isDoseGiven(scheduledTime) && !isDoseSkipped(scheduledTime)
  }

  return (
    <div className="space-y-4">
      {/* Next Dose Card */}
      {nextDose && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5" />
              Next Dose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {format(nextDose.time, 'h:mm a')}
                </p>
                <p className="text-sm text-blue-700">
                  {format(nextDose.time, 'EEEE, MMM dd, yyyy')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  In {getNextDoseIn(nextDose.time)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedTime(nextDose.time)
                    setMarkDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Given
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTime(nextDose.time)
                    setSkipDialogOpen(true)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Doses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Doses
          </CardTitle>
          <CardDescription>Next {upcomingDoses.length} scheduled doses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingDoses.map((dose, idx) => {
            const given = isDoseGiven(dose.time)
            const skipped = isDoseSkipped(dose.time)
            const overdue = !given && !skipped && isDoseOverdue(dose.time)

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  given ? 'bg-green-50 border-green-200' : ''
                } ${
                  skipped ? 'bg-gray-100 border-gray-300' : ''
                } ${
                  !given && !skipped && overdue ? 'bg-red-50 border-red-200' : ''
                } ${
                  !given && !skipped && !overdue ? 'bg-white border-gray-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {format(dose.time, 'h:mm a')}
                      </p>
                      {isToday(dose.time) && (
                        <Badge variant="secondary" className="text-xs">
                          Today
                        </Badge>
                      )}
                      {overdue && !given && !skipped && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                      {given && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Given
                        </Badge>
                      )}
                      {skipped && (
                        <Badge variant="secondary" className="bg-gray-400 text-white text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Skipped
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(dose.time, 'EEEE, MMM dd')}
                    </p>
                  </div>

                  {!given && !skipped && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTime(dose.time)
                          setMarkDialogOpen(true)
                        }}
                        disabled={markAsGiven.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Given
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTime(dose.time)
                          setSkipDialogOpen(true)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {upcomingDoses.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No upcoming doses scheduled
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Doses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Doses
          </CardTitle>
          <CardDescription>Last {recentDoses.length} doses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentDoses.map((dose, index) => {
            const status = getDoseStatus(dose.time)
            const doseRecord = doses?.find(d => 
              new Date(d.scheduled_time).getTime() === dose.time.getTime()
            )

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    status.type === 'given' ? 'bg-green-100' :
                    status.type === 'skipped' ? 'bg-gray-100' :
                    status.type === 'overdue' ? 'bg-red-100' :
                    'bg-orange-100'
                  }`}>
                    {status.type === 'given' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : status.type === 'skipped' ? (
                      <X className="h-4 w-4 text-gray-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {format(dose.time, 'h:mm a')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(dose.time, 'EEE, MMM dd')}
                    </p>
                    {doseRecord?.given_time && (
                      <p className="text-xs text-green-600">
                        Given at {format(new Date(doseRecord.given_time), 'h:mm a')}
                      </p>
                    )}
                    {doseRecord?.skip_reason && (
                      <p className="text-xs text-gray-600">
                        Reason: {doseRecord.skip_reason}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className={status.color}>
                  {status.label}
                </Badge>
              </div>
            )
          })}

          {recentDoses.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No recent doses
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mark as Given Dialog */}
      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Mark Dose as Given</DialogTitle>
            <DialogDescription>
              {selectedTime && format(selectedTime, 'EEEE, MMMM dd, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any observations or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setMarkDialogOpen(false)
                  setNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAsGiven}
                disabled={markAsGiven.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {markAsGiven.isPending ? 'Marking...' : 'Mark as Given'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Dose Dialog */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Skip Dose</DialogTitle>
            <DialogDescription>
              {selectedTime && format(selectedTime, 'EEEE, MMMM dd, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="skip-reason">Reason for skipping *</Label>
              <Textarea
                id="skip-reason"
                placeholder="e.g., Pet refused, Vet advised to skip"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSkipDialogOpen(false)
                  setSkipReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSkipDose}
                disabled={!skipReason.trim() || skipDose.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {skipDose.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skipping...
                  </>
                ) : (
                  'Skip Dose'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
