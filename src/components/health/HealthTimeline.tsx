import { HealthRecordCard } from './HealthRecordCard'
import type { HealthRecord } from '@/hooks/useHealthRecords'
import { format, isThisYear, isToday } from 'date-fns'

interface HealthTimelineProps {
  records: HealthRecord[]
  onEdit: (record: HealthRecord) => void
  onDelete: (recordId: string) => void
}

export function HealthTimeline({ records, onEdit, onDelete }: HealthTimelineProps) {
  const groupedByDate = records.reduce((acc, record) => {
    const date = record.date_administered
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(record)
    return acc
  }, {} as Record<string, HealthRecord[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isThisYear(date)) return format(date, 'MMMM d')
    return format(date, 'MMMM d, yyyy')
  }

  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

      {sortedDates.map((date) => (
        <div key={date} className="relative mb-8">
          {/* Date Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
              <span className="text-white font-bold text-sm">
                {format(new Date(date), 'MMM d')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {formatDate(date)}
            </h3>
          </div>

          {/* Records for this date */}
          <div className="md:ml-24 space-y-4">
            {groupedByDate[date].map((record) => (
              <HealthRecordCard
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
