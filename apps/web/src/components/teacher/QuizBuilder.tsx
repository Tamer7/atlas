'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge, Field, SegControl } from '@/components/ui'
import { Plus, Trash, Copy, ArrowLeft, Check, X } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useCreateQuiz, useUpdateQuiz } from '@/hooks/assessment/useQuizzes'
import { builderQuestionToPayload } from '@/lib/quiz/helpers'
import type { CreateQuizPayload, Quiz, QuizQuestion } from '@/types/assessment'

// Types

type QuestionType = 'mcq' | 'tf' | 'fib' | 'short' | 'match' | 'essay' | 'code' | 'upload'

interface McqOption { id: string; text: string }
interface MatchPair { l: string; r: string }

interface Question {
  id: string
  type: QuestionType
  prompt: string
  points: number
  // mcq
  options?: McqOption[]
  answer?: string
  // tf
  tfAnswer?: boolean | null
  // fib
  blanks?: string[]
  // short / essay
  rubric?: string
  wordMin?: number
  wordMax?: number
  // match
  pairs?: MatchPair[]
  // code
  language?: string
  expectedOutput?: string
}

// ─── Question type definitions ──────────────────────────────────

const QUESTION_TYPES: { type: QuestionType; icon: string; label: string; desc: string }[] = [
  { type: 'mcq',    icon: 'O', label: 'Multiple Choice', desc: 'Choose one answer' },
  { type: 'tf',     icon: 'T', label: 'True / False',    desc: 'Binary choice' },
  { type: 'fib',    icon: '_', label: 'Fill in Blank',   desc: 'Complete the gaps' },
  { type: 'short',  icon: 'A', label: 'Short Answer',    desc: 'Brief typed response' },
  { type: 'match',  icon: '<>', label: 'Matching',        desc: 'Connect the pairs' },
  { type: 'essay',  icon: 'E', label: 'Essay',           desc: 'Long-form writing' },
  { type: 'code',   icon: '{}', label: 'Code',           desc: 'Programming answer' },
  { type: 'upload', icon: '^', label: 'File Upload',     desc: 'Submit a file' },
]

// ─── QuestionEditor (local component) ───────────────────────────

