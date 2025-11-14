import { PushNotificationTest } from '@/components/settings/PushNotificationTest'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your account and notification preferences</p>

      <div className="space-y-6">
        <PushNotificationTest />

        {/* Add more settings sections here later */}
      </div>
    </div>
  )
}
