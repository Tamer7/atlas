'use client'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import type { LiveClass } from '@/lib/api/live'
import type { ScheduleSlot } from '@/types/schedule'

/**
 * The timetable is a recurring week, not a dated calendar, so events are
 * pinned to a fixed reference week (a known Monday) and only weekday names
 * are shown. Dragging an event to another column changes its day_of_week.
 */
const BASE_MONDAY = new Date(2026, 0, 5)

export interface CourseColor {
  border: string
  bg: string
}

const COURSE_COLORS: CourseColor[] = [
  { border: '#2747E0', bg: '#E6EAFB' }, // brand blue
  { border: '#D97757', bg: '#F6E6DC' }, // terracotta
  { border: '#1F7A47', bg: '#DCEEDE' }, // green
  { border: '#7A4E8A', bg: '#EFE3F2' }, // violet
  { border: '#B0813B', bg: '#F4EAD8' }, // gold
  { border: '#2E7A8A', bg: '#DEEEF2' }, // teal
]

/** Stable course → color mapping based on the sorted set of course ids on screen. */
export function courseColorMap(slots: ScheduleSlot[]): Map<string, CourseColor> {
  const ids = [...new Set(slots.map(s => s.course_id))].sort()
  return new Map(ids.map((id, i) => [id, COURSE_COLORS[i % COURSE_COLORS.length]]))
}

export interface SlotTimeChange {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface RangeSelection {
  day_of_week: number
  start_time: string
  end_time: string
}

interface WeeklyCalendarProps {
  slots: ScheduleSlot[]
  /** Live classes happening this week; shown read-only on their weekday. */
  liveClasses?: LiveClass[]
  editable?: boolean
  onSlotClick?: (slot: ScheduleSlot) => void
  /** Fired after a drag/resize; reject the promise to revert the move. */
  onSlotChange?: (change: SlotTimeChange) => Promise<unknown>
  onRangeSelect?: (range: RangeSelection) => void
  onLiveClassClick?: (liveClass: LiveClass) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

function slotToDateStr(dayOfWeek: number, time: string): string {
  const d = new Date(BASE_MONDAY)
  d.setDate(d.getDate() + dayOfWeek - 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}:00`
}

function toDayOfWeek(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1
}

function toHM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function WeeklyCalendar({
  slots,
  liveClasses = [],
  editable = false,
  onSlotClick,
  onSlotChange,
  onRangeSelect,
  onLiveClassClick,
}: WeeklyCalendarProps) {
  const colors = courseColorMap(slots)

  const events: EventInput[] = slots.map(slot => {
    const color = colors.get(slot.course_id)!
    return {
      id: slot.id,
      title: slot.course?.title ?? 'Class',
      start: slotToDateStr(slot.day_of_week, slot.start_time),
      end: slotToDateStr(slot.day_of_week, slot.end_time),
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: 'var(--ink)',
      extendedProps: { slot, accent: color.border },
    }
  })

  for (const lc of liveClasses) {
    if (!lc.scheduled_at && lc.status !== 'live') continue
    const at = new Date(lc.scheduled_at ?? Date.now())
    const startHM = toHM(at)
    const endHM = toHM(new Date(at.getTime() + 60 * 60000))
    events.push({
      id: `live-${lc.id}`,
      title: lc.title,
      start: slotToDateStr(toDayOfWeek(at), startHM),
      end: slotToDateStr(toDayOfWeek(at), endHM),
      backgroundColor: 'var(--danger-tint)',
      borderColor: 'var(--danger)',
      textColor: 'var(--ink)',
      editable: false,
      extendedProps: { liveClass: lc, accent: 'var(--danger)' },
    })
  }

  const handleClick = (arg: EventClickArg) => {
    const live = arg.event.extendedProps.liveClass as LiveClass | undefined
    if (live) {
      onLiveClassClick?.(live)
      return
    }
    const slot = arg.event.extendedProps.slot as ScheduleSlot | undefined
    if (slot && onSlotClick) onSlotClick(slot)
  }

  const handleMove = (arg: EventDropArg | EventResizeDoneArg) => {
    const { start, end } = arg.event
    const slot = arg.event.extendedProps.slot as ScheduleSlot | undefined
    if (!start || !end || !slot || !onSlotChange) {
      arg.revert()
      return
    }
    onSlotChange({
      id: slot.id,
      day_of_week: toDayOfWeek(start),
      start_time: toHM(start),
      end_time: toHM(end),
    }).catch(() => arg.revert())
  }

  const handleSelect = (arg: DateSelectArg) => {
    if (!onRangeSelect) return
    onRangeSelect({
      day_of_week: toDayOfWeek(arg.start),
      start_time: toHM(arg.start),
      end_time: toHM(arg.end),
    })
  }

  return (
    <div className="atlas-calendar">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={BASE_MONDAY}
        headerToolbar={false}
        firstDay={1}
        allDaySlot={false}
        dayHeaderFormat={{ weekday: 'long' }}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        height="auto"
        expandRows
        nowIndicator={false}
        editable={editable}
        selectable={editable}
        selectMirror
        // Weekly slots live inside a single day column.
        selectAllow={span =>
          toDayOfWeek(span.start) === toDayOfWeek(new Date(span.end.getTime() - 1))
        }
        events={events}
        eventClick={handleClick}
        eventDrop={handleMove}
        eventResize={handleMove}
        select={handleSelect}
        eventContent={arg => {
          const slot = arg.event.extendedProps.slot as ScheduleSlot | undefined
          const accent = arg.event.extendedProps.accent as string | undefined
          return (
            <div className="atlas-cal-event" style={{ borderLeft: `3px solid ${accent}` }}>
              <div className="atlas-cal-event-time">{arg.timeText}</div>
              <div className="atlas-cal-event-title">{arg.event.title}</div>
              {slot?.label && <div className="atlas-cal-event-label">{slot.label}</div>}
            </div>
          )
        }}
      />
    </div>
  )
}
