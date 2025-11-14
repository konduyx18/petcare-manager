import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function PushNotificationTest() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe, isSupported } = usePushNotifications()

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Not supported on this device</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Push Notifications
          {isSubscribed ? (
            <Badge variant="outline" className="bg-green-50">
              <Check className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50">
              <X className="h-3 w-3 mr-1" />
              Disabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Get reminded about upcoming vaccines, vet visits, and supply orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <strong>Permission:</strong> {permission}
        </div>

        {isSubscribed ? (
          <Button
            variant="outline"
            onClick={unsubscribe}
            disabled={isLoading}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <BellOff className="mr-2 h-4 w-4" />
            {isLoading ? 'Disabling...' : 'Disable Notifications'}
          </Button>
        ) : (
          <Button
            onClick={subscribe}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
