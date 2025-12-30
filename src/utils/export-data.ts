import JSZip from 'jszip'
import { supabase } from '@/lib/supabase'

export interface UserDataExport {
  pets: any[]
  healthRecords: any[]
  supplySchedules: any[]
  vets: any[]
  notificationPreferences: any
  profile: any
}

/**
 * Fetch all user data from Supabase
 */
export async function fetchAllUserData(userId: string): Promise<UserDataExport> {
  // Fetch all user data in parallel
  const [
    { data: pets },
    { data: healthRecords },
    { data: supplySchedules },
    { data: vets },
    { data: notificationPreferences },
    { data: profile }
  ] = await Promise.all([
    supabase.from('pets').select('*').eq('user_id', userId),
    supabase.from('health_records').select('*, pets!inner(*)').eq('pets.user_id', userId),
    supabase.from('supply_schedules').select('*, pets!inner(*)').eq('pets.user_id', userId),
    supabase.from('vets').select('*').eq('user_id', userId),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('profiles').select('*').eq('id', userId).single()
  ])

  return {
    pets: pets || [],
    healthRecords: healthRecords || [],
    supplySchedules: supplySchedules || [],
    vets: vets || [],
    notificationPreferences: notificationPreferences || {},
    profile: profile || {}
  }
}

/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(data: any[], columns: string[]): string {
  if (data.length === 0) return ''

  // Header row
  const header = columns.join(',')

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col]
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  })

  return [header, ...rows].join('\n')
}

/**
 * Create a ZIP file with all user data
 */
export async function createDataExportZip(userData: UserDataExport): Promise<Blob> {
  const zip = new JSZip()

  // Add pets.csv
  if (userData.pets.length > 0) {
    const petsCSV = convertToCSV(userData.pets, [
      'id',
      'name',
      'species',
      'breed',
      'date_of_birth',
      'weight_lbs',
      'microchip_number',
      'created_at'
    ])
    zip.file('pets.csv', petsCSV)
  }

  // Add health_records.csv
  if (userData.healthRecords.length > 0) {
    const healthCSV = convertToCSV(userData.healthRecords, [
      'id',
      'record_type',
      'title',
      'date_administered',
      'next_due_date',
      'veterinarian',
      'clinic_name',
      'notes',
      'cost',
      'created_at'
    ])
    zip.file('health_records.csv', healthCSV)
  }

  // Add supply_schedules.csv
  if (userData.supplySchedules.length > 0) {
    const suppliesCSV = convertToCSV(userData.supplySchedules, [
      'id',
      'product_name',
      'category',
      'frequency_days',
      'last_purchase_date',
      'next_reminder_date',
      'created_at'
    ])
    zip.file('supply_schedules.csv', suppliesCSV)
  }

  // Add vets.csv
  if (userData.vets.length > 0) {
    const vetsCSV = convertToCSV(userData.vets, [
      'id',
      'clinic_name',
      'vet_name',
      'phone',
      'email',
      'address',
      'is_primary',
      'created_at'
    ])
    zip.file('vets.csv', vetsCSV)
  }

  // Add notification_preferences.json
  zip.file('notification_preferences.json', JSON.stringify(userData.notificationPreferences, null, 2))

  // Add profile.json
  zip.file('profile.json', JSON.stringify(userData.profile, null, 2))

  // Add README.txt
  const readme = `PetCare Manager - Data Export
Generated: ${new Date().toISOString()}

This archive contains all your data from PetCare Manager:

FILES:
- pets.csv: All your registered pets
- health_records.csv: Complete health history
- supply_schedules.csv: Supply tracking schedules
- vets.csv: Your vet directory
- notification_preferences.json: Notification settings
- profile.json: Your profile information

FORMAT:
CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.
JSON files can be viewed in any text editor.

PRIVACY:
This data is yours. We do not retain copies after export.

For questions, contact: support@petcaremanager.com
`
  zip.file('README.txt', readme)

  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
