'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui'
import { useCreateCourse } from '@/hooks/courses/useCourses'

const CATEGORIES = ['Languages', 'Test Prep', 'Soft Skills']

export default function NewCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [error, setError] = useState<string | null>(null)
  const create = useCreateCourse()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const course = await create.mutateAsync({ title, tag, category })
      router.push(course?.id ? `/courses/${course.id}` : '/courses')
    } catch (err: unknown) {
      // The original modal had no catch here, so a failed create silently did
      // nothing. Surface the API's message the same way every other form does.
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setError(message ?? 'Could not create the course.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Library / Courses</div>
          <h1 className="h1">Create course</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-pad-lg" style={{ maxWidth: 560 }}>
        <Field label="Title">
          <input
            className="input"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="English B2 — Conversational Fluency"
          />
        </Field>

        <Field label="Tag" hint="shown on cards">
          <input
            className="input"
            required
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="English · B2"
          />
        </Field>

        <Field label="Category">
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {error && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }} role="alert">
            {error}
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create course'}
          </button>
        </div>
      </form>
    </div>
  )
}
