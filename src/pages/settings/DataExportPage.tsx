import { useState } from 'react'
import { Download, FileArchive, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { fetchAllUserData, createDataExportZip, downloadBlob } from '@/utils/export-data'
import { toast } from 'sonner'

export default function DataExportPage() {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const handleExport = async () => {
    if (!user) return

    setIsExporting(true)
    setExportComplete(false)

    try {
      // Fetch all data
      toast.info('Gathering your data...')
      const userData = await fetchAllUserData(user.id)
      
      // Create ZIP
      toast.info('Creating archive...')
      const zipBlob = await createDataExportZip(userData)
      
      // Download
      const filename = `petcare-data-export-${new Date().toISOString().split('T')[0]}.zip`
      downloadBlob(zipBlob, filename)
      
      setExportComplete(true)
      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Your Data</h1>
        <p className="text-gray-600 mt-2">
          Download a complete copy of all your data stored in PetCare Manager
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is important to us. This export includes all your pets, health records, 
          supply schedules, and settings. The data is yours to keep or transfer.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
          <CardDescription>Your export will contain the following files:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <DataItem icon={<Check />} label="pets.csv" description="All registered pets with details" />
            <DataItem icon={<Check />} label="health_records.csv" description="Complete health history" />
            <DataItem icon={<Check />} label="supply_schedules.csv" description="Supply tracking information" />
            <DataItem icon={<Check />} label="vets.csv" description="Your vet directory" />
            <DataItem icon={<Check />} label="notification_preferences.json" description="Notification settings" />
            <DataItem icon={<Check />} label="profile.json" description="Profile information" />
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              size="lg"
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export My Data
                </>
              )}
            </Button>
          </div>

          {exportComplete && (
            <Alert className="bg-green-50 border-green-200">
              <FileArchive className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your data has been exported successfully. Check your downloads folder.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• CSV files can be opened in Excel, Google Sheets, or Numbers</p>
          <p>• JSON files can be viewed in any text editor</p>
          <p>• The ZIP archive includes a README with instructions</p>
          <p>• All data is exported in human-readable formats</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DataItem({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-green-600">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
