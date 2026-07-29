'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useCourses } from '@/hooks/courses/useCourses'
import { useStudentLiveClasses, useTeacherLiveClasses } from '@/hooks/live/useLiveClasses'
import { useMySchedule, useUpdateScheduleSlot } from '@/hooks/schedule/useSchedule'
import { useRole } from '@/contexts/RoleContext'
import { WeeklyCalendar, courseColorMap } from '@/components/schedule/WeeklyCalendar'
import { SlotModal } from '@/components/schedule/SlotModal'
import type { LiveClass } from '@/lib/api/live'
import type { RangeSelection, SlotTimeChange } from '@/components/schedule/WeeklyCalendar'
import type { ScheduleSlot } from '@/types/schedule'

/** Live classes shown on the weekly grid: live now, or scheduled within this week. */
function thisWeek(liveClasses: LiveClass[]): LiveClass[] {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)

  return liveClasses.filter(lc => {
    if (lc.status === 'live') return true
    if (lc.status !== 'scheduled' || !lc.scheduled_at) return false
    const at = new Date(lc.scheduled_at)
    return at >= monday && at < nextMonday
  })
}

export default function SchedulePage() {
  const router = useRouter()
  const { isTeacher } = useRole()
  const { data: slots = [], isLoading } = useMySchedule()
  const { data: courses = [] } = useCourses()
  const { data: studentLive = [] } = useStudentLiveClasses({ enabled: !isTeacher })
  const { data: teacherLive = [] } = useTeacherLiveClasses({ enabled: isTeacher })
  const updateSlot = useUpdateScheduleSlot()

  const liveThisWeek = thisWeek(isTeacher ? teacherLive : studentLive)

  const [createRange, setCreateRange] = useState<RangeSelection | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editSlot, setEditSlot] = useState<ScheduleSlot | null>(null)

  const colors = courseColorMap(slots)
  const legendCourses = [...new Map(
    slots.filter(s => s.course).map(s => [s.course_id, s.course!])
  ).entries()]

  const handleSlotChange = (change: SlotTimeChange) =>
    updateSlot.mutateAsync({
      id: change.id,
      payload: {
        day_of_week: change.day_of_week,
        start_time: change.start_time,
        end_time: change.end_time,
      },
    })

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Schedule</div>
          <h1 className="h1">Weekly <span className="serif-italic">timetable</span></h1>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            {isTeacher
              ? 'Drag a class to move it, drag its edge to change the length, or click an empty space to add one.'
              : 'Class times for every course you are enrolled in. Your teachers keep this up to date.'}
          </div>
        </div>
        {isTeacher && (
          <button className="btn btn-brand" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Add class time
          </button>
        )}
      </div>

      {(legendCourses.length > 0 || liveThisWeek.length > 0) && (
        <div className="row" style={{ gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {legendCourses.map(([id, course]) => (
            <div key={id} className="row" style={{ gap: 7, fontSize: 13 }}>
              <span
                style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: colors.get(id)?.border, flexShrink: 0,
                }}
              />
              {course.title}
            </div>
          ))}
          {liveThisWeek.length > 0 && (
            <div className="row" style={{ gap: 7, fontSize: 13 }}>
              <span
                style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: 'var(--danger)', flexShrink: 0,
                }}
              />
              Live classes this week
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="muted" style={{ padding: 32 }}>Loading schedule…</div>
      ) : slots.length === 0 && !isTeacher ? (
        <div className="card card-pad-lg muted" style={{ fontSize: 14 }}>
          No class times scheduled yet. They will appear here once your teachers set them.
        </div>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <WeeklyCalendar
            slots={slots}
            liveClasses={liveThisWeek}
            editable={isTeacher}
            onSlotClick={isTeacher ? setEditSlot : undefined}
            onSlotChange={isTeacher ? handleSlotChange : undefined}
            onRangeSelect={isTeacher ? setCreateRange : undefined}
            onLiveClassClick={lc => {
              if (lc.status === 'live') router.push(`/live/room?classId=${lc.id}`)
            }}
          />
        </div>
      )}

      {(showCreate || createRange) && (
        <SlotModal
          courses={courses.map(c => ({ id: c.id, title: c.title }))}
          initialRange={createRange}
          onClose={() => {
            setShowCreate(false)
            setCreateRange(null)
          }}
        />
      )}
      {editSlot && (
        <SlotModal
          courses={courses.map(c => ({ id: c.id, title: c.title }))}
          slot={editSlot}
          onClose={() => setEditSlot(null)}
        />
      )}
    </div>
  )
}
