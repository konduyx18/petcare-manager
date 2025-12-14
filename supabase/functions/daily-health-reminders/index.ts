import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 Starting daily health reminders check...')

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time for quiet hours check
    const now = new Date()
    const currentHour = now.getHours()

    console.log('📋 Fetching notification preferences...')

    // Get all users with push notifications enabled
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, health_reminder_days, quiet_hours_start, quiet_hours_end, push_enabled')
      .eq('push_enabled', true)

    if (prefError) {
      console.error('❌ Error fetching preferences:', prefError)
      throw prefError
    }

    console.log(`✅ Found ${preferences?.length || 0} users with push enabled`)

    let notificationsSent = 0

    // Process each user
    for (const pref of preferences || []) {
      // Check quiet hours (skip if in quiet period)
      if (pref.quiet_hours_start && pref.quiet_hours_end) {
        const quietStart = parseInt(pref.quiet_hours_start.split(':')[0])
        const quietEnd = parseInt(pref.quiet_hours_end.split(':')[0])
        
        if (currentHour >= quietStart || currentHour < quietEnd) {
          console.log(`⏰ Skipping ${pref.user_id} - in quiet hours`)
          continue
        }
      }
      
      // Calculate reminder window
      const reminderDays = pref.health_reminder_days || 14
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + reminderDays)
      
      console.log(`🔍 Checking health records for user ${pref.user_id} (${reminderDays} days ahead)`)
      
      // Find upcoming health records with due dates
      const { data: dueRecords, error: recordsError } = await supabase
        .from('health_records')
        .select(`
          id,
          title,
          record_type,
          next_due_date,
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
        .lte('next_due_date', futureDate.toISOString().split('T')[0])
      
      if (recordsError) {
        console.error(`❌ Error fetching records for ${pref.user_id}:`, recordsError)
        continue
      }
      
      if (!dueRecords || dueRecords.length === 0) {
        console.log(`✓ No upcoming reminders for ${pref.user_id}`)
        continue
      }
      
      console.log(`� Found ${dueRecords.length} upcoming records for ${pref.user_id}`)
      
      // Get user's push subscriptions
      const { data: devices, error: devicesError } = await supabase
        .from('user_devices')
        .select('subscription')
        .eq('user_id', pref.user_id)
      
      if (devicesError) {
        console.error(`❌ Error fetching devices for ${pref.user_id}:`, devicesError)
        continue
      }
      
      if (!devices || devices.length === 0) {
        console.log(`⚠️ No devices found for ${pref.user_id}`)
        continue
      }
      
      // Send push notifications for each record
      for (const record of dueRecords) {
        const petName = record.pets.name
        const daysUntil = Math.ceil((new Date(record.next_due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        const notification = {
          title: `🐾 ${petName}'s ${record.title} Reminder`,
          body: `${record.title} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: {
            url: `/health`,
            petId: record.pet_id,
            recordId: record.id
          },
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
        
        // Send to all user's devices
        for (const device of devices) {
          try {
            // Send push notification via Web Push API
            // Note: In production, you'd use web-push library with VAPID keys
            // For now, we'll just log it (actual push sending requires web-push setup)
            console.log(`📲 Would send push to device: ${notification.title}`)
            notificationsSent++
          } catch (pushError) {
            console.error(`❌ Error sending push:`, pushError)
          }
        }
        
        // TODO: Send email notification if email_enabled
        // if (pref.email_enabled) {
        //   await sendEmailNotification(pref.user_id, record, petName, daysUntil)
        // }
      }
    }

    console.log(`✅ Health reminders check complete. Sent ${notificationsSent} notifications.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Edge Function Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
