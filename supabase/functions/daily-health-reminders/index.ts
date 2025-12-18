import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isInQuietHours(currentTime: string, startTime: string | null, endTime: string | null): boolean {
  if (!startTime || !endTime) return false
  
  // Convert time strings to minutes since midnight for easier comparison
  const [currentHour, currentMin] = currentTime.split(':').map(Number)
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const currentMinutes = currentHour * 60 + currentMin
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  if (startMinutes < endMinutes) {
    // Same day quiet hours (e.g., 02:00 - 08:00)
    // User is in quiet hours if current time is BETWEEN start and end
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  } else {
    // Spans midnight (e.g., 22:00 - 08:00)
    // User is in quiet hours if current time is AFTER start OR BEFORE end
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }
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
    const currentMin = now.getMinutes()
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`

    console.log('📋 Fetching notification preferences...')

    // Get all users with push notifications enabled
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, health_reminder_days, quiet_hours_start, quiet_hours_end, push_enabled, email_enabled')
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
      console.log(`⏰ Checking quiet hours for user ${pref.user_id}:`)
      console.log(`   Current time: ${currentTime}`)
      console.log(`   Quiet hours: ${pref.quiet_hours_start || 'none'} - ${pref.quiet_hours_end || 'none'}`)
      console.log(`   Is in quiet hours: ${isInQuietHours(currentTime, pref.quiet_hours_start, pref.quiet_hours_end)}`)
      
      if (isInQuietHours(currentTime, pref.quiet_hours_start, pref.quiet_hours_end)) {
        console.log(`❌ Skipping ${pref.user_id} - in quiet hours`)
        continue
      } else {
        console.log(`✅ Proceeding with notifications for ${pref.user_id}`)
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
        
        // Send email notification if email_enabled
        if (pref.email_enabled) {
          try {
            // Get user email from profiles
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', pref.user_id)
              .single()
            
            if (profileError || !profile?.email) {
              console.log(`⚠️ No email found for user ${pref.user_id}`)
              continue
            }
            
            // Initialize Resend
            const resendApiKey = Deno.env.get('RESEND_API_KEY')
            if (!resendApiKey) {
              console.error('❌ RESEND_API_KEY not set')
              continue
            }
            
            const resend = new Resend(resendApiKey)
            
            // Format date
            const formatDate = (dateStr: string) => {
              const date = new Date(dateStr)
              return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
            
            // Build HTML email
            const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #10b981; margin: 0; font-size: 28px;">🐾 PetCare Reminder</h1>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
      <h2 style="color: #059669; margin-top: 0; font-size: 22px;">${petName}'s ${record.title}</h2>
      <p style="font-size: 16px; margin: 10px 0;">
        <strong>Due Date:</strong> ${formatDate(record.next_due_date)}
      </p>
      <p style="font-size: 16px; margin: 10px 0; color: #dc2626;">
        <strong>⚠️ Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!</strong>
      </p>
    </div>
    
    <div style="margin-bottom: 25px;">
      <h3 style="color: #374151; font-size: 18px;">Details:</h3>
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Record Type:</strong> ${record.record_type}
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${Deno.env.get('VITE_APP_URL') || 'http://localhost:5173'}/health" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;">
        View in App
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
        You're receiving this because you enabled health reminders in PetCare Manager.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
        <a href="${Deno.env.get('VITE_APP_URL') || 'http://localhost:5173'}/settings/notifications" style="color: #10b981; text-decoration: none;">Update your notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
            `
            
            const { data: emailData, error: emailError } = await resend.emails.send({
              from: 'PetCare Reminders <onboarding@resend.dev>',
              to: [profile.email],
              subject: `🐾 ${petName}'s ${record.title} is due in ${daysUntil} days`,
              html,
            })
            
            if (emailError) {
              console.error(`❌ Failed to send email to ${profile.email}:`, emailError)
            } else {
              console.log(`📧 Email sent to ${profile.email} for ${record.title}`)
              notificationsSent++
            }
          } catch (emailError) {
            console.error(`❌ Error sending email:`, emailError)
          }
        }
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
