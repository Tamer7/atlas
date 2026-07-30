'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import { useCreateLesson, useUploadLessonVideo } from '@/hooks/curriculum/useLesson'
import { getYouTubeId } from '@/lib/video'
import type { ContentType, Module } from '@/types/curriculum'

type VideoSource = 'youtube' | 'upload'

export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: course, isLoading, isError } = useCourse(id)

  const goToCourse = () => router.push(`/courses/${id}`)

  if (isLoading) {
    return <div className="muted" style={{ padding: 32 }}>Loading course…</div>
  }

  if (isError || !course) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Course not found or you do not have access.
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                goToCourse()
              }}
            >
              {course.title}
            </a>
            {' / Add lesson'}
          </div>
          <h1 className="h1">Add lesson</h1>
        </div>
      </div>

      {/* Keyed by course id so navigating straight from one course's "new lesson"
          page to another's always starts from a clean module selection. */}
      <NewLessonForm key={id} courseId={id} modules={course.modules} onDone={goToCourse} />
    </div>
  )
}

function NewLessonForm({
  courseId,
  modules,
  onDone,
}: {
  courseId: string
  modules: Module[]
  onDone: () => void
}) {
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [body, setBody] = useState('')
  const [videoSource, setVideoSource] = useState<VideoSource>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [error, setError] = useState('')

  const create = useCreateLesson(moduleId, courseId)
  const upload = useUploadLessonVideo(courseId)

  const busy = create.isPending || upload.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const wantsYouTube = contentType === 'video' && videoSource === 'youtube'
    const wantsUpload = contentType === 'video' && videoSource === 'upload'

    if (wantsYouTube && !getYouTubeId(videoUrl)) {
      setError('That does not look like a valid YouTube link.')
      return
    }
    if (wantsUpload && !file) {
      setError('Choose a video file to upload.')
      return
    }

    try {
      const payload = {
        title,
        content_type: contentType,
        body: contentType === 'text' ? body : undefined,
        // Only send video_url for YouTube; uploads set it server-side.
        ...(wantsYouTube ? { video_url: videoUrl } : {}),
      }

      const created = await create.mutateAsync(payload)
      const lessonId = created.id

      if (wantsUpload && file && lessonId) {
        setUploadPct(0)
        await upload.mutateAsync({ id: lessonId, file, onProgress: setUploadPct })
      }

      onDone()
    } catch {
      setUploadPct(null)
      setError('Could not save the lesson. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card card-pad-lg" style={{ maxWidth: 560 }}>
      {modules.length === 0 ? (
        <p className="muted" style={{ fontSize: 14 }}>
          Add a module first before creating lessons.
        </p>
      ) : (
        <>
          <Field label="Module">
            <select
              className="select"
              value={moduleId}
              onChange={e => setModuleId(e.target.value)}
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </Field>

          <Field label="Title">
            <input
              className="input"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Introduction to mixed conditionals"
            />
          </Field>

          <Field label="Content type">
            <select
              className="select"
              value={contentType}
              onChange={e => setContentType(e.target.value as ContentType)}
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </Field>

          {contentType === 'text' && (
            <Field label="Content (optional)">
              <textarea
                className="textarea"
                rows={5}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write the lesson content…"
              />
            </Field>
          )}

          {contentType === 'video' && (
            <>
              <Field label="Video source">
                <div className="row" style={{ gap: 16 }}>
                  <label className="row" style={{ gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="video-source"
                      checked={videoSource === 'youtube'}
                      onChange={() => setVideoSource('youtube')}
                    />
                    YouTube link
                  </label>
                  <label className="row" style={{ gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="video-source"
                      checked={videoSource === 'upload'}
                      onChange={() => setVideoSource('upload')}
                    />
                    Upload video file
                  </label>
                </div>
              </Field>

              {videoSource === 'youtube' ? (
                <Field label="YouTube URL">
                  <input
                    className="input"
                    type="url"
                    required
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </Field>
              ) : (
                <Field label="Video file (MP4, WebM or MOV — up to 500 MB)">
                  <input
                    className="input"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </Field>
              )}

              {uploadPct !== null && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadPct}%`, background: 'var(--brand)', transition: 'width .2s' }} />
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    Uploading… {uploadPct}%
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {error && (
        <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }} role="alert">
          {error}
        </div>
      )}

      <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onDone} disabled={busy}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-brand"
          disabled={busy || modules.length === 0}
        >
          {busy ? 'Saving…' : 'Add lesson'}
        </button>
      </div>
    </form>
  )
}
