'use client'
import { use, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Clock, ArrowLeft, ArrowRight, Flag, Check, Sparkle } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

// ---- MatchPairs (local component, not exported) ----

type Pair = { l: string; r: string }
type MatchValue = Record<string, number>

function MatchPairs({
  pairs,
  value = {},
  onChange,
}: {
  pairs: readonly Pair[]
  value?: MatchValue
  onChange: (val: MatchValue) => void
}) {
  const shuffled = useMemo(
    () => [...pairs].map((p, i) => ({ ...p, _i: i })).sort((a, b) => a.r.length - b.r.length),
    [pairs],
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pairs.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              border: '1px solid var(--line-2)',
              background: 'var(--card)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div className="letter" style={{ width: 22, height: 22, fontSize: 11 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>{p.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shuffled.map((p, i) => {
          const matchedTo = Object.entries(value).find(([, v]) => v === p._i)?.[0]
          return (
            <select
              key={i}
              value={matchedTo ?? ''}
              onChange={e => {
                const newVal = { ...value }
                Object.keys(newVal).forEach(k => {
                  if (newVal[k] === p._i) delete newVal[k]
                })
                if (e.target.value !== '') newVal[e.target.value] = p._i
                onChange(newVal)
              }}
              className="select"
              style={{ height: 46, fontSize: 14 }}
            >
              <option value="">— matches with —</option>
              {pairs.map((_, li) => (
                <option key={li} value={li}>
                  {li + 1}. {pairs[li].l.slice(0, 50)}
                  {pairs[li].l.length > 50 ? '…' : ''}
                </option>
              ))}
            </select>
          )
        })}
        <div style={{ marginTop: 6 }}>
          {shuffled.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                color: 'var(--ink-2)',
                borderLeft: '2px solid var(--line-2)',
                marginLeft: 10,
                marginTop: 4,
              }}
            >
              <span
                className="muted"
                style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginRight: 6 }}
              >
                {String.fromCharCode(65 + i)}.
              </span>
              {p.r}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Quiz page ----

type Answers = Record<string, unknown>

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const quiz = MOCK.quiz
  const q = quiz.questions[idx]
  const total = quiz.questions.length

  const answer = (val: unknown) => setAnswers(a => ({ ...a, [q.id]: val }))
  const cur = answers[q.id]

  const handleSubmit = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quiz-answers', JSON.stringify(answers))
    }
    router.push('/results/demo')
  }

  void id // used to satisfy route param typing

  if (submitted) {
    handleSubmit()
    return null
  }

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
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                router.push('/courses/1')
              }}
            >
              English B2
            </a>{' '}
            · Module 3
          </div>
          <h1 className="h2">{quiz.title}</h1>
        </div>
        <div className="row">
          <div className="row" style={{ color: 'var(--muted)', fontSize: 13 }}>
            <Clock size={14} /> ~{quiz.minutes} min
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => router.push('/courses/1/lessons/l15')}
          >
            Exit
          </button>
        </div>
      </div>

      <div className="quiz-shell">
        {/* Progress pips */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 12,
              color: 'var(--muted)',
              fontWeight: 600,
            }}
          >
            <span>Question {idx + 1} of {total}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${total}, 1fr)`,
              gap: 4,
            }}
          >
            {quiz.questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                style={{
                  height: 4,
                  border: 0,
                  borderRadius: 99,
                  cursor: 'pointer',
                  padding: 0,
                  background:
                    i === idx
                      ? 'var(--ink)'
                      : answers[qq.id] != null
                      ? 'var(--brand)'
                      : 'var(--line-2)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 14, gap: 8 }}>
            <Badge tone="brand">{typeLabel}</Badge>
            <span className="muted" style={{ fontSize: 12 }}>2 points</span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              lineHeight: 1.25,
              marginBottom: 24,
              letterSpacing: '-0.005em',
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
                  onClick={() => answer(o.id)}
                >
                  <div className="letter">{String.fromCharCode(65 + i)}</div>
                  <div style={{ flex: 1, fontSize: 15, lineHeight: 1.5 }}>{o.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* True / False */}
          {q.type === 'tf' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([true, false] as const).map(v => (
                <div
                  key={String(v)}
                  className={`choice${cur === v ? ' selected' : ''}`}
                  onClick={() => answer(v)}
                  style={{ justifyContent: 'center', padding: 22 }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>
                    {v ? 'True' : 'False'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fill in the blank */}
          {q.type === 'fib' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {q.blanks.map((_, i) => (
                <div key={i}>
                  <label className="label">Blank {i + 1}</label>
                  <input
                    className="input input-lg"
                    placeholder="Type your answer..."
                    value={((cur as string[] | undefined) ?? [])[i] ?? ''}
                    onChange={e => {
                      const arr = [...((cur as string[] | undefined) ?? ['', ''])]
                      arr[i] = e.target.value
                      answer(arr)
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

          {/* Short answer */}
          {q.type === 'short' && (
            <div>
              <textarea
                className="textarea"
                rows={6}
                placeholder="Write your answer in 2-3 sentences..."
                value={(cur as string | undefined) ?? ''}
                onChange={e => answer(e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                <span>
                  {((cur as string | undefined) ?? '').trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <span>Reviewed by your instructor</span>
              </div>
            </div>
          )}

          {/* Match pairs */}
          {q.type === 'match' && (
            <MatchPairs
              pairs={q.pairs}
              value={(cur as MatchValue | undefined) ?? {}}
              onChange={answer}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 28,
          }}
        >
          <button
            className="btn btn-secondary"
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost">
              <Flag size={14} /> Flag for review
            </button>
            {idx === total - 1 ? (
              <button className="btn btn-brand" onClick={() => setSubmitted(true)}>
                Submit quiz <Check size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
