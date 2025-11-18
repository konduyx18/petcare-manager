# 🔔 Automated Health Reminders Edge Function

## ✅ Week 4, Day 21: Edge Function Created Successfully!

---

## 📁 File Structure Created

```
petcare-manager/
└── supabase/
    └── functions/
        └── daily-health-reminders/
            └── index.ts  ✅ CREATED
```

---

## 🎯 What This Edge Function Does

### **Automated Daily Health Reminders**

This Supabase Edge Function runs on a schedule (daily) and:

1. ✅ **Checks all users** with push notifications enabled
2. ✅ **Respects quiet hours** - skips users in their quiet hours
3. ✅ **Finds upcoming health records** based on user preferences
4. ✅ **Sends push notifications** for due vaccinations, checkups, etc.
5. ✅ **Logs everything** for debugging and monitoring

---

## 🔧 Key Features

### **1. User Preference Awareness** ✅
```typescript
// Respects each user's notification settings:
- push_enabled: Only sends to users who want notifications
- health_reminders_enabled: Only sends health record reminders if enabled
- vaccination_reminders_enabled: Only sends vaccine reminders if enabled
- health_reminder_days: Custom reminder window (e.g., 14 days before)
- vaccination_reminder_days: Custom vaccine reminder window
```

### **2. Quiet Hours Support** ✅
```typescript
// Skips users during their quiet hours
if (pref.quiet_hours_enabled && isInQuietHours(...)) {
  console.log('😴 User in quiet hours, skipping')
  continue
}

// Handles overnight quiet hours (e.g., 22:00 to 08:00)
```

### **3. Smart Filtering** ✅
```typescript
// Only sends notifications for records that:
- Have a next_due_date set
- Are within the user's reminder window
- Match the user's enabled reminder types
- Belong to the user's pets
```

### **4. Multi-Device Support** ✅
```typescript
// Sends to all registered devices
for (const device of devices) {
  await sendPushNotification(device.subscription, notification)
}
```

### **5. Comprehensive Logging** ✅
```typescript
// Logs every step for debugging:
console.log('🔔 Health Reminders Function Started')
console.log('✅ Supabase client initialized')
console.log(`📋 Found ${preferences?.length} users`)
console.log(`🔍 Checking user ${pref.user_id}`)
console.log(`📌 Found ${healthRecords.length} records`)
console.log(`✅ Sent notification to device`)
console.log('🎉 Function completed:', result)
```

---

## 📊 How It Works

### **Step-by-Step Process:**

```
1. Function starts (triggered by cron schedule)
   ↓
2. Initialize Supabase client with SERVICE ROLE key
   ↓
3. Fetch all users with push_enabled = true
   ↓
4. For each user:
   ├─ Check if in quiet hours → Skip if yes
   ├─ Calculate reminder windows based on preferences
   ├─ Fetch upcoming health records for user's pets
   ├─ Filter records by type and timing
   ├─ Get user's registered devices
   └─ Send push notification to each device
   ↓
5. Return summary:
   {
     success: true,
     usersChecked: 10,
     notificationsSent: 25,
     timestamp: "2025-11-18T..."
   }
```

---

## 🔔 Notification Examples

### **Vaccination Reminder:**
```
Title: 💉 Max Reminder
Body: Annual Rabies Vaccine is due in 7 days!
URL: /health?pet=abc123
```

### **Health Checkup Reminder:**
```
Title: 🏥 Bella Reminder
Body: Annual Checkup is due tomorrow!
URL: /health?pet=def456
```

### **Urgent Reminder:**
```
Title: 💉 Charlie Reminder
Body: Flea & Tick Prevention is due TODAY!
URL: /health?pet=ghi789
```

---

## 🛠️ Environment Variables Required

The Edge Function needs these environment variables (automatically set by Supabase):

```bash
SUPABASE_URL              # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY # Service role key (admin access)
VAPID_PUBLIC_KEY          # For web push notifications
VAPID_PRIVATE_KEY         # For web push notifications
```

---

## 📅 Deployment Instructions

