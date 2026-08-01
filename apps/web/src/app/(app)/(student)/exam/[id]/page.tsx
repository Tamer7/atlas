'use client'
import { use, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Clock,
  ClipboardCheck,
  ListChecks,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Flag,
  Sparkle,
} from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { MatchPairs } from '@/components/quiz/MatchPairs'

// ---- Exam page ----

type MatchValue = Record<string, number>

type Answers = Record<string, unknown>
type Flagged = Record<string, boolean>

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const exam = MOCK.exam
  const [started, setStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(exam.duration * 60)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [flagged, setFlagged] = useState<Flagged>({})

  useEffect(() => {
    if (!started) return
    const intervalId = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(intervalId)
  }, [started])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const examQs = useMemo(() => {
    const base = MOCK.quiz.questions
    const arr = []
    for (let i = 0; i < exam.questions; i++) arr.push({ ...base[i % base.length], id: 'ex' + i })
    return arr
  }, [exam.questions])

  void id // satisfies route param typing

  // ---- Pre-flight lobby ----
  if (!started) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: 32,
        }}
      >
        <div className="card card-pad-lg" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 12,
              background: 'var(--danger-tint)',
              color: 'var(--danger)',
              borderRadius: '50%',
              marginBottom: 20,
            }}
          >
            <ClipboardCheck size={28} />
          </div>
          <h1 className="h1" style={{ marginBottom: 12 }}>
            {exam.title}
          </h1>
          <p
            className="muted"
            style={{
              marginBottom: 28,
              fontSize: 15,
              maxWidth: 420,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            You&apos;re about to start a <b>{exam.duration}-minute timed exam</b>. Once you begin,
            the timer doesn&apos;t stop — even if you close the tab.
          </p>

          <div
            className="g g-sm g-3"
            style={{ marginBottom: 28, textAlign: 'left' }}
          >
            <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
              <Clock size={16} color="var(--brand)" />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                Duration
              </div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{exam.duration} min</div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
              <ListChecks size={16} color="var(--brand)" />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                Questions
              </div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{exam.questions}</div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
              <Trophy size={16} color="var(--brand)" />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                Points
              </div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{exam.pointsTotal}</div>
            </div>
          </div>

          <div
            style={{
              padding: 14,
              background: 'var(--warning-tint)',
              color: 'var(--warning)',
              borderRadius: 'var(--r-md)',
              textAlign: 'left',
              marginBottom: 24,
              fontSize: 13,
            }}
          >
            <b>Honor pledge.</b> By starting this exam you confirm you will work independently. Tab
            switching is logged.
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-secondary btn-lg btn-block"
              onClick={() => router.push('/courses/1')}
            >
              Cancel
            </button>
            <button
              className="btn btn-brand btn-lg btn-block"
              onClick={() => setStarted(true)}
            >
              Start exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Exam in progress ----
  const q = examQs[qIdx]
  const cur = answers[q.id]
  const warn = secondsLeft < 600

  const typeLabelMap: Record<string, string> = {
    mcq: 'Multiple choice',
    tf: 'True / False',
    fib: 'Fill in the blank',
    short: 'Short answer',
    match: 'Match pairs',
  }
  const typeLabel = typeLabelMap[q.type] ?? q.type

  return (
    <div>
      {/* Top exam banner */}
      <div
        className="exam-banner"
        style={{ marginBottom: 24, background: warn ? 'var(--danger)' : 'var(--ink)' }}
      >
        <Clock size={18} />
        <div className="exam-timer">{fmt(secondsLeft)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{exam.title}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Question {qIdx + 1} of {exam.questions} · {Object.keys(answers).length} answered
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.25)',
            color: '#fff',
          }}
        >
          Save &amp; exit
        </button>
        <button
          className="btn btn-sm"
          style={{ background: '#fff', color: 'var(--ink)' }}
          onClick={() => router.push('/results/demo')}
        >
          Submit early
        </button>
      </div>

      <div className="g g-lg g-aside">
        {/* Question area */}
        <div>
          <div className="card card-pad-lg">
            <div className="row" style={{ marginBottom: 14, gap: 8 }}>
              <Badge tone="brand">Section II · Grammar</Badge>
              <Badge>Question {qIdx + 1}</Badge>
              <div style={{ flex: 1 }} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setFlagged(f => ({ ...f, [q.id]: !f[q.id] }))
                }
              >
                <Flag
                  size={12}
                  color={flagged[q.id] ? 'var(--accent)' : 'var(--muted)'}
                />{' '}
                {flagged[q.id] ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                lineHeight: 1.25,
                marginBottom: 24,
              }}
            >
              {q.prompt}
            </div>

            {/* MCQ */}
            {q.type === 'mcq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((o, i) => (
                  <div
                    key={o.id}
                    className={`choice${cur === o.id ? ' selected' : ''}`}
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: o.id }))}
                  >
                    <div className="letter">{String.fromCharCode(65 + i)}</div>
                    <div style={{ flex: 1, fontSize: 15 }}>{o.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* True / False */}
            {q.type === 'tf' && (
              <div className="g g-sm g-2">
                {([true, false] as const).map(v => (
                  <div
                    key={String(v)}
                    className={`choice${cur === v ? ' selected' : ''}`}
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                    style={{ justifyContent: 'center', padding: 22 }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>
                      {v ? 'True' : 'False'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Short answer */}
            {q.type === 'short' && (
              <textarea
                className="textarea"
                rows={6}
                placeholder="Write your answer..."
                value={(cur as string | undefined) ?? ''}
                onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              />
            )}

            {/* Fill in the blank */}
            {q.type === 'fib' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.blanks.map((_, i) => (
                  <div key={i}>
                    <label className="label">Blank {i + 1}</label>
                    <input
                      className="input input-lg"
                      placeholder={`Blank ${i + 1}...`}
                      value={((cur as string[] | undefined) ?? [])[i] ?? ''}
                      onChange={e => {
                        const arr = [...((cur as string[] | undefined) ?? ['', ''])]
                        arr[i] = e.target.value
                        setAnswers(a => ({ ...a, [q.id]: arr }))
                      }}
                    />
                  </div>
                ))}
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--muted)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sparkle size={12} /> Don&apos;t worry about minor capitalization — we&apos;re forgiving.
                </div>
              </div>
            )}

            {/* Match pairs */}
            {q.type === 'match' && (
              <MatchPairs
                pairs={q.pairs}
                value={(cur as MatchValue | undefined) ?? {}}
                onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))}
              />
            )}
          </div>

          {/* Footer navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button
              className="btn btn-secondary"
              disabled={qIdx === 0}
              onClick={() => setQIdx(qIdx - 1)}
            >
              <ArrowLeft size={14} /> Previous
            </button>
            {qIdx === examQs.length - 1 ? (
              <button
                className="btn btn-brand"
                onClick={() => router.push('/results/demo')}
              >
                Submit exam
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setQIdx(Math.min(examQs.length - 1, qIdx + 1))}
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right rail — question palette */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Question palette
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {examQs.map((eq, i) => {
              const isAnswered = answers[eq.id] != null
              const isFlagged = flagged[eq.id]
              const isCur = i === qIdx
              return (
                <button
                  key={eq.id}
                  onClick={() => setQIdx(i)}
                  style={{
                    aspectRatio: '1',
                    border: 0,
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    background: isCur
                      ? 'var(--ink)'
                      : isAnswered
                      ? 'var(--success-tint)'
                      : 'var(--paper-2)',
                    color: isCur
                      ? 'var(--paper)'
                      : isAnswered
                      ? 'var(--success)'
                      : 'var(--ink-2)',
                    position: 'relative',
                    outline: isFlagged ? '2px solid var(--accent)' : 'none',
                    outlineOffset: -2,
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <hr className="divider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: 'var(--ink)', borderRadius: 3 }} />
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: 'var(--success-tint)',
                  borderRadius: 3,
                }}
              />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{ width: 12, height: 12, background: 'var(--paper-2)', borderRadius: 3 }}
              />
              <span>Unanswered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: 'var(--paper-2)',
                  borderRadius: 3,
                  outline: '2px solid var(--accent)',
                  outlineOffset: -2,
                }}
              />
              <span>Flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
