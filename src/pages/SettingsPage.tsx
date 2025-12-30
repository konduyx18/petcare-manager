import { PushNotificationTest } from '@/components/settings/PushNotificationTest'
import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, Settings2, Download, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your account and notification preferences</p>

      <div className="space-y-6">
        {/* Quick Enable/Disable Push */}
        <PushNotificationTest />

        {/* Link to Full Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Advanced Notification Settings
            </CardTitle>
            <CardDescription>
              Control exactly what notifications you receive and when
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/settings/notifications"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <Bell className="h-4 w-4" />
              Manage Notification Preferences
            </Link>
          </CardContent>
        </Card>

        {/* Privacy & Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Export or manage your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/settings/export' })}
            >
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
