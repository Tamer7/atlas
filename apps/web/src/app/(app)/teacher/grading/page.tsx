'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Field, Sparkle, Check, X, ArrowLeft, ArrowRight, ChevronDown } from '@/components/ui'
import { useGradingQueue, useGradeAnswer, useCompleteGrading } from '@/hooks/assessment/useGrading'
import { useAttempt } from '@/hooks/assessment/useAttempt'
import { avatarColor, formatRelativeTime, formatStudentAnswer } from '@/lib/quiz/helpers'
import type { GradingQueueAnswer, GradingQueueItem, QuestionType } from '@/types/assessment'

// ─── ManualGrader (local component) ──────────────────────────────────────────

function ManualGrader({
  question,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: {
  question: GradingQueueAnswer
  score: number | null
  comment: string
  onScoreChange: (s: number) => void
  onCommentChange: (c: string) => void
}) {
  const pointOptions = Array.from({ length: question.points + 1 }, (_, i) => i)
  const studentText = formatStudentAnswer(question.answer, question.type)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{question.prompt}</div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Student answer</div>
        <div style={{
          background: 'var(--paper-2)', borderRadius: 8,
          padding: '12px 14px', fontSize: 13, lineHeight: 1.6,
          color: 'var(--ink)',
        }}>
          {studentText}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assign score</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {pointOptions.map(pt => (
            <button
              key={pt}
              onClick={() => onScoreChange(pt)}
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid',
                borderColor: score === pt ? 'var(--ink)' : 'var(--line)',
                background: score === pt ? 'var(--ink)' : 'var(--card)',
                color: score === pt ? '#fff' : 'var(--ink)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      <Field label="Feedback comment">
        <textarea
          className="input"
          rows={3}
          placeholder="Leave a comment for the student…"
          value={comment}
          onChange={e => onCommentChange(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </Field>
    </div>
  )
}

function queueTypeLabel(item: GradingQueueItem): string {
  if (item.quiz_title.toLowerCase().includes('exam')) return 'Exam'
  return 'Quiz'
}

const MANUAL_TYPES: QuestionType[] = ['short', 'essay', 'upload']

function isManualType(type: QuestionType): boolean {
  return MANUAL_TYPES.includes(type)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GradingQueuePage() {
  const router = useRouter()
  const { data: queue = [], isLoading, isError } = useGradingQueue()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [autoExpanded, setAutoExpanded] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState('')
  const [manualScores, setManualScores] = useState<Record<string, number | null>>({})
  const [manualComments, setManualComments] = useState<Record<string, string>>({})

  useEffect(() => {
    if (queue.length > 0 && !activeId) {
      setActiveId(queue[0].attempt_id)
    }
  }, [queue, activeId])

  const activeIndex = queue.findIndex(g => g.attempt_id === activeId)
  const active = queue[activeIndex] as GradingQueueItem | undefined
  const attemptId = active?.attempt_id ?? ''
  const { data: attempt } = useAttempt(attemptId)
  const gradeAnswer = useGradeAnswer(attemptId)
  const completeGrading = useCompleteGrading(attemptId)

  const manualQuestions = active?.answers ?? []
  const autoGradedAnswers = (attempt?.answers ?? []).filter(
    a => a.question && !isManualType(a.question.type)
  )

  const goNext = () => {
    if (activeIndex < queue.length - 1) setActiveId(queue[activeIndex + 1].attempt_id)
  }
  const goPrev = () => {
    if (activeIndex > 0) setActiveId(queue[activeIndex - 1].attempt_id)
  }

  const manualTotal = manualQuestions.reduce((s, q) => s + (manualScores[q.id] ?? 0), 0)
  const manualMaxTotal = manualQuestions.reduce((s, q) => s + q.points, 0)
  const autoScore = attempt?.auto_score ?? 0
  const totalPoints = (attempt?.answers ?? []).reduce(
    (s, a) => s + (a.question?.points ?? 0),
    0
  ) || manualMaxTotal + autoGradedAnswers.length
  const combined = autoScore + manualTotal
  const finalPct = totalPoints > 0 ? Math.round((combined / totalPoints) * 100) : 0

  const handleScoreChange = (answerId: string, score: number) => {
    setManualScores(sc => ({ ...sc, [answerId]: score }))
    gradeAnswer.mutate({
      answerId,
      payload: { score, feedback: manualComments[answerId] ?? undefined },
    })
  }

  const handleCommentChange = (answerId: string, comment: string) => {
    setManualComments(mc => ({ ...mc, [answerId]: comment }))
  }

  const handleComplete = () => {
    completeGrading.mutate(
      { overall_feedback: overallFeedback || undefined },
      {
        onSuccess: () => {
          if (activeIndex < queue.length - 1) {
            goNext()
          }
        },
      }
    )
  }

  if (isLoading) {
    return <div className="muted card-pad">Loading grading queue…</div>
  }

  if (isError) {
    return <div className="muted card-pad">Could not load grading queue.</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, minHeight: 'calc(100vh - 80px)' }}>
      {/* Left sidebar — queue */}
      <div style={{
        borderRight: '1px solid var(--line)',
        position: 'sticky', top: 0, height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
              <ArrowLeft size={14} />
            </button>
            <h2 className="h2" style={{ margin: 0 }}>Grading queue</h2>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{queue.length} submissions</div>
        </div>

        <div style={{ flex: 1 }}>
          {queue.map(g => {
            const isActive = g.attempt_id === activeId
            return (
              <div
                key={g.attempt_id}
                onClick={() => setActiveId(g.attempt_id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--line)',
                  borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
                  background: isActive ? 'var(--brand-tint)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background .12s',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Avatar name={g.student.name} color={avatarColor(g.student.name)} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                      <b style={{ fontSize: 13 }}>{g.student.name}</b>
                      <Badge tone={queueTypeLabel(g) === 'Exam' ? 'danger' : 'brand'}>{queueTypeLabel(g)}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.quiz_title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatRelativeTime(g.submitted_at)}</span>
                      {g.pending_count > 0 && (
                        <Badge tone="warning">{g.pending_count} written</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right — submission detail */}
      {active ? (
        <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <Avatar name={active.student.name} color={avatarColor(active.student.name)} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <h2 className="h2" style={{ margin: 0 }}>{active.student.name}</h2>
                <Badge tone={queueTypeLabel(active) === 'Exam' ? 'danger' : 'brand'}>{queueTypeLabel(active)}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{active.quiz_title} · {active.course_title}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={goPrev} disabled={activeIndex === 0}>
                <ArrowLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: 'var(--muted)', padding: '0 6px', lineHeight: '28px' }}>
                {activeIndex + 1} / {queue.length}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={goNext} disabled={activeIndex === queue.length - 1}>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Auto-graded', value: `${autoScore}`, sub: 'objective questions' },
              { label: 'Manual', value: `${manualTotal}/${manualMaxTotal}`, sub: 'written questions' },
              { label: 'Combined', value: `${combined}/${totalPoints}`, sub: 'raw score' },
              { label: 'Final %', value: `${finalPct}%`, sub: finalPct >= 60 ? 'Pass' : 'Below passing', accent: true },
            ].map(s => (
              <div key={s.label} className="card card-pad">
                <div className="eyebrow" style={{ marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', color: s.accent ? 'var(--brand)' : 'var(--ink)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {autoGradedAnswers.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <button
                onClick={() => setAutoExpanded(e => !e)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'none', border: 0, cursor: 'pointer',
                  fontWeight: 600, fontSize: 14,
                }}
              >
                <span>Auto-graded questions</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone="success">{autoScore} pts</Badge>
                  <ChevronDown size={14} style={{ transform: autoExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                </div>
              </button>
              {autoExpanded && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '0 16px 14px' }}>
                  {autoGradedAnswers.map((a, i) => {
                    const earned = (a.auto_score ?? 0) > 0
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '12px 0',
                          borderBottom: i < autoGradedAnswers.length - 1 ? '1px solid var(--line)' : '0',
                        }}
                      >
                        {earned
                          ? <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                          : <X size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                        }
                        <div style={{ flex: 1, fontSize: 13 }}>{a.question?.prompt}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                          {a.auto_score ?? 0}/{a.question?.points ?? 0}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <h3 className="h2" style={{ marginBottom: 16 }}>Written questions</h3>
            {manualQuestions.length === 0 ? (
              <div className="muted" style={{ fontSize: 13 }}>No manual questions in this submission.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {manualQuestions.map(mq => (
                  <div key={mq.id} className="card card-pad">
                    <ManualGrader
                      question={mq}
                      score={manualScores[mq.id] ?? null}
                      comment={manualComments[mq.id] ?? ''}
                      onScoreChange={s => handleScoreChange(mq.id, s)}
                      onCommentChange={c => handleCommentChange(mq.id, c)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <Field label="Overall feedback">
              <textarea
                className="input"
                rows={4}
                placeholder="Write overall feedback visible to the student after return…"
                value={overallFeedback}
                onChange={e => setOverallFeedback(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled>
                <Sparkle size={13} /> AI draft feedback
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="brand"
                onClick={handleComplete}
                disabled={completeGrading.isPending}
              >
                {completeGrading.isPending ? 'Returning…' : 'Return graded'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-pad muted" style={{ fontSize: 14 }}>Select a submission from the queue.</div>
      )}
    </div>
  )
}
