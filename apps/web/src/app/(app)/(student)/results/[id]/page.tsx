'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Stat, ArrowRight, Check, Clock } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

type QuizQuestion = (typeof MOCK.quiz.questions)[number]

function typeLabel(type: QuizQuestion['type']) {
  if (type === 'mcq') return 'Multiple choice'
  if (type === 'tf') return 'True / False'
  if (type === 'fib') return 'Fill blank'
  if (type === 'short') return 'Short answer'
  if (type === 'match') return 'Match'
  return type
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  void id // route param — could be used to load real data later

  const quiz = MOCK.quiz

  // Mock hardcoded results as specified
  const score = 80
  const correct = 4
  const autoTotal = 4
  const pending = 1

  // Build a breakdown using the real question list but mock correct/pending state
  const breakdown = quiz.questions.map((q, i) => {
    // q4 (short answer) is always pending; first 4 auto-graded with 4 correct
    const isShort = q.type === 'short'
    const isCorrect = !isShort && i < correct
    return {
      q,
      correct: isShort ? null : isCorrect,
    }
  })

  const circumference = 377
  const dash = (score / 100) * circumference

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">English B2 · Module 3</div>
          <h1 className="h2">Quiz results · Mixed Conditionals</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={() => router.push('/courses/1')}>
            Back to course
          </button>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/courses/1/lessons/l15')}
          >
            Continue to next lesson <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Score hero */}
      <div
        className="card card-pad-lg"
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--card) 0%, var(--paper-2) 100%)',
        }}
      >
        {/* Score ring */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--line-2)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="10"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 48,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {score}
              </div>
              <div
                className="muted"
                style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}
              >
                auto-graded
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Badge tone="success">Passed</Badge>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              letterSpacing: '-0.01em',
              margin: '10px 0 8px',
            }}
          >
            Strong work, <em>Sofia</em>.
          </div>
          <p className="muted" style={{ maxWidth: 480 }}>
            You scored{' '}
            <b style={{ color: 'var(--ink)' }}>
              {correct} out of {autoTotal}
            </b>{' '}
            on auto-graded questions.{' '}
            {pending > 0 && (
              <>
                The remaining{' '}
                <b style={{ color: 'var(--ink)' }}>
                  {pending} written answer{pending > 1 ? 's are' : ' is'}
                </b>{' '}
                with your instructor for review.
              </>
            )}
          </p>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Stat label="Class average" value="74%" />
          <Stat label="Your time" value="6:42" sub={`of ${quiz.minutes}:00`} />
        </div>
      </div>

      {/* Question breakdown */}
      <h2 className="h2" style={{ marginBottom: 16 }}>Question-by-question breakdown</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {breakdown.map((b, i) => (
          <div key={b.q.id} className="q-item">
            <div className="row" style={{ marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background:
                    b.correct === true
                      ? 'var(--success-tint)'
                      : b.correct === false
                      ? 'var(--danger-tint)'
                      : 'var(--warning-tint)',
                  color:
                    b.correct === true
                      ? 'var(--success)'
                      : b.correct === false
                      ? 'var(--danger)'
                      : 'var(--warning)',
                }}
              >
                {b.correct === true ? (
                  <Check size={14} />
                ) : b.correct === false ? (
                  <span style={{ fontSize: 13, fontWeight: 700 }}>✗</span>
                ) : (
                  <Clock size={14} />
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                Q{i + 1}
              </div>
              <Badge>{typeLabel(b.q.type)}</Badge>
              <div style={{ flex: 1 }} />
              {b.correct === null && <Badge tone="warning">Pending review</Badge>}
              <div className="muted mono" style={{ fontSize: 12 }}>
                {b.correct === true ? '+2' : b.correct === false ? '0' : '—'} / 2
              </div>
            </div>
            <div style={{ fontSize: 15, marginBottom: 10, color: 'var(--ink-2)' }}>
              {b.q.prompt}
            </div>

            {b.correct === true && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--success)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Check size={14} /> Your answer was correct.
              </div>
            )}

            {b.correct === false && b.q.type === 'mcq' && (() => {
              const mcq = b.q
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  <div className="choice wrong">
                    <div className="letter">?</div>
                    <div style={{ flex: 1, fontSize: 13 }}>Your answer (not recorded in mock)</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)' }}>
                      YOUR ANSWER
                    </span>
                  </div>
                  <div className="choice correct">
                    <div className="letter">
                      {String.fromCharCode(
                        65 + mcq.options.findIndex(o => o.id === mcq.answer),
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      {mcq.options.find(o => o.id === mcq.answer)?.text}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>
                      CORRECT
                    </span>
                  </div>
                </div>
              )
            })()}

            {b.correct === null && (
              <div
                style={{
                  padding: 12,
                  background: 'var(--warning-tint)',
                  borderRadius: 'var(--r-md)',
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--warning)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Your answer · awaiting instructor review
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  (submitted for grading)
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginTop: 32,
          marginBottom: 24,
        }}
      >
        <button className="btn btn-secondary btn-lg" onClick={() => router.push('/quiz/q1')}>
          Retake quiz
        </button>
        <button
          className="btn btn-brand btn-lg"
          onClick={() => router.push('/courses/1/lessons/l15')}
        >
          Continue to next lesson <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
