// Import Deno standard library modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('🔔 Health Reminders Function Started')

serve(async (req) => {
  try {
    // Get environment variables (set by Supabase)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    // Initialize Supabase client with SERVICE ROLE key (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('✅ Supabase client initialized')

    // Get all users with notification preferences enabled
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, health_reminder_days, vaccination_reminder_days, push_enabled, health_reminders_enabled, vaccination_reminders_enabled, quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .eq('push_enabled', true)

    if (prefError) {
      console.error('❌ Error fetching preferences:', prefError)
      throw prefError
    }

    console.log(`📋 Found ${preferences?.length || 0} users with notifications enabled`)

    let totalNotificationsSent = 0
    const currentTime = new Date()

    // For each user, check their health records
    for (const pref of preferences || []) {
      try {
        // Skip if in quiet hours
        if (pref.quiet_hours_enabled && isInQuietHours(pref.quiet_hours_start, pref.quiet_hours_end, currentTime)) {
          console.log(`😴 User ${pref.user_id} in quiet hours, skipping`)
          continue
        }
        
        // Calculate target dates based on user's preferences
        const healthReminderDays = pref.health_reminder_days || 14
        const vaccineReminderDays = pref.vaccination_reminder_days || 14
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const healthTargetDate = new Date(today)
        healthTargetDate.setDate(today.getDate() + healthReminderDays)
        
        const vaccineTargetDate = new Date(today)
        vaccineTargetDate.setDate(today.getDate() + vaccineReminderDays)
        
        console.log(`🔍 Checking user ${pref.user_id}`)
        console.log(`  Health reminder window: ${healthReminderDays} days`)
        console.log(`  Vaccine reminder window: ${vaccineReminderDays} days`)
        
        // Find upcoming health records
        const { data: healthRecords, error: healthError } = await supabase
          .from('health_records')
          .select(`
            id,
            record_type,
            title,
            next_due_date,
            date_administered,
            pet_id,
            pets!inner (
              id,
              name,
              user_id
            )
          `)
          .eq('pets.user_id', pref.user_id)
          .not('next_due_date', 'is', null)
          .gte('next_due_date', today.toISOString().split('T')[0])
        
        if (healthError) {
          console.error(`❌ Error fetching records for user ${pref.user_id}:`, healthError)
          continue
        }
        
        if (!healthRecords || healthRecords.length === 0) {
          console.log(`✅ No upcoming records for user ${pref.user_id}`)
          continue
        }
        
        console.log(`📌 Found ${healthRecords.length} total upcoming records`)
        
        // Filter records based on preferences and timing
        const dueRecords = healthRecords.filter(record => {
          const dueDate = new Date(record.next_due_date!)
          dueDate.setHours(0, 0, 0, 0)
          
          // Check if user wants this type of reminder
          if (record.record_type === 'vaccination') {
            if (!pref.vaccination_reminders_enabled) return false
            return dueDate <= vaccineTargetDate
          } else {
            if (!pref.health_reminders_enabled) return false
            return dueDate <= healthTargetDate
          }
        })
        
        if (dueRecords.length === 0) {
          console.log(`⏭️ No records within reminder windows or all filtered out by preferences`)
          continue
        }
        
        console.log(`🎯 ${dueRecords.length} records match user's reminder preferences`)
        
        // Get user's devices for push notifications
        const { data: devices, error: devicesError } = await supabase
          .from('user_devices')
          .select('subscription')
          .eq('user_id', pref.user_id)
        
        if (devicesError) {
          console.error(`❌ Error fetching devices for user ${pref.user_id}:`, devicesError)
          continue
        }
        
        if (!devices || devices.length === 0) {
          console.log(`📱 No devices found for user ${pref.user_id}`)
          continue
        }
        
        console.log(`📱 Found ${devices.length} device(s) for user ${pref.user_id}`)
        
        // Send notification for each due record
        for (const record of dueRecords) {
          const dueDate = new Date(record.next_due_date!)
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          const petName = record.pets?.name || 'Your pet'
          const recordTitle = record.title
          const daysText = daysUntilDue === 0 ? 'TODAY' : 
                          daysUntilDue === 1 ? 'tomorrow' : 
                          `in ${daysUntilDue} days` 
          
          const notification = {
            title: `${record.record_type === 'vaccination' ? '💉' : '🏥'} ${petName} Reminder`,
            body: `${recordTitle} is due ${daysText}!`,
            url: `/health?pet=${record.pet_id}`,
            tag: `health-${record.id}`,
            recordId: record.id,
          }
          
          // Send to each device
          for (const device of devices) {
            try {
              await sendPushNotification(device.subscription, notification)
              totalNotificationsSent++
              console.log(`✅ Sent notification to device for ${petName}`)
            } catch (error) {
              console.error(`❌ Failed to send notification:`, error.message)
            }
          }
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${pref.user_id}:`, userError)
        // Continue with next user
      }
    }

    const result = {
      success: true,
      usersChecked: preferences?.length || 0,
      notificationsSent: totalNotificationsSent,
      timestamp: new Date().toISOString(),
    }

    console.log('🎉 Function completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// Helper function to check if current time is in quiet hours
function isInQuietHours(startTime: string | null, endTime: string | null, currentTime: Date): boolean {
  if (!startTime || !endTime) return false
  
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const start = startHour * 60 + startMin
  const end = endHour * 60 + endMin
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentMinutes >= start || currentMinutes <= end
  }
  
  return currentMinutes >= start && currentMinutes <= end
}

// Helper function to send push notification using web-push
async function sendPushNotification(subscription: any, payload: any) {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys not configured')
  }
  
  // Import web-push from esm.sh (Deno compatible)
  const webpush = await import('https://esm.sh/web-push@3.6.6')
  
  webpush.setVapidDetails(
    'mailto:yelizkonduk@gmail.com',
    vapidPublicKey,
    vapidPrivateKey
  )
  
  await webpush.sendNotification(subscription, JSON.stringify(payload))
}
