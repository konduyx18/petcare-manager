import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getVaccinationStatus } from '@/utils/vaccination-utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { HealthRecord } from '@/hooks/useHealthRecords'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS
  }
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
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const events: VaccinationEvent[] = useMemo(() => {
    return vaccinations
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
  }, [vaccinations])

  const eventStyleGetter = (event: VaccinationEvent) => {
    const colors: Record<string, { backgroundColor: string; color: string }> = {
      overdue: { backgroundColor: '#ef4444', color: 'white' },
      'due-soon': { backgroundColor: '#f97316', color: 'white' },
      upcoming: { backgroundColor: '#3b82f6', color: 'white' },
      current: { backgroundColor: '#10b981', color: 'white' }
    }

    return {
      style: colors[event.resource.status] || { backgroundColor: '#10b981', color: 'white' }
    }
  }

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate }: any) => {
    return (
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{label}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg border">
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .rbc-today {
          background-color: #f0fdf4;
        }
        .rbc-event {
          border-radius: 4px;
          padding: 2px 5px;
          font-size: 12px;
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.8;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
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
        view={view}
        onView={setView}
        date={date}
        onNavigate={handleNavigate}
        components={{
          toolbar: CustomToolbar
        }}
        style={{ height: '100%' }}
        popup
        showMultiDayTimes
      />
    </div>
  )
}