function QuestionEditor({
  q, index, onUpdate, onDelete, onDuplicate,
}: {
  q: Question
  index: number
  onUpdate: (updated: Question) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  const typeDef = QUESTION_TYPES.find(t => t.type === q.type)

  const set = (patch: Partial<Question>) => onUpdate({ ...q, ...patch })

  // MCQ helpers
  const addOption = () => {
    const opts = q.options ?? []
    set({ options: [...opts, { id: `o${Date.now()}`, text: '' }] })
  }
  const updateOption = (id: string, text: string) =>
    set({ options: (q.options ?? []).map(o => o.id === id ? { ...o, text } : o) })
  const removeOption = (id: string) =>
    set({ options: (q.options ?? []).filter(o => o.id !== id) })

  // Match pair helpers
  const addPair = () => set({ pairs: [...(q.pairs ?? []), { l: '', r: '' }] })
  const updatePair = (i: number, side: 'l' | 'r', val: string) =>
    set({ pairs: (q.pairs ?? []).map((p, pi) => pi === i ? { ...p, [side]: val } : p) })
  const removePair = (i: number) =>
    set({ pairs: (q.pairs ?? []).filter((_, pi) => pi !== i) })

  // Blank helpers
  const addBlank = () => set({ blanks: [...(q.blanks ?? []), ''] })
  const updateBlank = (i: number, val: string) =>
    set({ blanks: (q.blanks ?? []).map((b, bi) => bi === i ? val : b) })

  if (!expanded) {
    return (
      <div className="q-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setExpanded(true)}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--brand)', color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <span style={{ fontSize: 14, color: 'var(--muted)', marginRight: 6 }}>{typeDef?.icon}</span>
        <Badge tone="default">{typeDef?.label}</Badge>
        <div style={{ flex: 1, fontSize: 14, color: q.prompt ? 'var(--ink)' : 'var(--muted)' }}>
          {q.prompt || 'No prompt yet…'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{q.points} pts</div>
      </div>
    )
  }

  return (
    <div className="q-item editing">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--brand)', color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        {/* Type selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {QUESTION_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => set({ type: t.type })}
              style={{
                padding: '3px 8px', borderRadius: 6, border: '1px solid',
                borderColor: q.type === t.type ? 'var(--brand)' : 'var(--line)',
                background: q.type === t.type ? 'var(--brand-tint)' : 'transparent',
                color: q.type === t.type ? 'var(--brand)' : 'var(--muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Points */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>pts</label>
          <input
            type="number" min={0} value={q.points}
            onChange={e => set({ points: Number(e.target.value) })}
            className="input"
            style={{ width: 56, textAlign: 'center' }}
          />
        </div>
        {/* Actions */}
        <button className="btn btn-ghost btn-sm" onClick={onDuplicate} title="Duplicate"><Copy size={13} /></button>
        <button className="btn btn-ghost btn-sm" onClick={onDelete} title="Delete"><Trash size={13} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(false)} title="Collapse"><X size={13} /></button>
      </div>

      {/* Prompt */}
      <Field label="Question prompt">
        <textarea
          className="input"
          rows={2}
          placeholder="Enter your question…"
          value={q.prompt}
          onChange={e => set({ prompt: e.target.value })}
          style={{ resize: 'vertical' }}
        />
      </Field>

      {/* Type-specific editors */}
      <div style={{ marginTop: 14 }}>
        {q.type === 'mcq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="label">Answer choices</label>
            {(q.options ?? []).map(opt => (
              <div key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="radio"
                  name={`q-${q.id}-answer`}
                  checked={q.answer === opt.id}
                  onChange={() => set({ answer: opt.id })}
                />
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Option text…"
                  value={opt.text}
                  onChange={e => updateOption(opt.id, e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removeOption(opt.id)}><X size={12} /></button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addOption} style={{ alignSelf: 'flex-start' }}>
              <Plus size={12} /> Add option
            </button>
          </div>
        )}

        {q.type === 'tf' && (
          <div style={{ display: 'flex', gap: 10 }}>
            {[true, false].map(val => (
              <button
                key={String(val)}
                onClick={() => set({ tfAnswer: val })}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  border: '1px solid',
                  borderColor: q.tfAnswer === val ? 'var(--brand)' : 'var(--line)',
                  background: q.tfAnswer === val ? 'var(--brand-tint)' : 'var(--card)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  color: q.tfAnswer === val ? 'var(--brand)' : 'var(--ink)',
                }}
              >
                {val ? 'True' : 'False'}
              </button>
            ))}
          </div>
        )}

        {q.type === 'fib' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="label">Accepted answers (one per blank)</label>
            {(q.blanks ?? []).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 60 }}>Blank {i + 1}</span>
                <input
                  className="input" style={{ flex: 1 }}
                  placeholder="Accepted answer…"
                  value={b}
                  onChange={e => updateBlank(i, e.target.value)}
                />
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addBlank} style={{ alignSelf: 'flex-start' }}>
              <Plus size={12} /> Add blank
            </button>
          </div>
        )}

        {q.type === 'short' && (
          <div>
            <Field label="Grading rubric">
              <textarea
                className="input" rows={3}
                placeholder="Describe what a correct answer looks like…"
                value={q.rubric ?? ''}
                onChange={e => set({ rubric: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </Field>
            <div style={{ marginTop: 8 }}>
              <Badge tone="brand">AI-assisted grading</Badge>
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>Atlas AI will suggest scores based on the rubric</span>
            </div>
          </div>
        )}

        {q.type === 'match' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="label">Matching pairs</label>
            {(q.pairs ?? []).map((pair, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input" style={{ flex: 1 }}
                  placeholder="Left side…"
                  value={pair.l}
                  onChange={e => updatePair(i, 'l', e.target.value)}
                />
                <span style={{ color: 'var(--muted)' }}>⇄</span>
                <input
                  className="input" style={{ flex: 1 }}
                  placeholder="Right side…"
                  value={pair.r}
                  onChange={e => updatePair(i, 'r', e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removePair(i)}><X size={12} /></button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addPair} style={{ alignSelf: 'flex-start' }}>
              <Plus size={12} /> Add pair
            </button>
          </div>
        )}

        {q.type === 'essay' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Min words">
              <input
                type="number" className="input" min={0}
                value={q.wordMin ?? 0}
                onChange={e => set({ wordMin: Number(e.target.value) })}
                style={{ width: 90 }}
              />
            </Field>
            <Field label="Max words">
              <input
                type="number" className="input" min={0}
                value={q.wordMax ?? 500}
                onChange={e => set({ wordMax: Number(e.target.value) })}
                style={{ width: 90 }}
              />
            </Field>
          </div>
        )}

        {q.type === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Language">
              <select
                className="select"
                value={q.language ?? 'javascript'}
                onChange={e => set({ language: e.target.value })}
              >
                {['javascript', 'python', 'typescript', 'java', 'c', 'cpp', 'ruby', 'go'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Expected output (optional)">
              <input
                className="input"
                placeholder="e.g. Hello, World!"
                value={q.expectedOutput ?? ''}
                onChange={e => set({ expectedOutput: e.target.value })}
              />
            </Field>
          </div>
        )}

        {q.type === 'upload' && (
          <div
            style={{
              border: '2px dashed var(--line)', borderRadius: 8,
              padding: '24px 16px', textAlign: 'center',
              color: 'var(--muted)', fontSize: 13,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>↑</div>
            <div>Students will upload a file to answer this question</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>PDF, DOCX, images accepted</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────

function makeQuestion(type: QuestionType): Question {
  const base: Question = { id: `q${Date.now()}`, type, prompt: '', points: 1 }
  if (type === 'mcq') return { ...base, options: [{ id: 'a', text: '' }, { id: 'b', text: '' }], answer: 'a' }
  if (type === 'tf') return { ...base, tfAnswer: null, points: 1 }
  if (type === 'fib') return { ...base, blanks: [''] }
  if (type === 'match') return { ...base, pairs: [{ l: '', r: '' }], points: 3 }
  if (type === 'essay') return { ...base, wordMin: 100, wordMax: 500, points: 10 }
  if (type === 'code') return { ...base, language: 'javascript', points: 5 }
  return base
}

/** Inverse of builderQuestionToPayload — loads an API question into the builder. */
function apiQuestionToBuilder(q: QuizQuestion): Question {
  const config = q.config ?? {}
  const base: Question = { id: q.id, type: q.type, prompt: q.prompt, points: q.points }

  switch (q.type) {
    case 'mcq':
      return {
        ...base,
        options: (config.options as McqOption[] | undefined) ?? [],
        answer: config.answer as string | undefined,
      }
    case 'tf':
      return { ...base, tfAnswer: (config.answer as boolean | null | undefined) ?? null }
    case 'fib':
      return { ...base, blanks: (config.blanks as string[] | undefined) ?? [''] }
    case 'match':
      return { ...base, pairs: ((config.pairs as MatchPair[] | undefined) ?? []).map(p => ({ l: p.l, r: p.r ?? '' })) }
    case 'short':
    case 'essay':
      return {
        ...base,
        rubric: config.rubric as string | undefined,
        wordMin: config.word_min as number | undefined,
        wordMax: config.word_max as number | undefined,
      }
    case 'code':
      return {
        ...base,
        language: (config.language as string | undefined) ?? 'javascript',
        expectedOutput: config.expected_output as string | undefined,
      }
    default:
      return base
  }
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Builder (shared by new + edit pages) ───────────────────────

export function QuizBuilder({ quiz }: { quiz?: Quiz }) {
  const isEdit = !!quiz
  const router = useRouter()
  const { data: courses = [], isLoading: coursesLoading } = useCourses()
  const [title, setTitle] = useState(quiz?.title ?? 'Untitled Quiz')
  const [courseId, setCourseId] = useState(quiz?.course_id ?? '')
  const [quizType, setQuizType] = useState<'graded' | 'practice' | 'survey'>(quiz?.quiz_type ?? 'graded')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const activeCourseId = courseId || courses[0]?.id || ''
  const createQuiz = useCreateQuiz(activeCourseId)
  const updateQuiz = useUpdateQuiz(activeCourseId)
  const [timeLimit, setTimeLimit] = useState(quiz?.time_limit_minutes != null ? String(quiz.time_limit_minutes) : '10')
  const [attempts, setAttempts] = useState(quiz?.max_attempts != null ? String(quiz.max_attempts) : '1')
  const [shuffle, setShuffle] = useState(quiz?.shuffle_questions ? 'yes' : 'no')
  const [showResults, setShowResults] = useState(quiz?.show_results ?? 'after')
  const [passingScore, setPassingScore] = useState(quiz?.passing_score ?? 60)
  const [showCorrect, setShowCorrect] = useState(quiz?.show_correct ?? true)
  const [showScore, setShowScore] = useState(quiz?.show_score ?? true)
  const [dueAt, setDueAt] = useState(toLocalInputValue(quiz?.due_at ?? null))
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions?.length ? quiz.questions.map(apiQuestionToBuilder) : [makeQuestion('mcq')]
  )

  const isPublished = !!quiz?.published_at
  const saving = createQuiz.isPending || updateQuiz.isPending

  const addQuestion = (type: QuestionType) =>
    setQuestions(qs => [...qs, makeQuestion(type)])

  const updateQuestion = (id: string, updated: Question) =>
    setQuestions(qs => qs.map(q => q.id === id ? updated : q))

  const deleteQuestion = (id: string) =>
    setQuestions(qs => qs.filter(q => q.id !== id))

  const duplicateQuestion = (id: string) => {
    const q = questions.find(q => q.id === id)
    if (!q) return
    setQuestions(qs => {
      const idx = qs.findIndex(q => q.id === id)
      const copy = { ...q, id: `q${Date.now()}` }
      return [...qs.slice(0, idx + 1), copy, ...qs.slice(idx + 1)]
    })
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0)

  const buildPayload = (publish: boolean): CreateQuizPayload => ({
    title: title.trim() || 'Untitled Quiz',
    quiz_type: quizType,
    time_limit_minutes: Number(timeLimit) || undefined,
    max_attempts: Number(attempts) || undefined,
    shuffle_questions: shuffle === 'yes',
    show_results: showResults as CreateQuizPayload['show_results'],
    passing_score: passingScore,
    show_correct: showCorrect,
    show_score: showScore,
    due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
    publish,
    questions: questions.map((q, i) => builderQuestionToPayload(q, i)),
  })

  const save = (publish: boolean) => {
    setSubmitError(null)
    const onSuccess = () => router.push('/teacher/quizzes')
    const onError = () =>
      setSubmitError(publish ? 'Could not publish quiz. Check your questions and try again.' : 'Could not save quiz.')

    if (isEdit && quiz) {
      updateQuiz.mutate(
        { id: quiz.id, payload: { ...buildPayload(publish), due_at: dueAt ? new Date(dueAt).toISOString() : null } },
        { onSuccess, onError }
      )
    } else {
      createQuiz.mutate(buildPayload(publish), { onSuccess, onError })
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
      {/* Main content */}
      <div>
        {/* Header */}
        <div className="page-head">
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/teacher/quizzes')}>
              <ArrowLeft size={14} /> Back
            </button>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h1"
              style={{ border: 0, background: 'transparent', outline: 'none', padding: 0, minWidth: 260 }}
            />
            {isEdit && (
              <Badge tone={isPublished ? 'success' : 'accent'}>
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            )}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => save(false)} disabled={saving || !activeCourseId}>
              {isEdit ? (saving ? 'Saving…' : 'Save changes') : 'Save draft'}
            </Button>
            {!isPublished && (
              <Button variant="brand" size="sm" icon={Check} onClick={() => save(true)} disabled={saving || !activeCourseId}>
                {saving ? 'Publishing…' : 'Publish'}
              </Button>
            )}
          </div>
        </div>

        {/* Settings bar */}
        <div className="card card-pad" style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Field label="Course">
            {isEdit ? (
              <div className="input" style={{ display: 'flex', alignItems: 'center', background: 'var(--paper-2)' }}>
                {courses.find(c => c.id === quiz?.course_id)?.title ?? 'Course'}
              </div>
            ) : (
              <select
                className="select"
                value={activeCourseId}
                onChange={e => setCourseId(e.target.value)}
                disabled={coursesLoading}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Type">
            <SegControl
              options={[{ value: 'graded', label: 'Graded' }, { value: 'practice', label: 'Practice' }, { value: 'survey', label: 'Survey' }]}
              value={quizType}
              onChange={v => setQuizType(v as typeof quizType)}
            />
          </Field>
          <Field label="Time limit (min)">
            <input type="number" className="input" style={{ width: 80 }} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} />
          </Field>
          <Field label="Attempts">
            <input type="number" className="input" style={{ width: 70 }} value={attempts} min={1} onChange={e => setAttempts(e.target.value)} />
          </Field>
          <Field label="Shuffle">
            <SegControl
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
              value={shuffle}
              onChange={setShuffle}
            />
          </Field>
          <Field label="Due date (optional)">
            <input
              type="datetime-local"
              className="input"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
            />
          </Field>
        </div>

        {/* Question list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id}
              q={q}
              index={i}
              onUpdate={updated => updateQuestion(q.id, updated)}
              onDelete={() => deleteQuestion(q.id)}
              onDuplicate={() => duplicateQuestion(q.id)}
            />
          ))}
        </div>

        {submitError && (
          <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{submitError}</div>
        )}

        {/* Add question panel */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Add a question</div>
          <div className="q-types">
            {QUESTION_TYPES.map(t => (
              <button key={t.type} className="q-type-btn" onClick={() => addQuestion(t.type)}>
                <div className="ico" style={{ marginBottom: 6 }}>{t.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b>{t.label}</b>
                  <span>{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Quiz summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Questions</span>
            <b style={{ fontSize: 13 }}>{questions.length}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total points</span>
            <b style={{ fontSize: 13 }}>{totalPoints}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Time limit</span>
            <b style={{ fontSize: 13 }}>{timeLimit} min</b>
          </div>
        </div>

        {/* Passing score */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Passing score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <input
              type="range" min={0} max={100} value={passingScore}
              onChange={e => setPassingScore(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, width: 36 }}>{passingScore}%</span>
          </div>
          <div style={{ background: 'var(--paper-2)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: `${passingScore}%`, height: '100%', background: 'var(--brand)', transition: 'width .2s' }} />
          </div>
        </div>

        {/* Show results */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Show results</div>
          <SegControl
            options={[{ value: 'after', label: 'After submit' }, { value: 'manual', label: 'Manual' }, { value: 'never', label: 'Never' }]}
            value={showResults}
            onChange={v => setShowResults(v as typeof showResults)}
          />
        </div>

        {/* Visibility */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Visibility</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={showCorrect} onChange={e => setShowCorrect(e.target.checked)} />
              Show correct answers
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={showScore} onChange={e => setShowScore(e.target.checked)} />
              Show score immediately
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
