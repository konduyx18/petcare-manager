import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Calendar, Heart, Package, Stethoscope, Activity } from 'lucide-react'

interface PetStatsProps {
  age?: string
  lastVetVisit?: string
  healthRecordsCount: number
  activeSuppliesCount: number
  upcomingRemindersCount: number
  healthRecordsByType?: {
    vaccinations: number
    vet_visits: number
    prescriptions: number
    procedures: number
  }
}

export function PetStats({
  age,
  lastVetVisit,
  healthRecordsCount,
  activeSuppliesCount,
  healthRecordsByType,
}: PetStatsProps) {
  // Prepare chart data
  const chartData = healthRecordsByType
    ? [
        { name: 'Vaccinations', count: healthRecordsByType.vaccinations, fill: '#3b82f6' },
        { name: 'Vet Visits', count: healthRecordsByType.vet_visits, fill: '#10b981' },
        { name: 'Prescriptions', count: healthRecordsByType.prescriptions, fill: '#f59e0b' },
        { name: 'Procedures', count: healthRecordsByType.procedures, fill: '#8b5cf6' },
      ]
    : []

  // Filter out zero values for cleaner chart
  const chartDataFiltered = chartData.filter(item => item.count > 0)

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {age && (
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Age</p>
                  <p className="text-xl font-bold text-gray-900">{age}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lastVetVisit && (
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Last Vet Visit</p>
                  <p className="text-lg font-bold text-gray-900">{lastVetVisit}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-sky-100 rounded-xl">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-red-100 hover:border-red-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Health Records</p>
                <p className="text-2xl font-bold text-gray-900">{healthRecordsCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Active Supplies</p>
                <p className="text-2xl font-bold text-gray-900">{activeSuppliesCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Records Breakdown Chart */}
      {chartDataFiltered.length > 0 && (
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              Health Records Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartDataFiltered} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartDataFiltered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
