import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getVaccinationStatus } from '@/utils/vaccination-utils'
import type { HealthRecord } from '@/hooks/useHealthRecords'

const locales = {
  'en-US': enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface VaccinationEvent extends Event {
  resource: {
    vaccination: HealthRecord
    status: string
    color: string
  }
}

interface VaccinationCalendarProps {
  vaccinations: HealthRecord[]
  onSelectEvent?: (vaccination: HealthRecord) => void
}

export function VaccinationCalendar({ vaccinations, onSelectEvent }: VaccinationCalendarProps) {
  const events: VaccinationEvent[] = vaccinations
    .filter(v => v.next_due_date)
    .map(v => {
      const status = getVaccinationStatus(v.next_due_date!)
      const pet = v.pet

      return {
        id: v.id,
        title: `${pet?.name || 'Unknown'}: ${v.title}`,
        start: new Date(v.next_due_date!),
        end: new Date(v.next_due_date!),
        resource: {
          vaccination: v,
          status: status.status,
          color: status.color
        }
      }
    })

  const eventStyleGetter = (event: VaccinationEvent) => {
    const colors: Record<string, { backgroundColor: string; color: string }> = {
      overdue: { backgroundColor: '#ef4444', color: 'white' },
      'due-soon': { backgroundColor: '#f97316', color: 'white' },
      upcoming: { backgroundColor: '#3b82f6', color: 'white' },
      current: { backgroundColor: '#10b981', color: 'white' }
    }

    return {
      style: colors[event.resource.status] || colors.current
    }
  }

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg border">
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 14px;
        }
        .rbc-today {
          background-color: #f0fdf4;
        }
        .rbc-event {
          border-radius: 4px;
          padding: 2px 5px;
          font-size: 12px;
        }
        .rbc-event:focus {
          outline: 2px solid #3b82f6;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-month-row {
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={(event) => onSelectEvent?.(event.resource.vaccination)}
        eventPropGetter={eventStyleGetter}
        views={['month', 'agenda']}
        defaultView="month"
        popup
        style={{ height: '100%' }}
      />
    </div>
  )
}
