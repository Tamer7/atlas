'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Field } from '@/components/ui'
import { Sparkle, Check, X, ArrowLeft, ArrowRight, ChevronDown } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

// ─── Types ───────────────────────────────────────────────────────────────────

type GradingItem = typeof MOCK.gradingQueue[number]

interface ManualQuestion {
  id: string
  prompt: string
  studentAnswer: string
  points: number
  aiScore: number
  aiNotes: string
}

// ─── ManualGrader (local component) ──────────────────────────────────────────

function ManualGrader({
  question,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: {
  question: ManualQuestion
  score: number | null
  comment: string
  onScoreChange: (s: number) => void
  onCommentChange: (c: string) => void
}) {
  const pointOptions = Array.from({ length: question.points + 1 }, (_, i) => i)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Prompt */}
      <div style={{ fontSize: 14, fontWeight: 600 }}>{question.prompt}</div>

      {/* Student answer */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Student answer</div>
        <div style={{
          background: 'var(--paper-2)', borderRadius: 8,
          padding: '12px 14px', fontSize: 13, lineHeight: 1.6,
          color: 'var(--ink)',
        }}>
          {question.studentAnswer}
        </div>
      </div>

      {/* AI suggestion */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-tint) 0%, var(--paper-2) 100%)',
        border: '1px solid var(--brand-tint)',
        borderRadius: 8, padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Sparkle size={14} color="var(--brand)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>AI suggestion</span>
          <Badge tone="brand">{question.aiScore}/{question.points}</Badge>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{question.aiNotes}</div>
      </div>

      {/* Score picker */}
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

      {/* Comment */}
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

// ─── Mock manual questions for the active submission ─────────────────────────

const MANUAL_QUESTIONS: ManualQuestion[] = [
  {
    id: 'mq1',
    prompt: 'In your own words, when would you choose a mixed conditional over a regular second or third conditional?',
    studentAnswer: "I would use a mixed conditional when I want to talk about a past action that still has a consequence in the present. For example, 'If I hadn't moved abroad, I wouldn't be fluent today' — the past action (moving abroad) is causing my present state (being fluent).",
    points: 4,
    aiScore: 3,
    aiNotes: 'Student demonstrates good conceptual understanding of the past→present structure with a clear example. Missing explicit contrast with pure 2nd/3rd conditionals. Suggest 3/4.',
  },
  {
    id: 'mq2',
    prompt: 'Correct the error in this sentence and explain why: "If I would study harder, I had passed the exam."',
    studentAnswer: "The correct form is 'If I had studied harder, I would have passed the exam.' The original mixes modal verb forms incorrectly — 'would study' in the if-clause is wrong; it should use past perfect 'had studied'.",
    points: 3,
    aiScore: 3,
    aiNotes: 'Correct identification of error and clear explanation. Full marks appropriate.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GradingQueuePage() {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string>(MOCK.gradingQueue[0].id)
  const [autoExpanded, setAutoExpanded] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState('')
  const [manualScores, setManualScores] = useState<Record<string, number | null>>({})
  const [manualComments, setManualComments] = useState<Record<string, string>>({})

  const activeIndex = MOCK.gradingQueue.findIndex(g => g.id === activeId)
  const active = MOCK.gradingQueue[activeIndex] as GradingItem | undefined

  const goNext = () => {
    if (activeIndex < MOCK.gradingQueue.length - 1) setActiveId(MOCK.gradingQueue[activeIndex + 1].id)
  }
  const goPrev = () => {
    if (activeIndex > 0) setActiveId(MOCK.gradingQueue[activeIndex - 1].id)
  }

  const manualTotal = MANUAL_QUESTIONS.reduce((s, q) => {
    const sc = manualScores[q.id]
    return s + (sc ?? 0)
  }, 0)
  const manualMaxTotal = MANUAL_QUESTIONS.reduce((s, q) => s + q.points, 0)
  const autoScore = active?.autoScore ?? 0
  const total = active?.total ?? 10
  const combined = autoScore + manualTotal
  const finalPct = Math.round((combined / total) * 100)

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
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{MOCK.gradingQueue.length} submissions</div>
        </div>

        <div style={{ flex: 1 }}>
          {MOCK.gradingQueue.map(g => {
            const isActive = g.id === activeId
            return (
              <div
                key={g.id}
                onClick={() => setActiveId(g.id)}
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
                  <Avatar name={g.student} color={g.color} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                      <b style={{ fontSize: 13 }}>{g.student}</b>
                      <Badge tone={g.type === 'Exam' ? 'danger' : 'brand'}>{g.type}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.item}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{g.submitted}</span>
                      {g.needsReview > 0 && (
                        <Badge tone="warning">{g.needsReview} written</Badge>
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
      {active && (
        <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <Avatar name={active.student} color={active.color} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <h2 className="h2" style={{ margin: 0 }}>{active.student}</h2>
                <Badge tone={active.type === 'Exam' ? 'danger' : 'brand'}>{active.type}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{active.item} · {active.course}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={goPrev} disabled={activeIndex === 0}>
                <ArrowLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: 'var(--muted)', padding: '0 6px', lineHeight: '28px' }}>
                {activeIndex + 1} / {MOCK.gradingQueue.length}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={goNext} disabled={activeIndex === MOCK.gradingQueue.length - 1}>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Score summary boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Auto-graded', value: active.autoScore != null ? `${active.autoScore}/${active.total - manualMaxTotal}` : '—', sub: 'objective questions' },
              { label: 'Manual',      value: `${manualTotal}/${manualMaxTotal}`, sub: 'written questions' },
              { label: 'Combined',    value: `${combined}/${total}`, sub: 'raw score' },
              { label: 'Final %',     value: `${finalPct}%`, sub: finalPct >= 60 ? 'Pass' : 'Below passing', accent: true },
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

          {/* Auto-graded section (collapsible) */}
          {active.autoScore != null && (
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
                  <Badge tone="success">{active.autoScore}/{active.total - manualMaxTotal}</Badge>
                  <ChevronDown size={14} style={{ transform: autoExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                </div>
              </button>
              {autoExpanded && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '0 16px 14px' }}>
                  {MOCK.quiz.questions.filter(q => q.type !== 'short').slice(0, 3).map((q, i) => (
                    <div
                      key={q.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 0',
                        borderBottom: i < 2 ? '1px solid var(--line)' : '0',
                      }}
                    >
                      {i % 3 === 2
                        ? <X size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                        : <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                      }
                      <div style={{ flex: 1, fontSize: 13 }}>{q.prompt}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                        {i % 3 === 2 ? '0' : '1'}/1
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual questions */}
          <div style={{ marginBottom: 28 }}>
            <h3 className="h2" style={{ marginBottom: 16 }}>Written questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {MANUAL_QUESTIONS.map(mq => (
                <div key={mq.id} className="card card-pad">
                  <ManualGrader
                    question={mq}
                    score={manualScores[mq.id] ?? null}
                    comment={manualComments[mq.id] ?? ''}
                    onScoreChange={s => setManualScores(sc => ({ ...sc, [mq.id]: s }))}
                    onCommentChange={c => setManualComments(mc => ({ ...mc, [mq.id]: c }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Overall feedback */}
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

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm">
                <Sparkle size={13} /> AI draft feedback
              </button>
              <button className="btn btn-secondary btn-sm">🎤 Voice note</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary">Save draft</Button>
              <Button variant="brand">Return graded</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
