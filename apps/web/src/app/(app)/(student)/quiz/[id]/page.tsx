'use client'
import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Clock, ArrowLeft, ArrowRight, Flag, Check, Sparkle } from '@/components/ui'
import { MatchPairs } from '@/components/quiz/MatchPairs'
import { useQuiz } from '@/hooks/assessment/useQuiz'
import { useAttempt, useSaveAnswers, useStartAttempt, useSubmitAttempt } from '@/hooks/assessment/useAttempt'
import { answerToPayload, countWords, getMatchPairs, getMcqOptions, textAnswerValue } from '@/lib/quiz/helpers'
import type { QuizQuestion } from '@/types/assessment'

type MatchValue = Record<string, number>
type Answers = Record<string, unknown>

function parseAnswerValue(
  question: QuizQuestion,
  raw: Record<string, unknown> | null | undefined
): unknown {
  if (!raw) return undefined
  switch (question.type) {
    case 'mcq':
      return raw.selected
    case 'tf':
      return raw.value
    case 'fib':
      return raw.blanks
    case 'short':
    case 'essay':
      return raw.text
    case 'match':
      return raw.matches ?? raw.pairs
    case 'code':
      return raw.output
    default:
      return raw
  }
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data: quiz, isLoading: quizLoading, isError: quizError } = useQuiz(id)
  const startAttempt = useStartAttempt()
  const startRequested = useRef(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const { data: attempt } = useAttempt(attemptId ?? '')
  const saveAnswers = useSaveAnswers(attemptId ?? '')
  const submitAttempt = useSubmitAttempt(attemptId ?? '')

  useEffect(() => {
    if (!quiz || attemptId || startRequested.current) return
    startRequested.current = true

    startAttempt.mutate(id, {
      onSuccess: (started) => {
        setAttemptId(started.id)
        const seeded: Answers = {}
        for (const a of started.answers ?? []) {
          if (a.answer) {
            const q = a.question
            if (q) {
              const parsed = parseAnswerValue(q, a.answer)
              if (parsed !== undefined && parsed !== null) {
                seeded[a.question_id] = parsed
              } else if (q.type === 'short' || q.type === 'essay') {
                seeded[a.question_id] = ''
              }
            }
          }
        }
        if (Object.keys(seeded).length > 0) setAnswers(seeded)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once per quiz load; startAttempt identity changes every render
  }, [quiz, attemptId, id])

  const questions = quiz?.questions ?? []
  const q = questions[idx]
  const total = questions.length
  const isSubmitted = attempt?.status === 'submitted' || attempt?.status === 'graded'

  const persistAnswer = (questionId: string, question: QuizQuestion, value: unknown) => {
    if (!attemptId || isSubmitted) return
    saveAnswers.mutate({
      answers: [answerToPayload(questionId, question.type, value)],
    })
  }

  const answer = (val: unknown) => {
    if (!q) return
    setAnswers(a => ({ ...a, [q.id]: val }))
    persistAnswer(q.id, q, val)
  }

  const handleSubmit = () => {
    if (!attemptId || !quiz) return
    const payload = questions
      .filter(qq => answers[qq.id] != null)
      .map(qq => answerToPayload(qq.id, qq.type, answers[qq.id]))

    const doSubmit = () => submitAttempt.mutate()

    if (payload.length > 0) {
      saveAnswers.mutate({ answers: payload }, { onSuccess: doSubmit })
    } else {
      doSubmit()
    }
  }

  if (quizLoading || (!attemptId && !startAttempt.isError)) {
    return <div className="muted card-pad">Loading quiz…</div>
  }

  if (quizError || !quiz) {
    return <div className="muted card-pad">Could not load this quiz.</div>
  }

  if (startAttempt.isError) {
    const message =
      (startAttempt.error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? 'Could not start quiz attempt.'
    return (
      <div className="card card-pad">
        <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{message}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    )
  }

  if (!q) {
    return <div className="muted card-pad">This quiz has no questions yet.</div>
  }

  const cur = answers[q.id]

  const typeLabelMap: Record<string, string> = {
    mcq: 'Multiple choice',
    tf: 'True / False',
    fib: 'Fill in the blank',
    short: 'Short answer',
    match: 'Match pairs',
    essay: 'Essay',
    code: 'Code',
    upload: 'File upload',
  }
  const typeLabel = typeLabelMap[q.type] ?? q.type

  const mcqOptions = getMcqOptions(q)
  const matchPairs = getMatchPairs(q)
  const fibBlanks = (q.config.blanks as string[] | undefined) ?? []
  const blankCount = fibBlanks.length > 0 ? fibBlanks.length : 1

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Quiz</div>
          <h1 className="h2">{quiz.title}</h1>
        </div>
        <div className="row">
          <div className="row" style={{ color: 'var(--muted)', fontSize: 13 }}>
            <Clock size={14} />
            {quiz.time_limit_minutes ? `~${quiz.time_limit_minutes} min` : 'No time limit'}
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => router.push(`/courses/${quiz.course_id}`)}
          >
            Exit
          </button>
        </div>
      </div>

      {isSubmitted && attempt && (
        <div className="card card-pad-lg" style={{ marginBottom: 24 }}>
          <Badge tone={attempt.status === 'graded' ? 'success' : 'brand'}>
            {attempt.status === 'graded' ? 'Graded' : 'Submitted'}
          </Badge>
          <div style={{ marginTop: 12, fontSize: 15 }}>
            {attempt.total_score != null ? (
              <>
                Your score: <b>{attempt.total_score}</b>
                {quiz.passing_score != null && (
                  <span className="muted" style={{ marginLeft: 8 }}>
                    (passing: {quiz.passing_score}%)
                  </span>
                )}
              </>
            ) : (
              <span className="muted">Your answers are with your instructor for review.</span>
            )}
          </div>
          {attempt.overall_feedback && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)' }}>{attempt.overall_feedback}</div>
          )}
        </div>
      )}

      <div className="quiz-shell">
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
            {questions.map((qq, i) => (
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

        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 14, gap: 8 }}>
            <Badge tone="brand">{typeLabel}</Badge>
            <span className="muted" style={{ fontSize: 12 }}>{q.points} point{q.points === 1 ? '' : 's'}</span>
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

          {q.type === 'mcq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mcqOptions.map((o, i) => (
                <div
                  key={o.id}
                  className={`choice${cur === o.id ? ' selected' : ''}`}
                  onClick={() => !isSubmitted && answer(o.id)}
                >
                  <div className="letter">{String.fromCharCode(65 + i)}</div>
                  <div style={{ flex: 1, fontSize: 15, lineHeight: 1.5 }}>{o.text}</div>
                </div>
              ))}
            </div>
          )}

          {q.type === 'tf' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([true, false] as const).map(v => (
                <div
                  key={String(v)}
                  className={`choice${cur === v ? ' selected' : ''}`}
                  onClick={() => !isSubmitted && answer(v)}
                  style={{ justifyContent: 'center', padding: 22 }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>
                    {v ? 'True' : 'False'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.type === 'fib' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Array.from({ length: blankCount }, (_, i) => (
                <div key={i}>
                  <label className="label">Blank {i + 1}</label>
                  <input
                    className="input input-lg"
                    placeholder="Type your answer..."
                    value={((cur as string[] | undefined) ?? [])[i] ?? ''}
                    disabled={isSubmitted}
                    onChange={e => {
                      const arr = [...((cur as string[] | undefined) ?? Array(blankCount).fill(''))]
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

          {(q.type === 'short' || q.type === 'essay') && (
            <div>
              <textarea
                className="textarea"
                rows={q.type === 'essay' ? 10 : 6}
                placeholder="Write your answer…"
                value={textAnswerValue(cur)}
                disabled={isSubmitted}
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
                <span>{countWords(cur)} words</span>
                <span>Reviewed by your instructor</span>
              </div>
            </div>
          )}

          {q.type === 'match' && (
            <MatchPairs
              pairs={matchPairs.map(p => ({ l: p.l, r: p.r ?? '' }))}
              value={(cur as MatchValue | undefined) ?? {}}
              onChange={val => !isSubmitted && answer(val)}
            />
          )}

          {q.type === 'code' && (
            <textarea
              className="textarea"
              rows={8}
              placeholder="Write your code…"
              value={textAnswerValue(cur)}
              disabled={isSubmitted}
              onChange={e => answer(e.target.value)}
            />
          )}
        </div>

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
            <button className="btn btn-ghost" disabled>
              <Flag size={14} /> Flag for review
            </button>
            {!isSubmitted && (
              idx === total - 1 ? (
                <button
                  className="btn btn-brand"
                  onClick={handleSubmit}
                  disabled={submitAttempt.isPending}
                >
                  {submitAttempt.isPending ? 'Submitting…' : 'Submit quiz'} <Check size={14} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                  Next <ArrowRight size={14} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
