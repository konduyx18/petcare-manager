import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    })

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push:', error)
    return null
  }
}

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  console.log('🔔 Starting savePushSubscription...')
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  console.log('✅ User authenticated:', user.id)

  const subscriptionObject = subscription.toJSON()
  const endpoint = subscriptionObject.endpoint

  if (!endpoint) {
    throw new Error('Subscription endpoint is missing')
  }

  console.log('🔍 Checking for existing subscription...')

  // Fetch ALL user devices (not filtered by endpoint in SQL)
  // @ts-ignore - user_devices table exists but not in generated types
  const { data: allDevices, error: selectError } = await supabase
    .from('user_devices')
    .select('id, subscription')
    .eq('user_id', user.id)

  if (selectError) {
    console.error('❌ Error fetching devices:', selectError)
    throw selectError
  }

  // Filter in JavaScript to find matching endpoint
  // @ts-ignore
  const existing = allDevices?.find(device => {
    // @ts-ignore
    const deviceEndpoint = device.subscription?.endpoint
    return deviceEndpoint === endpoint
  })

  if (existing) {
    // @ts-ignore
    console.log('📝 Updating existing subscription:', existing.id)
    // Update existing subscription
    // @ts-ignore
    const { error } = await supabase
      .from('user_devices')
      // @ts-ignore
      .update({
        subscription: subscriptionObject,
        device_name: navigator.userAgent,
      })
      // @ts-ignore
      .eq('id', existing.id)

    if (error) {
      console.error('❌ Update error:', error)
      throw error
    }
    console.log('✅ Subscription updated successfully')
  } else {
    console.log('➕ Inserting new subscription')
    // Insert new subscription
    // @ts-ignore
    const { error } = await supabase
      .from('user_devices')
      // @ts-ignore
      .insert({
        user_id: user.id,
        subscription: subscriptionObject,
        device_name: navigator.userAgent,
      })

    if (error) {
      console.error('❌ Insert error:', error)
      throw error
    }
    console.log('✅ Subscription inserted successfully')
  }

  console.log('🎉 Push subscription saved successfully')
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()

      // Remove from database
      const subscriptionObject = subscription.toJSON()
      const endpoint = subscriptionObject.endpoint
      const { data: { user } } = await supabase.auth.getUser()

      if (user && endpoint) {
        // Fetch all devices and find the one to delete
        // @ts-ignore
        const { data: allDevices } = await supabase
          .from('user_devices')
          .select('id, subscription')
          .eq('user_id', user.id)

        // @ts-ignore
        const deviceToDelete = allDevices?.find(device => 
          // @ts-ignore
          device.subscription?.endpoint === endpoint
        )

        if (deviceToDelete) {
          // @ts-ignore
          await supabase
            .from('user_devices')
            .delete()
            // @ts-ignore
            .eq('id', deviceToDelete.id)
        }
      }
    }
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
  }
}

export async function getSubscriptionStatus(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    return false
  }
}
