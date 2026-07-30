'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import { useLesson, useUpdateLesson, useUploadLessonVideo } from '@/hooks/curriculum/useLesson'
import { getYouTubeId } from '@/lib/video'
import type { ContentType, LessonDetail } from '@/types/curriculum'

type VideoSource = 'youtube' | 'upload'

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lid: string }>
}) {
  const { id, lid } = use(params)
  const router = useRouter()
  const { data: course } = useCourse(id)
  const { data: detail, isLoading, isError } = useLesson(lid)

  const goToCourse = () => router.push(`/courses/${id}`)

  if (isLoading) {
    return <div className="muted" style={{ padding: 32 }}>Loading lesson…</div>
  }

  if (isError || !detail) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Lesson not found or you do not have access.
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
              {course?.title ?? 'Course'}
            </a>
            {' / Edit lesson'}
          </div>
          <h1 className="h1">Edit lesson</h1>
        </div>
      </div>

      {/* Keyed by lesson id: mounts fresh (with correctly derived initial
          state) whenever the editor is opened for a different lesson. */}
      <EditLessonForm key={lid} courseId={id} lessonId={lid} detail={detail} onDone={goToCourse} />
    </div>
  )
}

function initialVideoSource(detail: LessonDetail): VideoSource {
  return detail.video_url && getYouTubeId(detail.video_url) ? 'youtube' : 'upload'
}

function EditLessonForm({
  courseId,
  lessonId,
  detail,
  onDone,
}: {
  courseId: string
  lessonId: string
  detail: LessonDetail
  onDone: () => void
}) {
  const [title, setTitle] = useState(detail.title)
  const [contentType, setContentType] = useState<ContentType>(
    detail.content_type === 'video' ? 'video' : 'text'
  )
  const [body, setBody] = useState(detail.body ?? '')
  const [videoSource, setVideoSource] = useState<VideoSource>(initialVideoSource(detail))
  const [videoUrl, setVideoUrl] = useState(
    detail.video_url && getYouTubeId(detail.video_url) ? detail.video_url : ''
  )
  const [file, setFile] = useState<File | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [error, setError] = useState('')

  const update = useUpdateLesson(courseId)
  const upload = useUploadLessonVideo(courseId)

  const busy = update.isPending || upload.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const wantsYouTube = contentType === 'video' && videoSource === 'youtube'
    const wantsUpload = contentType === 'video' && videoSource === 'upload'

    if (wantsYouTube && !getYouTubeId(videoUrl)) {
      setError('That does not look like a valid YouTube link.')
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

      await update.mutateAsync({ id: lessonId, payload })

      if (wantsUpload && file) {
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
              {detail.video_url && !getYouTubeId(detail.video_url) && !file && (
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

      {error && (
        <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }} role="alert">
          {error}
        </div>
      )}

      <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onDone} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-brand" disabled={busy}>
          {busy ? 'Saving…' : 'Save lesson'}
        </button>
      </div>
    </form>
  )
}
