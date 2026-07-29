'use client'

import { useEffect, useState } from 'react'
import { Field } from '@/components/ui'
import { useLesson, useCreateLesson, useUpdateLesson, useUploadLessonVideo } from '@/hooks/curriculum/useLesson'
import { getYouTubeId } from '@/lib/video'
import type { ContentType, Lesson, Module } from '@/types/curriculum'

type VideoSource = 'youtube' | 'upload'

interface LessonEditorModalProps {
  courseId: string
  modules: Module[]
  /** When provided, the modal edits this lesson instead of creating a new one. */
  lesson?: Lesson | null
  onClose: () => void
}

export function LessonEditorModal({ courseId, modules, lesson, onClose }: LessonEditorModalProps) {
  const isEdit = !!lesson
  const { data: detail } = useLesson(lesson?.id ?? '')

  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '')
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [body, setBody] = useState('')
  const [videoSource, setVideoSource] = useState<VideoSource>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [error, setError] = useState('')

  const create = useCreateLesson(moduleId, courseId)
  const update = useUpdateLesson(courseId)
  const upload = useUploadLessonVideo(courseId)

  useEffect(() => {
    if (!detail) return
    setTitle(detail.title)
    setContentType(detail.content_type === 'video' ? 'video' : 'text')
    setBody(detail.body ?? '')
    if (detail.video_url && getYouTubeId(detail.video_url)) {
      setVideoSource('youtube')
      setVideoUrl(detail.video_url)
    } else if (detail.video_url) {
      setVideoSource('upload')
    }
  }, [detail])

  const busy = create.isPending || update.isPending || upload.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const wantsYouTube = contentType === 'video' && videoSource === 'youtube'
    const wantsUpload = contentType === 'video' && videoSource === 'upload'

    if (wantsYouTube && !getYouTubeId(videoUrl)) {
      setError('That does not look like a valid YouTube link.')
      return
    }
    if (wantsUpload && !isEdit && !file) {
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

      let lessonId = lesson?.id
      if (isEdit && lessonId) {
        await update.mutateAsync({ id: lessonId, payload })
      } else {
        const created = await create.mutateAsync(payload)
        lessonId = created.id
      }

      if (wantsUpload && file && lessonId) {
        setUploadPct(0)
        await upload.mutateAsync({ id: lessonId, file, onProgress: setUploadPct })
      }

      onClose()
    } catch {
      setUploadPct(null)
      setError('Could not save the lesson. Please try again.')
    }
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label={isEdit ? 'Edit lesson' : 'Add lesson'}
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
        disabled={busy}
      />
      <form
        onSubmit={handleSubmit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 520, zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>{isEdit ? 'Edit lesson' : 'Add lesson'}</h2>

        {!isEdit && modules.length === 0 ? (
          <p className="muted" style={{ fontSize: 14 }}>
            Add a module first before creating lessons.
          </p>
        ) : (
          <>
            {!isEdit && (
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
            )}

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
                    {isEdit && detail?.video_url && !getYouTubeId(detail.video_url) && !file && (
                      <div className="help" style={{ marginTop: 6 }}>
                        This lesson already has an uploaded video. Choose a file to replace it.
                      </div>
                    )}
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
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }}>
            {error}
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-brand"
            disabled={busy || (!isEdit && modules.length === 0)}
          >
            {busy ? 'Saving…' : isEdit ? 'Save lesson' : 'Add lesson'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
