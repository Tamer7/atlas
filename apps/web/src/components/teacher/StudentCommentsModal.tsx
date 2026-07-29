'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar, Field } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useStudentComments,
  useCreateStudentComment,
  useDeleteStudentComment,
} from '@/hooks/teacher/useStudentComments'

interface StudentCommentsModalProps {
  studentId: string
  studentName: string
  onClose: () => void
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function StudentCommentsModal({ studentId, studentName, onClose }: StudentCommentsModalProps) {
  const { user } = useAuth()
  const { data: comments = [], isLoading } = useStudentComments(studentId)
  const createComment = useCreateStudentComment(studentId)
  const deleteComment = useDeleteStudentComment(studentId)

  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setError('')
    try {
      await createComment.mutateAsync({ body: body.trim() })
      setBody('')
    } catch {
      setError('Could not add the comment. Please try again.')
    }
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label={`Comments about ${studentName}`}
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
      <div
        className="card card-pad-lg"
        style={{ position: 'relative', width: 540, zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="h2" style={{ marginBottom: 6 }}>Comments · {studentName}</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
          Notes about this student&apos;s performance. The student can see these on their profile.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <Field label="Add a comment">
            <textarea
              className="textarea"
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Great progress on grammar this month; needs more speaking practice…"
            />
          </Field>
          {error && (
            <div className="help" style={{ color: 'var(--danger)', marginTop: 6 }}>{error}</div>
          )}
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              className="btn btn-brand btn-sm"
              disabled={!body.trim() || createComment.isPending}
            >
              {createComment.isPending ? 'Adding…' : 'Add comment'}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="muted" style={{ fontSize: 13 }}>Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="card card-pad muted" style={{ fontSize: 13 }}>
            No comments about this student yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex', gap: 12, padding: 14,
                  background: 'var(--paper-2)', borderRadius: 'var(--r-md)',
                }}
              >
                <Avatar name={c.teacher?.name ?? '?'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                    <b style={{ fontSize: 13 }}>{c.teacher?.name}</b>
                    <span className="muted" style={{ fontSize: 12 }}>
                      · {formatDate(c.created_at)}
                    </span>
                    {c.course && (
                      <span className="muted" style={{ fontSize: 12 }}>· {c.course.title}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.body}</div>
                </div>
                {c.teacher?.id === user?.id && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    title="Delete comment"
                    onClick={() => deleteComment.mutate(c.id)}
                    disabled={deleteComment.isPending}
                  >
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  )
}
