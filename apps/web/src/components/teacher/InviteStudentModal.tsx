'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useInviteStudent } from '@/hooks/teacher/useStudents'

interface InviteStudentModalProps {
  onClose: () => void
}

export function InviteStudentModal({ onClose }: InviteStudentModalProps) {
  const [email, setEmail] = useState('')
  const [courseIds, setCourseIds] = useState<string[]>([])
  const { data: courses = [] } = useCourses()
  const invite = useInviteStudent()

  const toggleCourse = (id: string) => {
    setCourseIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await invite.mutateAsync({ email, course_ids: courseIds })
    onClose()
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Invite student"
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        background: 'transparent', display: 'grid', placeItems: 'center',
        zIndex: 50, padding: 0, border: 0, maxWidth: 'none', maxHeight: 'none',
      }}
    >
      <button
        aria-label="Close"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          background: 'var(--overlay)', border: 0, cursor: 'default', padding: 0,
        }}
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 480, zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>Invite student</h2>

        <Field label="Email address">
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@example.com"
          />
        </Field>

        {courses.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>Enroll in courses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {courses.map(c => (
                <label key={c.id} className="row" style={{ cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={courseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {invite.isError && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }}>
            Could not send invitation. Please try again.
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-brand" disabled={invite.isPending}>
            {invite.isPending ? 'Sending…' : 'Send invitation'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
