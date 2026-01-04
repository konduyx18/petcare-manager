import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Clock, TestTube } from 'lucide-react'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function NotificationPreferencesPage() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences()

  const handleSendTestNotification = async () => {
    console.log('🧪 Test notification button clicked')
    
    try {
      // Check if Notification API is supported
      if (!('Notification' in window)) {
        toast.error('Your browser does not support notifications')
        return
      }
      
      // Check current permission
      if (Notification.permission !== 'granted') {
        toast.error('Please enable notifications first')
        return
      }
      
      // Check if service worker is ready
      if (!('serviceWorker' in navigator)) {
        toast.error('Service workers are not supported')
        return
      }
      
      const registration = await navigator.serviceWorker.ready
      console.log('✅ Service worker is ready')
      
      // IMPORTANT: Use registration.showNotification() not new Notification()
      await registration.showNotification('🐾 Test Notification', {
        body: 'This is a test notification from PetCare Manager! Click me to open the app.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/pets',
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      })
      
      toast.success('✅ Test notification sent! Click it to test navigation.')
      console.log('✅ Test notification sent successfully')
    } catch (error) {
      console.error('❌ Test notification failed:', error)
      toast.error('Failed to send test notification: ' + (error as Error).message)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[300px]" />
      </div>
    )
  }

  if (!preferences) return null

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-gray-600">Control how and when you receive reminders</p>
      </div>

      <div className="space-y-6">
        {/* Channel Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled">Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications in your browser or on your device
                </p>
              </div>
              <Switch
                id="push-enabled"
                checked={preferences.push_enabled}
                onCheckedChange={(checked) =>
                  updatePreferences({ push_enabled: checked })
                }
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive reminders via email as a backup
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) =>
                  updatePreferences({ email_enabled: checked })
                }
                disabled={isUpdating}
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSendTestNotification}
                className="w-full sm:w-auto"
                disabled={false}
                type="button"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Type-Specific Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Types</CardTitle>
            <CardDescription>
              Choose which types of reminders you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Records */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="health-enabled" className="text-base font-medium">
                  Health Records
                </Label>
                <Switch
                  id="health-enabled"
                  checked={preferences.health_reminders_enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ health_reminders_enabled: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
              {preferences.health_reminders_enabled && (
                <div className="ml-4 flex items-center gap-2">
                  <Label htmlFor="health-days" className="text-sm text-gray-600">
                    Remind me
                  </Label>
                  <Select
                    value={preferences.health_reminder_days.toString()}
                    onValueChange={(value) =>
                      updatePreferences({ health_reminder_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">7 days before</SelectItem>
                      <SelectItem value="14">14 days before</SelectItem>
                      <SelectItem value="30">30 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Vaccinations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="vaccination-enabled" className="text-base font-medium">
                  Vaccinations
                </Label>
                <Switch
                  id="vaccination-enabled"
                  checked={preferences.vaccination_reminders_enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ vaccination_reminders_enabled: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
              {preferences.vaccination_reminders_enabled && (
                <div className="ml-4 flex items-center gap-2">
                  <Label htmlFor="vaccination-days" className="text-sm text-gray-600">
                    Remind me
                  </Label>
                  <Select
                    value={preferences.vaccination_reminder_days.toString()}
                    onValueChange={(value) =>
                      updatePreferences({ vaccination_reminder_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days before</SelectItem>
                      <SelectItem value="14">14 days before</SelectItem>
                      <SelectItem value="21">21 days before</SelectItem>
                      <SelectItem value="30">30 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Prescriptions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prescription-enabled" className="text-base font-medium">
                  Prescriptions & Refills
                </Label>
                <Switch
                  id="prescription-enabled"
                  checked={preferences.prescription_reminders_enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ prescription_reminders_enabled: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
              {preferences.prescription_reminders_enabled && (
                <div className="ml-4 flex items-center gap-2">
                  <Label htmlFor="prescription-days" className="text-sm text-gray-600">
                    Remind me
                  </Label>
                  <Select
                    value={preferences.prescription_reminder_days.toString()}
                    onValueChange={(value) =>
                      updatePreferences({ prescription_reminder_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="5">5 days before</SelectItem>
                      <SelectItem value="7">7 days before</SelectItem>
                      <SelectItem value="14">14 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Supplies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="supply-enabled" className="text-base font-medium">
                  Supply Re-orders
                </Label>
                <Switch
                  id="supply-enabled"
                  checked={preferences.supply_reminders_enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ supply_reminders_enabled: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
              {preferences.supply_reminders_enabled && (
                <div className="ml-4 flex items-center gap-2">
                  <Label htmlFor="supply-days" className="text-sm text-gray-600">
                    Remind me
                  </Label>
                  <Select
                    value={preferences.supply_reminder_days.toString()}
                    onValueChange={(value) =>
                      updatePreferences({ supply_reminder_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="5">5 days before</SelectItem>
                      <SelectItem value="7">7 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-700" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable Quiet Hours Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="quiet-hours-enabled" className="text-base font-medium cursor-pointer">
                  Enable Quiet Hours
                </Label>
                <p className="text-sm text-gray-500">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet-hours-enabled"
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => {
                  console.log('Quiet hours toggle clicked:', checked)
                  updatePreferences({ quiet_hours_enabled: checked })
                }}
                disabled={isUpdating}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            {/* Time Pickers (only show when enabled) */}
            {preferences.quiet_hours_enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Start Time
                    </Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.quiet_hours_start?.substring(0, 5) || '22:00'}
                      onChange={(e) => {
                        const newTime = e.target.value + ':00'
                        updatePreferences({ quiet_hours_start: newTime })
                      }}
                      className="text-base"
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      End Time
                    </Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.quiet_hours_end?.substring(0, 5) || '08:00'}
                      onChange={(e) => {
                        const newTime = e.target.value + ':00'
                        updatePreferences({ quiet_hours_end: newTime })
                      }}
                      className="text-base"
                    />
                  </div>
                </div>

                {/* Summary Box */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Notifications will be paused from{' '}
                      <strong>{preferences.quiet_hours_start?.substring(0, 5) || '22:00'}</strong> to{' '}
                      <strong>{preferences.quiet_hours_end?.substring(0, 5) || '08:00'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