### **Step 1: Install Supabase CLI**
```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login
```

### **Step 2: Link to Your Project**
```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

### **Step 3: Deploy the Function**
```bash
# Deploy the Edge Function
supabase functions deploy daily-health-reminders

# Expected output:
# ✅ Deployed function daily-health-reminders
# Function URL: https://YOUR_PROJECT.supabase.co/functions/v1/daily-health-reminders
```

### **Step 4: Set Environment Variables**
```bash
# Set VAPID keys (from your .env.local)
supabase secrets set VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY"
supabase secrets set VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY"

# Verify secrets
supabase secrets list
```

### **Step 5: Set Up Cron Schedule**
```bash
# In Supabase Dashboard:
# 1. Go to Database → Extensions
# 2. Enable "pg_cron" extension
# 3. Run this SQL in SQL Editor:

SELECT cron.schedule(
  'daily-health-reminders',           -- Job name
  '0 9 * * *',                        -- Run at 9:00 AM UTC daily
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/daily-health-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

# Verify cron job
SELECT * FROM cron.job;
```

---

## 🧪 Testing the Function

### **Test 1: Manual Invocation**
```bash
# Test locally with Supabase CLI
supabase functions serve daily-health-reminders

# In another terminal, invoke it:
curl -i --location --request POST 'http://localhost:54321/functions/v1/daily-health-reminders' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### **Test 2: Remote Invocation**
```bash
# Test deployed function
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/daily-health-reminders' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json'
```

### **Test 3: Check Logs**
```bash
# View function logs
supabase functions logs daily-health-reminders

# Expected output:
# 🔔 Health Reminders Function Started
# ✅ Supabase client initialized
# 📋 Found 5 users with notifications enabled
# 🔍 Checking user abc123...
# 📌 Found 3 total upcoming records
# 🎯 2 records match user's reminder preferences
# 📱 Found 1 device(s) for user abc123
# ✅ Sent notification to device for Max
# ✅ Sent notification to device for Bella
# 🎉 Function completed: { success: true, usersChecked: 5, notificationsSent: 8 }
```

---

## 📋 Database Tables Used

### **1. notification_preferences**
```sql
SELECT 
  user_id,
  push_enabled,
  health_reminders_enabled,
  vaccination_reminders_enabled,
  health_reminder_days,
  vaccination_reminder_days,
  quiet_hours_enabled,
  quiet_hours_start,
  quiet_hours_end
FROM notification_preferences
WHERE push_enabled = true;
```

### **2. health_records**
```sql
SELECT 
  id,
  record_type,
  title,
  next_due_date,
  pet_id
FROM health_records
WHERE next_due_date IS NOT NULL
  AND next_due_date >= CURRENT_DATE;
```

### **3. pets**
```sql
SELECT 
  id,
  name,
  user_id
FROM pets;
```

### **4. user_devices**
```sql
SELECT 
  subscription
FROM user_devices
WHERE user_id = 'abc123';
```

---

## 🎯 Reminder Logic

### **Health Records (Checkups, Medications, etc.):**
```typescript
// User sets: health_reminder_days = 14
// Today: 2025-11-18
// Target date: 2025-12-02 (14 days from now)

// Will send reminders for records with next_due_date:
// - 2025-11-18 (TODAY)
// - 2025-11-25 (in 7 days)
// - 2025-12-02 (in 14 days)

// Will NOT send for:
// - 2025-12-10 (in 22 days - outside window)
```

### **Vaccinations:**
```typescript
// User sets: vaccination_reminder_days = 14
// Same logic as health records, but separate window
// Allows different timing for vaccines vs other health items
```

---

## 🔒 Security Features

### **1. Service Role Key** ✅
```typescript
// Uses SERVICE_ROLE_KEY for admin access
// Can read all users' data (needed for cron job)
// Never exposed to client
```

### **2. User Privacy** ✅
```typescript
// Only processes users who opted in (push_enabled = true)
// Respects quiet hours
// Only accesses user's own pets and records
```

### **3. Error Handling** ✅
```typescript
// Continues processing other users if one fails
try {
  // Process user
} catch (userError) {
  console.error('Error processing user:', userError)
  continue // Don't stop entire function
}
```

---

## 📊 Expected Output

### **Success Response:**
```json
{
  "success": true,
  "usersChecked": 10,
  "notificationsSent": 25,
  "timestamp": "2025-11-18T09:00:00.000Z"
}
```

### **Error Response:**
```json
{
  "error": "Missing environment variables",
  "stack": "Error: Missing environment variables\n  at ..."
}
```

---

## 🐛 Debugging Tips

### **1. Check Function Logs:**
```bash
supabase functions logs daily-health-reminders --tail
```

### **2. Verify Environment Variables:**
```bash
supabase secrets list
```

### **3. Test Database Queries:**
```sql
-- Check users with notifications enabled
SELECT COUNT(*) FROM notification_preferences WHERE push_enabled = true;

-- Check upcoming health records
SELECT COUNT(*) FROM health_records 
WHERE next_due_date IS NOT NULL 
  AND next_due_date >= CURRENT_DATE;

-- Check user devices
SELECT COUNT(*) FROM user_devices;
```

### **4. Common Issues:**

| Issue | Solution |
|-------|----------|
| No notifications sent | Check if users have push_enabled = true |
| VAPID error | Verify VAPID keys are set correctly |
| No devices found | Users need to enable push notifications in app |
| Quiet hours blocking | Check quiet_hours_start/end times |
| No upcoming records | Verify next_due_date is set on health records |

---

## 🎉 Success Criteria

✅ **Edge Function Created:** `supabase/functions/daily-health-reminders/index.ts`  
✅ **Uses Deno Imports:** `https://deno.land/std@0.168.0/http/server.ts`  
✅ **Supabase Client:** Uses SERVICE_ROLE_KEY for admin access  
✅ **Respects Preferences:** Checks push_enabled, reminder types, quiet hours  
✅ **Smart Filtering:** Only sends relevant notifications  
✅ **Multi-Device:** Sends to all user devices  
✅ **Error Handling:** Continues on individual user errors  
✅ **Comprehensive Logging:** Logs every step for debugging  
✅ **Web Push Integration:** Uses web-push library for notifications  
✅ **Quiet Hours Logic:** Handles overnight quiet hours correctly  

---

## 📚 Next Steps

### **1. Deploy to Supabase:**
```bash
supabase functions deploy daily-health-reminders
```

### **2. Set Up Cron Schedule:**
```sql
-- Run daily at 9:00 AM UTC
SELECT cron.schedule(
  'daily-health-reminders',
  '0 9 * * *',
  $$ ... $$
);
```

### **3. Monitor Logs:**
```bash
supabase functions logs daily-health-reminders --tail
```

### **4. Test with Real Data:**
- Add health records with upcoming due dates
- Enable push notifications in app
- Wait for scheduled run or trigger manually
- Check browser notifications

---

## 🎯 Function Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| **Deno Runtime** | ✅ | Uses Deno imports and syntax |
| **Service Role Access** | ✅ | Admin access to all users |
| **User Preferences** | ✅ | Respects all notification settings |
| **Quiet Hours** | ✅ | Skips users in quiet hours |
| **Smart Filtering** | ✅ | Only sends relevant reminders |
| **Multi-Device** | ✅ | Sends to all user devices |
| **Error Handling** | ✅ | Graceful error handling |
| **Logging** | ✅ | Comprehensive console logs |
| **Web Push** | ✅ | Uses web-push library |
| **Cron Ready** | ✅ | Designed for scheduled execution |

---

**🎉 Edge Function successfully created and ready for deployment!** 🚀

The automated health reminders system is now complete and will:
- ✅ Run daily on a schedule
- ✅ Check all users' health records
- ✅ Send timely push notifications
- ✅ Respect user preferences and quiet hours
- ✅ Handle errors gracefully
- ✅ Log everything for monitoring

Deploy it to Supabase and set up the cron schedule to activate automated reminders! 🔔
