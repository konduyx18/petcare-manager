import { useState, useEffect } from 'react'
import {
  requestNotificationPermission,
  subscribeToPush,
  savePushSubscription,
  unsubscribeFromPush,
  getSubscriptionStatus,
} from '@/lib/push-notifications'
import { toast } from 'sonner'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check initial state
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    getSubscriptionStatus().then(setIsSubscribed)
  }, [])

  const subscribe = async () => {
    setIsLoading(true)
    try {
      // Request permission
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        toast.error('Notification permission denied')
        return
      }

      // Subscribe to push
      const subscription = await subscribeToPush()
      if (!subscription) {
        toast.error('Failed to subscribe to push notifications')
        return
      }

      // Save to database
      await savePushSubscription(subscription)
      setIsSubscribed(true)

      toast.success('Push notifications enabled!')

      // Send test notification
      new Notification('PetCare Notifications Enabled', {
        body: "You'll now receive reminders for your pets!",
        icon: '/icon-192.png',
      })
    } catch (error) {
      console.error('Subscribe error:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      await unsubscribeFromPush()
      setIsSubscribed(false)
      toast.success('Push notifications disabled')
    } catch (error) {
      console.error('Unsubscribe error:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
  }
}
