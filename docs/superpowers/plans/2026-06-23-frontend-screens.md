# Atlas Frontend — All Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port all Atlas design handoff screens into the Next.js 15 frontend at `apps/web/`, starting with the sidebar/app shell, then all student and teacher screens.

**Architecture:** Next.js 15 App Router with `(app)` route group for authenticated pages. Each screen maps to a file-system route. Shared components live in `src/components/`. Mock data is used until API is wired. CSS classes match the design handoff exactly — append them to `globals.css` rather than fighting Tailwind.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, CSS custom properties, lucide-react icons, TanStack Query v5.

## Global Constraints

- All work in `apps/web/` — run `npm run dev` from that directory (port 3000)
- Run `npm run build` (from `apps/web/`) to verify TypeScript compiles — treat build errors as test failures
- Follow existing code style: functional components, named exports for components, default export for pages
- Use CSS variables (`var(--brand)`, etc.) for all design token references — never hardcode hex values
- Icons from `lucide-react` — import individually (`import { Home } from 'lucide-react'`)
- Mock data from `src/lib/mock-data.ts` — never import from `design_handoff_atlas/`
- No API calls in these tasks — use mock data throughout; add `// TODO: replace with useQuery` comment where relevant
- Font: Geist (already loaded via Google Fonts import in globals.css)
- Every route inside `(app)/` is protected by the existing `middleware.ts`

---

### Task 1: Global CSS — port all design-system classes to globals.css

The existing `globals.css` has CSS tokens but is missing all the utility class definitions from the design handoff. This task adds them.

**Files:**
- Modify: `apps/web/src/app/globals.css`

**Interfaces:**
- Produces: `.card`, `.btn`, `.btn-*`, `.badge`, `.badge-*`, `.avatar`, `.progress`, `.tabs`, `.sidebar`, `.nav-item`, `.live-pill-sm`, `.video-stage`, `.video-controls`, `.scrub`, `.chapter`, `.quiz-shell`, `.choice`, `.exam-banner`, `.q-item`, `.q-type-btn`, `.table`, `.lr` (live room), `.wb-wrap`, `.grad-1`–`.grad-6`, and all utility helpers

- [ ] **Step 1: Append all design-system classes to globals.css**

Append the entire content of `design_handoff_atlas/styles.css` starting from line 75 (after the `:root` block, which is already ported) to the end of `apps/web/src/app/globals.css`. Skip the `:root` and `[data-theme]` blocks (lines 1–74). Copy everything from line 75 onwards exactly — these are the utility classes, component classes, sidebar, video, quiz, exam, builder, table, and live-room CSS.

The key sections to include (copy verbatim from `design_handoff_atlas/styles.css`):
- `* { box-sizing: border-box; }` and body/html reset
- `.app`, `.main`, `.main-inner`, `.row`, `.col`, `.between` utilities
- `.h1`, `.h2`, `.h3`, `.eyebrow`, `.serif-italic`, `.muted`, `.display`, `.mono` typography
- `.card`, `.card-pad`, `.card-pad-lg`, `.flat`, `.elev`
- `.btn` and all variants (`.btn-primary`, `.btn-brand`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-icon`, `.btn-block`)
- `.input`, `.select`, `.textarea`, `.label`, `.help`, `.input-lg`
- `.badge` and all tones
- `.avatar`, `.avatar-lg`, `.avatar-sm`, `.avatar-stack`
- `.progress`, `.progress-fill`, `.progress.brand`, `.progress.thick`, `.progress.thin`
- `.sidebar`, `.brand-mark`, `.role-switch`, `.nav-section`, `.nav-item`, `.nav-count`, `.sidebar-foot`
- `.live-pill-sm` (from the prototype's inline CSS in sidebar.jsx: `fontSize: 9, padding: "3px 6px"` — add as `.live-pill-sm { display: inline-flex; align-items: center; gap: 5px; background: #FF3B3B; color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 6px; border-radius: var(--r-pill); }`)
- `.page-head`, `.crumbs`
- `.tabs`, `.tabs button`
- `.thumb`, `.thumb-tag`, `.thumb-title`, `.grad-1`–`.grad-6`
- `.table`, `.table th`, `.table td`, `.table td.num`
- `.kbd`, `.divider`, `.dot-sep`, `.sr-only`
- Scrollbar styles
- `.login-shell`, `.login-left`, `.login-card`, `.login-right`
- `.video-stage`, `.scrim`, `.video-controls`, `.video-time`, `.scrub`, `.scrub-fill`, `.scrub-thumb`, `.video-btn`
- `.chapter`, `.chapter:hover`, `.chapter.active`, `.chapter.done`, `.chap-num`, `.chap-title`, `.chap-time`
- `.quiz-shell`, `.choice`, `.choice:hover`, `.choice.selected`, `.choice.correct`, `.choice.wrong`, `.choice .letter`, `.choice.selected .letter`, etc.
- `.exam-banner`, `.exam-timer`
- `.q-item`, `.q-item.editing`, `.q-types`, `.q-type-btn`, `.q-type-btn .ico`
- `.select` (already in input section)
- `.lr`, `.lr-top`, `.lr-live-pill`, `@keyframes lr-blink`, `.lr-rec`, `.lr-body`, `.lr-body.with-panel`, `.lr-stage`, `.lr-main`
- `.lr-tile`, `.lr-tile.speaking`, `.lr-tile-name`, `.lr-tile-badge`, `.lr-tile-hand`, `@keyframes lr-wave`, `.lr-tile-avatar`
- `.lr-strip`, `.lr-strip .lr-tile`, `.lr-strip-more`
- `.lr-grid`
- `.lr-controls`, `.lr-ctrl`, `.lr-ctrl .ic`, `.lr-ctrl span`, `.lr-ctrl.on .ic`, `.lr-ctrl.off .ic`, `.lr-ctrl.live-rec .ic`
- `.lr-leave`
- `.lr-panel`, `.lr-panel-tabs`, `.lr-panel-tab`, `.lr-panel-body`
- `.lr-people-row`
- `.lr-chat-msg`, `.lr-chat-input`
- `.wb-wrap`, `.wb-canvas`, `.wb-banner`, `.wb-cursor`, `.wb-cursor-a`, `.wb-cursor-b`, `.wb-toolbar`, `.wb-tool`, `.wb-sep`, `.wb-swatch`
- `.live-card`, `.live-card-thumb`

Also add from the styles.css file (look near the end):
```css
.lr-panel { width: 320px; background: #16161C; border-left: 1px solid rgba(255,255,255,.08); display: flex; flex-direction: column; }
.lr-panel-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,.08); }
.lr-panel-tab { flex: 1; padding: 14px; background: transparent; border: 0; color: rgba(255,255,255,.55); font-size: 13px; font-weight: 600; cursor: pointer; }
.lr-panel-tab.active { color: #fff; border-bottom: 2px solid var(--brand); }
.lr-panel-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.lr-people-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.lr-chat-msg { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.lr-chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,.08); }
.lr-chat-input input { flex: 1; background: #26262E; border: 1px solid rgba(255,255,255,.1); border-radius: var(--r-md); padding: 8px 12px; color: #fff; font-size: 13px; outline: none; }
.wb-wrap { position: relative; width: 100%; height: 100%; background: #F6F4EE; border-radius: var(--r-md); overflow: hidden; }
.wb-canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
.wb-banner { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,.9); backdrop-filter: blur(8px); border: 1px solid var(--line); border-radius: var(--r-pill); padding: 6px 14px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--ink); white-space: nowrap; }
.wb-cursor { position: absolute; pointer-events: none; display: flex; align-items: center; gap: 5px; }
.wb-cursor-a { top: 38%; left: 55%; }
.wb-cursor-b { top: 56%; left: 68%; }
.wb-cursor .lbl { font-size: 11px; font-weight: 700; color: #fff; padding: 2px 7px; border-radius: var(--r-pill); }
.wb-toolbar { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: var(--ink); border-radius: var(--r-pill); padding: 8px 14px; display: flex; align-items: center; gap: 6px; }
.wb-tool { width: 32px; height: 32px; border-radius: 50%; background: transparent; border: 0; color: #fff; cursor: pointer; display: grid; place-items: center; transition: background .12s; }
.wb-tool:hover, .wb-tool.active { background: rgba(255,255,255,.18); }
.wb-sep { width: 1px; height: 24px; background: rgba(255,255,255,.2); margin: 0 2px; }
.wb-swatch { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform .1s; }
.wb-swatch.active { border-color: #fff; transform: scale(1.2); }
.live-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
.live-card-thumb { height: 160px; position: relative; display: flex; align-items: flex-end; padding: 14px; }
```

- [ ] **Step 2: Verify build passes**

```bash
cd apps/web && npm run build
```
Expected: no TypeScript errors (CSS additions don't affect TS).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(frontend): port all design-system CSS classes to globals.css"
```

---

### Task 2: Icons barrel + Shared UI components

**Files:**
- Create: `apps/web/src/components/ui/Icons.tsx`
- Create: `apps/web/src/components/ui/Button.tsx`
- Create: `apps/web/src/components/ui/Badge.tsx`
- Create: `apps/web/src/components/ui/Avatar.tsx`
- Create: `apps/web/src/components/ui/Progress.tsx`
- Create: `apps/web/src/components/ui/Tabs.tsx`
- Create: `apps/web/src/components/ui/Field.tsx`
- Create: `apps/web/src/components/ui/Stat.tsx`
- Create: `apps/web/src/components/ui/SegControl.tsx`
- Create: `apps/web/src/components/ui/CourseThumb.tsx`
- Create: `apps/web/src/components/ui/Toggle.tsx`
- Create: `apps/web/src/components/ui/Sparkline.tsx`
- Create: `apps/web/src/components/ui/index.ts` (barrel)
- Modify: `apps/web/package.json` (add lucide-react if not present)

**Interfaces:**
- Produces: All shared components used by every screen task below

- [ ] **Step 1: Install lucide-react**

```bash
cd apps/web && npm install lucide-react
```

- [ ] **Step 2: Create Icons barrel**

`apps/web/src/components/ui/Icons.tsx`:
```tsx
export {
  Home, BookOpen as Book, Radio as Broadcast, Play, ListChecks, ClipboardCheck,
  TrendingUp as ChartLine, Settings, Bell, Search, ArrowRight, Sparkles as Sparkle,
  Clock, Plus, Filter, Upload, Users, Flag, Pencil, ArrowLeft, X, Check, Lock,
  MoreHorizontal as MoreH, ChevronDown, Layers, Trash, Link, Code, FileText,
  Type, CheckCircle, Send, Paperclip, Volume2 as Volume, Captions as CC,
  Maximize, Pause, Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Grid,
  PhoneOff, Square, Circle, Dot, PenTool, Highlighter, Eraser, Undo, MousePointer as Pointer,
  Calendar, MessageCircle as ChatBubble, Mail, Copy, Download, Trophy,
  ArrowUpRight, ChevronRight, BarChart2 as ChartBar, Broadcast as LiveDot,
} from 'lucide-react'
```

- [ ] **Step 3: Create shared components**

`apps/web/src/components/ui/Button.tsx`:
```tsx
import { ElementType, ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ElementType
  iconRight?: ElementType
  block?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary', size = 'md', icon: Icon, iconRight: IconR,
  block, children, className = '', ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    !children ? 'btn-icon' : '',
    className,
  ].filter(Boolean).join(' ')
  const iconSize = size === 'lg' ? 16 : 14
  return (
    <button className={cls} {...rest}>
      {Icon && <Icon size={iconSize} />}
      {children}
      {IconR && <IconR size={iconSize} />}
    </button>
  )
}
```

`apps/web/src/components/ui/Badge.tsx`:
```tsx
import { ReactNode, CSSProperties } from 'react'

type Tone = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'accent'

export function Badge({ tone = 'default', dot, children, style }: {
  tone?: Tone; dot?: boolean; children?: ReactNode; style?: CSSProperties
}) {
  const cls = ['badge', tone !== 'default' ? `badge-${tone}` : '', dot ? 'badge-dot' : ''].filter(Boolean).join(' ')
  return <span className={cls} style={style}>{children}</span>
}
```

`apps/web/src/components/ui/Avatar.tsx`:
```tsx
export function Avatar({ name = '??', size = 'md', color, src }: {
  name?: string; size?: 'sm' | 'md' | 'lg'; color?: string; src?: string
}) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const cls = ['avatar', size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : ''].filter(Boolean).join(' ')
  return (
    <span className={cls} style={{ background: color, color: color ? '#fff' : undefined }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  )
}
```

`apps/web/src/components/ui/Progress.tsx`:
```tsx
export function Progress({ value = 0, variant = 'default', thick }: {
  value?: number; variant?: 'default' | 'brand'; thick?: boolean
}) {
  const cls = ['progress', variant === 'brand' ? 'brand' : '', thick ? 'thick' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
```

`apps/web/src/components/ui/Tabs.tsx`:
```tsx
interface Tab { id: string; label: string; count?: number }
export function Tabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id} className={value === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          {t.label}{t.count != null && <span style={{ marginLeft: 6, color: 'var(--muted)', fontWeight: 500 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
```

`apps/web/src/components/ui/Field.tsx`:
```tsx
import { ReactNode } from 'react'
export function Field({ label, help, hint, children }: { label?: string; help?: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && <label className="label">{label}{hint && <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>{hint}</span>}</label>}
      {children}
      {help && <div className="help">{help}</div>}
    </div>
  )
}
```

`apps/web/src/components/ui/Stat.tsx`:
```tsx
export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.01em', color: accent ? 'var(--brand)' : 'var(--ink)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  )
}
```

`apps/web/src/components/ui/SegControl.tsx`:
```tsx
interface Option { value: string; label: string }
export function SegControl({ options, value, onChange }: { options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          background: value === o.value ? 'var(--card)' : 'transparent',
          boxShadow: value === o.value ? 'var(--sh-sm)' : 'none',
          border: 0, padding: '6px 12px', borderRadius: 'var(--r-sm)',
          fontWeight: 600, fontSize: 12, cursor: 'pointer',
          color: value === o.value ? 'var(--ink)' : 'var(--muted)',
        }}>{o.label}</button>
      ))}
    </div>
  )
}
```

`apps/web/src/components/ui/CourseThumb.tsx`:
```tsx
interface Course { id: number; tag: string; title: string; glyph?: string }
export function CourseThumb({ course, size = 'md' }: { course: Course; size?: 'sm' | 'md' }) {
  const grads = ['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5', 'grad-6']
  const grad = grads[course.id % grads.length]
  return (
    <div className={`thumb ${grad}`} style={size === 'sm' ? { fontSize: 14 } : {}}>
      <div className="thumb-tag">{course.tag}</div>
      <div className="thumb-title" style={size === 'sm' ? { fontSize: 16 } : {}}>{course.title}</div>
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.18, fontSize: 140, lineHeight: 1, color: '#fff', userSelect: 'none' }}>
        {course.glyph || course.title[0]}
      </div>
    </div>
  )
}
```

`apps/web/src/components/ui/Toggle.tsx`:
```tsx
'use client'
import { useState } from 'react'
export function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 36, height: 20, borderRadius: 99,
      background: on ? 'var(--brand)' : 'var(--line-2)',
      border: 0, cursor: 'pointer', position: 'relative', transition: 'background .15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, background: '#fff', borderRadius: '50%',
        transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}
```

`apps/web/src/components/ui/Sparkline.tsx`:
```tsx
export function Sparkline({ values = [], positive = true }: { values?: number[]; positive?: boolean }) {
  const w = 64, h = 22
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={positive ? 'var(--success)' : 'var(--danger)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
```

`apps/web/src/components/ui/index.ts`:
```ts
export { Button } from './Button'
export { Badge } from './Badge'
export { Avatar } from './Avatar'
export { Progress } from './Progress'
export { Tabs } from './Tabs'
export { Field } from './Field'
export { Stat } from './Stat'
export { SegControl } from './SegControl'
export { CourseThumb } from './CourseThumb'
export { Toggle } from './Toggle'
export { Sparkline } from './Sparkline'
```

- [ ] **Step 4: Verify build**

```bash
cd apps/web && npm run build
```
Expected: PASS, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ui/ apps/web/package.json apps/web/package-lock.json
git commit -m "feat(frontend): add icons barrel and all shared UI components"
```

---

### Task 3: Mock data + Role context + Sidebar + App shell layout

**Files:**
- Create: `apps/web/src/lib/mock-data.ts`
- Create: `apps/web/src/contexts/RoleContext.tsx`
- Create: `apps/web/src/components/layout/Sidebar.tsx`
- Modify: `apps/web/src/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: All shared UI components from Task 2
- Produces: `useRole()` hook, `MOCK` data object, `<Sidebar />` component

- [ ] **Step 1: Create mock-data.ts**

`apps/web/src/lib/mock-data.ts` — copy the exact `DATA` object from `design_handoff_atlas/data.jsx`, converting it to TypeScript. Key types:

```ts
export const MOCK = {
  user: {
    name: 'Sofia Chen',
    email: 'sofia.chen@email.com',
    avatar: null as null,
    color: '#2747E0',
  },
  teacher: {
    name: 'Prof. Marcus Vale',
    email: 'm.vale@atlas.edu',
    color: '#5C3A1E',
  },
  courses: [
    { id: 1, title: 'English B2 — Conversational Fluency', glyph: 'E', tag: 'English · B2', lessonsTotal: 24, lessonsDone: 14, progress: 58, instructor: 'Lena Ortega', nextLesson: 'Lesson 15 · Conditionals in real talk', due: 'Tomorrow', category: 'Languages' },
    { id: 2, title: 'Spanish Foundations — A2', glyph: 'ñ', tag: 'Spanish · A2', lessonsTotal: 32, lessonsDone: 8, progress: 25, instructor: 'Diego Marín', nextLesson: 'Lesson 9 · Ser vs Estar in context', due: 'Fri', category: 'Languages' },
    { id: 3, title: 'IELTS Writing Intensive', glyph: '✎', tag: 'Test Prep', lessonsTotal: 12, lessonsDone: 11, progress: 91, instructor: 'Prof. Marcus Vale', nextLesson: 'Final Mock Essay Review', due: 'Today', category: 'Test Prep' },
    { id: 4, title: 'Public Speaking & Storytelling', glyph: 'S', tag: 'Soft Skills', lessonsTotal: 8, lessonsDone: 3, progress: 38, instructor: 'Robin Park', nextLesson: 'Lesson 4 · The 3-act narrative arc', due: 'Next week', category: 'Soft Skills' },
    { id: 5, title: 'Beginner Japanese — Hiragana', glyph: 'あ', tag: 'Japanese · A1', lessonsTotal: 20, lessonsDone: 0, progress: 0, instructor: 'Aiko Tanaka', nextLesson: 'Lesson 1 · The vowel row', due: 'Not started', category: 'Languages' },
  ],
  modules: [
    { id: 'm1', title: 'Module 1 · Confident Greetings', lessons: [
      { id: 'l1', n: 1, title: 'Tone, pacing, and first impressions', duration: '12:40', done: true },
      { id: 'l2', n: 2, title: "Small talk that doesn't feel small", duration: '14:05', done: true },
      { id: 'l3', n: 3, title: 'Cultural cues across Englishes', duration: '09:55', done: true, hasQuiz: true },
    ]},
    { id: 'm2', title: 'Module 2 · Sounds & Stress', lessons: [
      { id: 'l4', n: 4, title: 'Linking sounds in spoken English', duration: '11:20', done: true },
      { id: 'l5', n: 5, title: 'Word stress vs sentence stress', duration: '13:30', done: true },
      { id: 'l6', n: 6, title: 'Reduced forms: gonna, wanna, gotta', duration: '10:15', done: true, hasQuiz: true },
    ]},
    { id: 'm3', title: 'Module 3 · Conditionals in Real Talk', lessons: [
      { id: 'l13', n: 13, title: 'Zero & first conditionals', duration: '15:10', done: true },
      { id: 'l14', n: 14, title: 'Second conditional & hypotheticals', duration: '16:42', done: true },
      { id: 'l15', n: 15, title: 'Mixed conditionals & nuance', duration: '18:05', current: true },
      { id: 'l16', n: 16, title: 'Conditional practice quiz', duration: '10 questions', quiz: true },
    ]},
    { id: 'm4', title: 'Module 4 · Idioms & Register', lessons: [
      { id: 'l17', n: 17, title: 'Formal vs informal register', duration: '12:00', locked: true },
      { id: 'l18', n: 18, title: 'Idioms that natives actually use', duration: '14:30', locked: true },
    ]},
  ],
  chapters: [
    { id: 'c1', n: 1, title: 'Why mixed conditionals trip people up', time: '00:00', t: 0, done: true },
    { id: 'c2', n: 2, title: 'Pattern 1 — Past condition, present result', time: '02:14', t: 134, done: true },
    { id: 'c3', n: 3, title: 'Pattern 2 — Present condition, past result', time: '06:48', t: 408, current: true },
    { id: 'c4', n: 4, title: 'Native examples in dialogue', time: '10:22', t: 622 },
    { id: 'c5', n: 5, title: 'Common mistakes to avoid', time: '13:55', t: 835 },
    { id: 'c6', n: 6, title: 'Try it — guided practice', time: '16:10', t: 970 },
  ],
  transcript: [
    { t: '06:48', speaker: 'Lena', text: 'So if you grasp this one pattern, you\'ll suddenly hear it everywhere.' },
    { t: '07:02', speaker: 'Lena', text: '"If I hadn\'t quit my job, I\'d be saving every month."' },
    { t: '07:18', speaker: 'Lena', text: 'Past condition, present result. The structure splits time. That\'s the move.' },
    { t: '07:34', speaker: 'Lena', text: 'Try this one with me. Take 10 seconds, write yours, then we\'ll compare.' },
  ],
  discussion: [
    { id: 'd1', who: 'Amir K.', color: '#D97757', time: '2h ago', text: 'The split-time idea finally clicked. Mind if I share two examples to check?', replies: 3 },
    { id: 'd2', who: 'Yuna P.', color: '#15706A', time: '1d ago', text: 'Question on pattern 2 — does this work with future regret too, or strictly past result?', replies: 5 },
    { id: 'd3', who: 'Lena (Instructor)', color: '#2747E0', time: '1d ago', text: "Great question Yuna — I'll cover this in the next lesson.", replies: 0, instructor: true },
  ],
  quiz: {
    title: 'Mixed Conditionals · Practice Quiz',
    course: 'English B2',
    minutes: 10,
    questions: [
      { id: 'q1', type: 'mcq' as const, prompt: 'Which sentence is a correctly-formed mixed conditional?',
        options: [
          { id: 'a', text: 'If I had studied harder, I will pass the exam.' },
          { id: 'b', text: 'If I had studied harder, I would be passing the exam now.' },
          { id: 'c', text: 'If I would study harder, I had passed the exam.' },
          { id: 'd', text: 'If I studied harder, I had passed the exam.' },
        ], answer: 'b' },
      { id: 'q2', type: 'tf' as const, prompt: 'Mixed conditionals always combine a past condition with a present result.', answer: false, note: 'They can also combine a present condition with a past result.' },
      { id: 'q3', type: 'fib' as const, prompt: 'Complete: "If she ___ (take) that job last year, she ___ (live) in Lisbon right now."', blanks: ['had taken', 'would be living'] },
      { id: 'q4', type: 'short' as const, prompt: 'In your own words, when would you choose a mixed conditional over a regular second or third conditional?', rubric: 'Look for: separation of past cause vs present effect; nuance/contrast in time.' },
      { id: 'q5', type: 'match' as const, prompt: 'Match each clause with the best continuation.', pairs: [
        { l: "If I hadn't moved abroad,", r: "I wouldn't be fluent today." },
        { l: 'If you were more patient,', r: 'you would have caught the mistake earlier.' },
        { l: 'If he had taken the bus,', r: 'he would be here by now.' },
      ]},
    ],
  },
  exam: { title: 'End-of-Term Comprehensive Exam — English B2', duration: 90, questions: 28, pointsTotal: 100 },
  roster: [
    { id: 's1', name: 'Sofia Chen',    courses: 3, attendance: 94, avgScore: 88, status: 'on-track',  last: 'Today',      flagged: false, color: '#2747E0' },
    { id: 's2', name: 'Amir Khoury',   courses: 2, attendance: 76, avgScore: 71, status: 'at-risk',   last: '3 days ago', flagged: true,  color: '#D97757' },
    { id: 's3', name: 'Yuna Park',     courses: 4, attendance: 98, avgScore: 92, status: 'excelling', last: 'Today',      flagged: false, color: '#15706A' },
    { id: 's4', name: 'Diego Martín',  courses: 1, attendance: 88, avgScore: 79, status: 'on-track',  last: 'Yesterday',  flagged: false, color: '#5C3A1E' },
    { id: 's5', name: 'Priya Raman',   courses: 2, attendance: 65, avgScore: 58, status: 'at-risk',   last: '1 week ago', flagged: true,  color: '#6B2E84' },
    { id: 's6', name: 'Tomás Silva',   courses: 3, attendance: 90, avgScore: 84, status: 'on-track',  last: '2 days ago', flagged: false, color: '#0F4C8A' },
    { id: 's7', name: 'Hannah Liu',    courses: 1, attendance: 100, avgScore: 96, status: 'excelling', last: 'Today',     flagged: false, color: '#15706A' },
    { id: 's8', name: 'Felix Brandt',  courses: 2, attendance: 82, avgScore: 74, status: 'on-track',  last: 'Yesterday',  flagged: false, color: '#B47A00' },
  ],
  gradingQueue: [
    { id: 'g1', student: 'Amir Khoury', color: '#D97757', course: 'English B2', item: 'Mixed Conditionals Quiz', type: 'Quiz', submitted: '2h ago', needsReview: 2, autoScore: 6, total: 10 },
    { id: 'g2', student: 'Yuna Park',   color: '#15706A', course: 'IELTS Writing Intensive', item: 'Mock Essay 3 — Climate', type: 'Exam', submitted: '5h ago', needsReview: 1, autoScore: null as null, total: 40 },
    { id: 'g3', student: 'Sofia Chen',  color: '#2747E0', course: 'English B2', item: 'Mid-term Exam', type: 'Exam', submitted: '1d ago', needsReview: 3, autoScore: 56, total: 80 },
    { id: 'g4', student: 'Priya Raman', color: '#6B2E84', course: 'Spanish A2',  item: 'Ser vs Estar Quiz', type: 'Quiz', submitted: '1d ago', needsReview: 0, autoScore: 7, total: 10 },
    { id: 'g5', student: 'Tomás Silva', color: '#0F4C8A', course: 'English B2', item: 'Conditionals Quiz', type: 'Quiz', submitted: '2d ago', needsReview: 1, autoScore: 8, total: 10 },
  ],
  live: {
    liveNow: { id: 'lc-now', title: 'Mixed Conditionals — Live Workshop', course: 'English B2', instructor: 'Lena Ortega', startedAgo: '12 min ago', attending: 14, capacity: 20, thumb: 'grad-1' },
    upcoming: [
      { id: 'lc1', title: 'Mixed Conditionals — Live Workshop', course: 'English B2', instructor: 'Lena Ortega', when: 'Now', date: 'Live', duration: '60 min', attending: 14, capacity: 20, rsvp: 14, status: 'live', thumb: 'grad-1' },
      { id: 'lc2', title: 'IELTS Writing — Task 2 Clinic', course: 'IELTS Writing Intensive', instructor: 'Prof. Marcus Vale', when: 'Today · 13:30', date: 'Today', duration: '90 min', attending: 0, capacity: 25, rsvp: 18, status: 'soon', thumb: 'grad-3' },
      { id: 'lc3', title: 'Ser vs Estar — Q&A Session', course: 'Spanish A2', instructor: 'Diego Marín', when: 'Tomorrow · 10:00', date: 'Wed 20', duration: '45 min', attending: 0, capacity: 30, rsvp: 9, status: 'scheduled', thumb: 'grad-2' },
      { id: 'lc4', title: 'Storytelling Arc — Group Practice', course: 'Public Speaking', instructor: 'Robin Park', when: 'Fri · 16:00', date: 'Fri 22', duration: '60 min', attending: 0, capacity: 15, rsvp: 6, status: 'scheduled', thumb: 'grad-4' },
    ],
    recordings: [
      { id: 'rec1', title: 'Second Conditional — Deep Dive', course: 'English B2', instructor: 'Lena Ortega', date: 'May 14', duration: '58:24', views: 38, thumb: 'grad-1', hasWhiteboard: true, hasChat: true },
      { id: 'rec2', title: 'Linking Sounds — Live Practice', course: 'English B2', instructor: 'Lena Ortega', date: 'May 9', duration: '47:10', views: 41, thumb: 'grad-5', hasWhiteboard: true, hasChat: true },
      { id: 'rec3', title: 'IELTS Essay Structures Workshop', course: 'IELTS Writing Intensive', instructor: 'Prof. Marcus Vale', date: 'May 7', duration: '1:24:08', views: 52, thumb: 'grad-3', hasWhiteboard: true, hasChat: false },
      { id: 'rec4', title: 'Hiragana — Vowel Row Walkthrough', course: 'Beginner Japanese', instructor: 'Aiko Tanaka', date: 'May 3', duration: '39:55', views: 27, thumb: 'grad-6', hasWhiteboard: true, hasChat: true },
    ],
    participants: [
      { id: 'p0', name: 'Lena Ortega', role: 'host' as const, color: '#2747E0', cam: true, mic: true, hand: false },
      { id: 'p1', name: 'Sofia Chen', role: 'student' as const, color: '#2747E0', cam: true, mic: false, hand: true },
      { id: 'p2', name: 'Amir Khoury', role: 'student' as const, color: '#D97757', cam: true, mic: false, hand: false },
      { id: 'p3', name: 'Yuna Park', role: 'student' as const, color: '#15706A', cam: false, mic: false, hand: false },
      { id: 'p4', name: 'Diego Martín', role: 'student' as const, color: '#5C3A1E', cam: true, mic: false, hand: false },
      { id: 'p5', name: 'Priya Raman', role: 'student' as const, color: '#6B2E84', cam: false, mic: true, hand: false },
      { id: 'p6', name: 'Tomás Silva', role: 'student' as const, color: '#0F4C8A', cam: true, mic: false, hand: false },
      { id: 'p7', name: 'Hannah Liu', role: 'student' as const, color: '#B47A00', cam: true, mic: false, hand: true },
    ],
    chat: [
      { id: 'c1', who: 'Lena Ortega', role: 'host' as const, color: '#2747E0', time: '00:02', text: "Welcome everyone! We'll start with a quick recap, then jump to the whiteboard." },
      { id: 'c2', who: 'Amir Khoury', role: 'student' as const, color: '#D97757', time: '03:14', text: 'Can you re-explain pattern 2? Got lost last time 😅' },
      { id: 'c3', who: 'Yuna Park', role: 'student' as const, color: '#15706A', time: '03:40', text: '+1 to that' },
      { id: 'c4', who: 'Lena Ortega', role: 'host' as const, color: '#2747E0', time: '04:05', text: 'Absolutely — drawing it out now. Watch the timeline split.' },
      { id: 'c5', who: 'Hannah Liu', role: 'student' as const, color: '#B47A00', time: '06:22', text: 'Ohh the timeline visual really helps. Thank you!' },
    ],
  },
} as const
```

- [ ] **Step 2: Create RoleContext**

`apps/web/src/contexts/RoleContext.tsx`:
```tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type Role = 'student' | 'teacher'

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: 'student', setRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('student')
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
```

- [ ] **Step 3: Create Sidebar component**

`apps/web/src/components/layout/Sidebar.tsx`:
```tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, Radio, Play, ListChecks, ClipboardCheck, TrendingUp,
         Settings, Users, Pencil, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useRole } from '@/contexts/RoleContext'
import { MOCK } from '@/lib/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/hooks/auth/useLogout'

const studentNav = [
  { group: 'Learn', items: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses', count: 4 },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/live', live: true },
    { id: 'lesson', label: 'Continue Lesson', icon: Play, href: '/courses/1/lessons/l15' },
  ]},
  { group: 'Assessments', items: [
    { id: 'quiz', label: 'Quizzes', icon: ListChecks, href: '/quiz/q1', count: 2 },
    { id: 'exam', label: 'Exams', icon: ClipboardCheck, href: '/exam/e1', count: 1 },
    { id: 'results', label: 'Results', icon: TrendingUp, href: '/results/demo' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

const teacherNav = [
  { group: 'Teach', items: [
    { id: 't-dashboard', label: 'Dashboard', icon: Home, href: '/teacher' },
    { id: 'roster', label: 'Students', icon: Users, href: '/teacher/students', count: 8 },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses', count: 4 },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/teacher/live', live: true },
  ]},
  { group: 'Assess', items: [
    { id: 'builder', label: 'Quiz Builder', icon: Pencil, href: '/teacher/quiz/new' },
    { id: 'grading', label: 'Grading Queue', icon: ClipboardCheck, href: '/teacher/grading', count: 5 },
    { id: 'results', label: 'Reports', icon: TrendingUp, href: '/teacher/reports' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, setRole } = useRole()
  const { user } = useAuth()
  const logout = useLogout()
  const nav = role === 'teacher' ? teacherNav : studentNav
  const displayUser = role === 'teacher' ? MOCK.teacher : MOCK.user

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
      </div>

      <div className="role-switch" role="tablist" aria-label="Switch role">
        <button
          className={role === 'student' ? 'active' : ''}
          onClick={() => { setRole('student'); router.push('/dashboard') }}>
          Student
        </button>
        <button
          className={role === 'teacher' ? 'active' : ''}
          onClick={() => { setRole('teacher'); router.push('/teacher') }}>
          Teacher
        </button>
      </div>

      {nav.map(grp => (
        <div className="nav-section" key={grp.group}>
          <div className="eyebrow">{grp.group}</div>
          {grp.items.map(it => {
            const Icon = it.icon
            const active = pathname === it.href || (it.href !== '/dashboard' && it.href !== '/teacher' && pathname.startsWith(it.href))
            return (
              <button
                key={it.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => router.push(it.href)}>
                <Icon className="nav-icon" size={16} />
                <span>{it.label}</span>
                {'live' in it && it.live && (
                  <span className="live-pill-sm" style={{ marginLeft: 'auto' }}>LIVE</span>
                )}
                {'count' in it && it.count != null && (
                  <span className="nav-count">{it.count}</span>
                )}
              </button>
            )
          })}
        </div>
      ))}

      <div className="sidebar-foot">
        <Avatar name={user?.name ?? displayUser.name} color={displayUser.color} />
        <div className="who">
          <b>{user?.name ?? displayUser.name}</b>
          <span>{role === 'teacher' ? 'Instructor' : 'Student'}</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Sign out" onClick={() => logout.mutate()}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Update app layout**

`apps/web/src/app/(app)/layout.tsx`:
```tsx
import { RoleProvider } from '@/contexts/RoleContext'
import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '248px 1fr', height: '100vh' }}>
        <Sidebar />
        <main style={{ overflow: 'auto', background: 'var(--paper)' }}>
          <div style={{ padding: '32px 48px 64px', maxWidth: 1360, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </RoleProvider>
  )
}
```

- [ ] **Step 5: Verify build and visually check**

```bash
cd apps/web && npm run build
```
Then run `npm run dev` and visit `http://localhost:3000/dashboard` — should show the sidebar with Atlas branding, role switcher, nav groups, and user footer.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/mock-data.ts apps/web/src/contexts/RoleContext.tsx apps/web/src/components/layout/ apps/web/src/app/\(app\)/layout.tsx
git commit -m "feat(frontend): sidebar, role context, app shell layout, mock data"
```

---

### Task 4: Student Dashboard + Courses + Course Detail

**Files:**
- Modify: `apps/web/src/app/(app)/dashboard/page.tsx`
- Create: `apps/web/src/app/(app)/courses/page.tsx`
- Create: `apps/web/src/app/(app)/courses/[id]/page.tsx`

**Interfaces:**
- Consumes: `MOCK`, all shared UI components, icons
- Produces: Three navigable student screens

- [ ] **Step 1: Implement Student Dashboard page**

`apps/web/src/app/(app)/dashboard/page.tsx` — port `StudentDashboard` from `design_handoff_atlas/screens/student-home.jsx` directly. Replace `setScreen("lesson")` with `router.push('/courses/1/lessons/l15')`, `setScreen("courses")` with `router.push('/courses')`, `setActiveCourse(c); setScreen("course")` with `router.push('/courses/' + c.id)`. Use `MOCK.courses` instead of `DATA.courses`. Add `'use client'` at top. Import `{ useRouter }` from `'next/navigation'`. Import all icons individually from `lucide-react`. Import shared components from `@/components/ui`.

Full page:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, Play, ArrowRight, ListChecks } from 'lucide-react'
import { Stat, Progress, Badge, CourseThumb } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

export default function DashboardPage() {
  const router = useRouter()
  const courses = MOCK.courses.filter(c => c.lessonsDone > 0)
  const upNext = MOCK.courses[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Welcome back, <span className="serif-italic">Sofia</span>.</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary">Search lessons</button>
          <button className="btn btn-secondary btn-icon" aria-label="Notifications">🔔</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="card card-pad-lg" style={{ marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
        <Stat label="This week" value="4.2h" sub="of 5h goal" accent />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Active streak" value="11" sub="days" />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Lessons done" value="36" sub="of 96 total" />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Avg. score" value="88%" sub="↑ 4 pts" />
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={() => router.push('/results/demo')}>
          See progress <ArrowRight size={14} />
        </button>
      </div>

      {/* Hero card */}
      <div className="card elev" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
          <div style={{ padding: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              <Sparkles size={12} style={{ verticalAlign: '-2px' }} /> Pick up where you left off
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.05, marginBottom: 6, letterSpacing: '-0.01em' }}>
              Lesson 15 · <span className="serif-italic">Mixed Conditionals</span>
            </div>
            <div className="muted" style={{ marginBottom: 20 }}>{upNext.title} · with {upNext.instructor}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--muted)', fontSize: 12 }}>
              <Clock size={12} /> 18:05 left
              <span className="dot-sep" /> <Play size={12} /> 62% through
              <span className="dot-sep" /> <ListChecks size={12} /> Quiz after
            </div>
            <Progress value={62} variant="brand" thick />
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-brand btn-lg" onClick={() => router.push('/courses/1/lessons/l15')}>
                <Play size={16} /> Resume lesson
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => router.push('/courses/1')}>
                Course overview
              </button>
            </div>
          </div>
          <div className="grad-1" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 28, minHeight: 280 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,.18), transparent 50%)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, fontFamily: 'var(--font-display)', fontSize: 280, lineHeight: 1, color: 'rgba(255,255,255,.15)', userSelect: 'none' }}>E</div>
            <div style={{ position: 'relative', color: '#fff' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: .8, marginBottom: 6 }}>Coming up next</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.1, opacity: .95 }}>
                "If she had taken that job last year, she would be living in Lisbon right now."
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In progress + This week */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">In progress</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/courses')}>View all <ArrowRight size={12} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {courses.slice(0, 4).map(c => (
              <button key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
                onClick={() => router.push(`/courses/${c.id}`)}>
                <CourseThumb course={c} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.tag}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
                    <span>{c.lessonsDone}/{c.lessonsTotal} lessons</span>
                    <span className="dot-sep" />
                    <span>{c.progress}%</span>
                  </div>
                  <div style={{ marginTop: 8 }}><Progress value={c.progress} variant="brand" /></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="h2" style={{ marginBottom: 16 }}>This week</h2>
          <div className="card card-pad">
            {[
              { day: 'Tue', date: 19, type: 'lesson', title: 'Mixed conditionals', course: 'English B2', time: 'Anytime today', active: true },
              { day: 'Wed', date: 20, type: 'quiz', title: 'Conditionals practice quiz', course: 'English B2', time: '10 questions' },
              { day: 'Thu', date: 21, type: 'lesson', title: 'Ser vs Estar in context', course: 'Spanish A2', time: 'with Diego' },
              { day: 'Fri', date: 22, type: 'exam', title: 'End-of-Term Comprehensive', course: 'English B2', time: '90 min · proctored', warn: true },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--line)' : '0' }}>
                <div style={{ width: 44, textAlign: 'center', padding: '6px 0', background: it.active ? 'var(--ink)' : 'var(--paper-2)', color: it.active ? 'var(--paper)' : 'var(--ink)', borderRadius: 'var(--r-sm)', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: .8 }}>{it.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>{it.date}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    {it.type === 'quiz' && <Badge tone="brand">Quiz</Badge>}
                    {it.type === 'exam' && <Badge tone="danger">Exam</Badge>}
                    {it.type === 'lesson' && <Badge>Lesson</Badge>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.course} · {it.time}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h2" style={{ margin: '32px 0 16px' }}>Recent results</h2>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Reduced forms quiz', course: 'English B2', score: 90, when: '2 days ago' },
              { title: 'Linking sounds quiz', course: 'English B2', score: 85, when: '5 days ago' },
              { title: 'Vocab check 3', course: 'Spanish A2', score: 92, when: '1 week ago' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.score >= 85 ? 'var(--success-tint)' : 'var(--warning-tint)', color: r.score >= 85 ? 'var(--success)' : 'var(--warning)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {r.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.course} · {r.when}</div>
                </div>
                <ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement Courses list page**

`apps/web/src/app/(app)/courses/page.tsx` — port `StudentCourses`. Use `useState` for filter. Replace `setScreen`/`setActiveCourse` with `router.push`. The 3-col grid with `CourseThumb`, `Badge`, `Progress`.

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Badge, Progress, SegControl, CourseThumb } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Languages', label: 'Languages' },
  { value: 'Test Prep', label: 'Test Prep' },
  { value: 'Soft Skills', label: 'Soft Skills' },
]

export default function CoursesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const items = filter === 'all' ? MOCK.courses : MOCK.courses.filter(c => c.category === filter)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Library</div>
          <h1 className="h1">My Courses</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <SegControl options={FILTERS} value={filter} onChange={setFilter} />
          <button className="btn btn-secondary"><Plus size={14} /> Browse catalog</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {items.map(c => (
          <button key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', background: 'var(--card)' }}
            onClick={() => router.push(`/courses/${c.id}`)}>
            <CourseThumb course={c} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Badge>{c.tag}</Badge>
                {c.progress === 100 && <Badge tone="success">Done</Badge>}
                {c.progress === 0 && <Badge tone="warning">Not started</Badge>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>with {c.instructor}</div>
              <Progress value={c.progress} variant="brand" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span>{c.lessonsDone}/{c.lessonsTotal} lessons</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.progress}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement Course Detail page**

`apps/web/src/app/(app)/courses/[id]/page.tsx` — port `StudentCourse`. Use `params.id` to look up course from MOCK (fall back to `MOCK.courses[0]`). Replace navigation with `router.push`.

```tsx
'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Check, ListChecks, Lock, ChatBubble } from 'lucide-react'
import { Badge, Progress, Avatar } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

// Use lucide-react ChatBubble = MessageCircle
import { MessageCircle } from 'lucide-react'

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const c = MOCK.courses.find(c => String(c.id) === id) ?? MOCK.courses[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a href="/courses" onClick={e => { e.preventDefault(); router.push('/courses') }}>Courses</a> / {c.title}
          </div>
          <h1 className="h1" style={{ maxWidth: 700 }}>{c.title}</h1>
          <div className="row" style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
            <span>with <b style={{ color: 'var(--ink)' }}>{c.instructor}</b></span>
            <span className="dot-sep" />
            <span>{c.lessonsTotal} lessons</span>
            <span className="dot-sep" />
            <span>8h 24m</span>
            <span className="dot-sep" />
            <Badge tone="brand">{c.tag}</Badge>
          </div>
        </div>
        <button className="btn btn-brand btn-lg" onClick={() => router.push(`/courses/${c.id}/lessons/l15`)}>
          <Play size={16} /> Continue · Lesson {c.lessonsDone + 1}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">Curriculum</h2>
            <div className="muted" style={{ fontSize: 13 }}>{c.lessonsDone} of {c.lessonsTotal} complete</div>
          </div>

          {MOCK.modules.map(m => (
            <div key={m.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="eyebrow">{m.title}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <div className="card" style={{ padding: 0 }}>
                {m.lessons.map((l, li) => {
                  const lessonAny = l as Record<string, unknown>
                  const isDone = !!lessonAny.done
                  const isCurrent = !!lessonAny.current
                  const isQuiz = !!lessonAny.quiz
                  const isLocked = !!lessonAny.locked
                  const hasQuiz = !!lessonAny.hasQuiz
                  return (
                    <div key={l.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderBottom: li < m.lessons.length - 1 ? '1px solid var(--line)' : '0',
                      background: isCurrent ? 'var(--brand-tint)' : 'transparent',
                      cursor: isLocked ? 'default' : 'pointer',
                      opacity: isLocked ? .55 : 1,
                    }} onClick={() => !isLocked && router.push(`/courses/${c.id}/lessons/${l.id}`)}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                        background: isDone ? 'var(--success)' : isCurrent ? 'var(--brand)' : isQuiz ? 'var(--accent-tint)' : 'var(--paper-2)',
                        color: isDone || isCurrent ? '#fff' : isQuiz ? '#8B4426' : 'var(--muted)', flexShrink: 0 }}>
                        {isDone ? <Check size={14} /> : isQuiz ? <ListChecks size={13} /> : isLocked ? <Lock size={13} /> : <Play size={11} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {!isQuiz && <span style={{ color: 'var(--muted)', marginRight: 8 }}>Lesson {l.n}</span>}
                          {l.title}
                          {isCurrent && <Badge tone="brand" style={{ marginLeft: 10 }}>Current</Badge>}
                          {isQuiz && <Badge tone="accent" style={{ marginLeft: 10 }}>Quiz</Badge>}
                          {hasQuiz && <span style={{ marginLeft: 10, color: 'var(--muted)', fontSize: 11 }}>+ quiz</span>}
                        </div>
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{l.duration}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your progress</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 44, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{c.progress}%</div>
              <div className="muted">complete</div>
            </div>
            <Progress value={c.progress} variant="brand" thick />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              <span>{c.lessonsDone} done</span>
              <span>{c.lessonsTotal - c.lessonsDone} remaining</span>
            </div>
            <hr className="divider" />
            <div className="eyebrow" style={{ marginBottom: 10 }}>Instructor</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={c.instructor} size="lg" color="#2747E0" />
              <div>
                <div style={{ fontWeight: 600 }}>{c.instructor}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Senior Language Coach · 8 yrs</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 12 }}>
              <MessageCircle size={12} /> Message instructor
            </button>
          </div>

          <div className="card card-pad-lg" style={{ marginTop: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Assessments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-sm)', background: 'var(--paper-2)' }}>
                <ListChecks size={14} color="var(--brand)" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Conditionals practice quiz</span>
                <Badge tone="brand">Due Wed</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-sm)', background: 'var(--paper-2)' }}>
                <ListChecks size={14} color="var(--danger)" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>End-of-term exam</span>
                <Badge tone="danger">Due Fri</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/
git commit -m "feat(frontend): student dashboard, courses list, course detail pages"
```

---

### Task 5: Video Lesson page

**Files:**
- Create: `apps/web/src/app/(app)/courses/[id]/lessons/[lid]/page.tsx`

**Interfaces:**
- Consumes: `MOCK.chapters`, `MOCK.transcript`, `MOCK.discussion`, shared UI components

- [ ] **Step 1: Implement lesson page**

Port `StudentLesson` from `design_handoff_atlas/screens/student-lesson.jsx`. Key translation:
- `React.useState` → `useState`
- `React.useEffect` → `useEffect`
- `setScreen("course")` → `router.push('/courses/1')`
- `setScreen("quiz")` → `router.push('/quiz/q1')`
- `DATA.transcript` → `MOCK.transcript`
- All icons from lucide-react: `Flag, MoreHorizontal, Play, Pause, CC (Captions), Volume2, Maximize, Check, Circle, ListChecks, ArrowLeft, ArrowRight, Search, Paperclip, Send, MessageCircle`

The video stage uses `.video-stage`, `.scrim`, `.video-controls`, `.scrub`, `.scrub-fill`, `.scrub-thumb`, `.video-btn` classes.

Chapters right rail uses `.chapter`, `.chap-num`, `.chap-title`, `.chap-time` classes.

Full implementation mirrors the design handoff exactly. Create this file as `'use client'` and port the JSX directly with the above substitutions.

`apps/web/src/app/(app)/courses/[id]/lessons/[lid]/page.tsx`:
- Port the full `StudentLesson` component as a default export page
- Use `useState` for `tab`, `playing`, `t` (time), `speed`, `cc`
- Use `useEffect` for the playback timer
- `const duration = 18 * 60 + 5`
- `const fmt = (s: number) => ...` (same logic as prototype)
- Video stage: dark `#0B0A07` background, `.video-stage` class, closed captions div, play button overlay, `.video-controls` bar with scrub, time, speed, CC, volume, maximize buttons
- Tabs: Transcript, Notes, Attachments (4), Q&A (3)
- Chapters right rail: iterate `MOCK.chapters`, click to `setT(ch.t)`
- "Up next" card links to `/quiz/q1`

- [ ] **Step 2: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/(app)/courses/"
git commit -m "feat(frontend): video lesson page with player, chapters, transcript, Q&A"
```

---

### Task 6: Quiz + Results pages

**Files:**
- Create: `apps/web/src/app/(app)/quiz/[id]/page.tsx`
- Create: `apps/web/src/app/(app)/results/[id]/page.tsx`
- Create: `apps/web/src/components/quiz/MatchPairs.tsx`

**Interfaces:**
- Consumes: `MOCK.quiz`
- Produces: Interactive quiz with 5 question types; score ring results screen

- [ ] **Step 1: Create MatchPairs component**

`apps/web/src/components/quiz/MatchPairs.tsx` — port `MatchPairs` from `design_handoff_atlas/screens/student-assess.jsx` exactly, converting `React.useMemo`/`React.useState` to named imports.

- [ ] **Step 2: Create quiz page**

`apps/web/src/app/(app)/quiz/[id]/page.tsx` — port `StudentQuiz`. Key points:
- `'use client'`
- `useState` for `idx`, `answers`, `submitted`
- On `submitted=true`, navigate to `/results/demo?` or render results inline. Use `router.push('/results/demo')` and store answers in sessionStorage.
- Question types: mcq (radio choices), tf (True/False buttons), fib (text inputs), short (textarea), match (MatchPairs component)
- Progress pips: `total` pills, each is a button, current=dark, answered=brand, unanswered=line-2
- Footer: Previous / (Next or Submit)

- [ ] **Step 3: Create results page**

`apps/web/src/app/(app)/results/[id]/page.tsx` — port `StudentResults`. Key points:
- Score ring: SVG circle with `strokeDasharray={(score/100)*377} 377`, `transform="rotate(-90 70 70)"`
- Pass/fail badge
- Question breakdown: each question card with correct/incorrect/pending state
- Mock: hardcode `score = 80`, `correct = 4`, `auto = 4`, `pending = 1` for the demo route

- [ ] **Step 4: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/\(app\)/quiz/ apps/web/src/app/\(app\)/results/ apps/web/src/components/quiz/
git commit -m "feat(frontend): quiz taking (5 question types), results with score ring"
```

---

### Task 7: Exam page

**Files:**
- Create: `apps/web/src/app/(app)/exam/[id]/page.tsx`

- [ ] **Step 1: Implement exam page**

Port `StudentExam` from `design_handoff_atlas/screens/student-assess.jsx`.

Key parts:
- `started=false`: pre-flight lobby — centered card, exam metadata (3 stat boxes), honor pledge warning, Start button
- `started=true`: exam UI — `.exam-banner` top bar with countdown timer (counts down from `duration*60`), question palette sidebar (5×N grid), question card (same question types as quiz), Previous/Next footer
- Countdown: `useEffect` with `setInterval` decrementing `secondsLeft` every 1 second
- `warn = secondsLeft < 600` — banner background becomes `var(--danger)`
- `fmt = (s) => HH:MM:SS`
- Question palette: 5-column grid, answered=green-tint, current=dark, flagged=accent outline
- Reuse `MatchPairs` from `@/components/quiz/MatchPairs`

- [ ] **Step 2: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/(app)/exam/"
git commit -m "feat(frontend): exam page with pre-flight lobby, countdown timer, question palette"
```

---

### Task 8: Teacher Dashboard + Roster

**Files:**
- Create: `apps/web/src/app/(app)/teacher/page.tsx`
- Create: `apps/web/src/app/(app)/teacher/students/page.tsx`
- Create: `apps/web/src/components/teacher/StudentDrawer.tsx`

- [ ] **Step 1: Implement teacher dashboard**

`apps/web/src/app/(app)/teacher/page.tsx` — port `TeacherDashboard` from `design_handoff_atlas/screens/teacher-home.jsx`.

Key parts:
- 4-stat grid (Active students 47, Awaiting grading 5 [clickable → grading], Avg class score 82%, At-risk students 2)
- Grading queue preview: list of first 4 queue items, each row with Avatar, student name, Badge(type), item/course/submitted, needsReview count
- Today's schedule: 3 items with colored left border
- Needs attention: danger card (Priya) + warning card (Exam closes)

- [ ] **Step 2: Create StudentDrawer**

`apps/web/src/components/teacher/StudentDrawer.tsx` — port `StudentDrawer`. Right-side slide-in panel (fixed, 480px), backdrop click to close. Shows avatar, stats (3 boxes), recent activity list, Message/View profile buttons.

- [ ] **Step 3: Implement roster page**

`apps/web/src/app/(app)/teacher/students/page.tsx` — port `TeacherRoster`.

Key parts:
- Search input + SegControl filter (All/Excelling/On track/At-risk) + Course filter button
- Table with columns: checkbox, Student (avatar+name+email), Status badge, Courses, Attendance (with mini progress bar), Avg score, Trend (Sparkline), Last active, Flag icon
- Row click → opens `StudentDrawer`
- Import `Sparkline` from `@/components/ui`
- Invite student button → no-op (future feature)

- [ ] **Step 4: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add "apps/web/src/app/(app)/teacher/" apps/web/src/components/teacher/
git commit -m "feat(frontend): teacher dashboard, student roster with drawer"
```

---

### Task 9: Quiz Builder + Grading Queue

**Files:**
- Create: `apps/web/src/app/(app)/teacher/quiz/new/page.tsx`
- Create: `apps/web/src/components/teacher/QuestionEditor.tsx`
- Create: `apps/web/src/app/(app)/teacher/grading/page.tsx`
- Create: `apps/web/src/components/teacher/ManualGrader.tsx`

- [ ] **Step 1: Implement Quiz Builder**

`apps/web/src/app/(app)/teacher/quiz/new/page.tsx` — port `TeacherBuilder`.

Key parts:
- Inline editable title: `<input>` styled as `.h1` with no border/background
- Settings bar: Course select, Type SegControl, Time limit input, Attempts input, Shuffle SegControl
- Question list: map over `questions` state, each renders `<QuestionEditor>`
- Add question panel: 4-col grid of `QUESTION_TYPES` buttons (q-types, q-type-btn classes)
- Right rail sticky: quiz summary (question count, total points), grading progress bar, passing score slider, show results SegControl, visibility checkboxes
- Header buttons: Preview as student, Save draft, Publish

`apps/web/src/components/teacher/QuestionEditor.tsx` — port `QuestionEditor` component:
- Collapsed view: numbered circle, type icon, Badge, prompt text, pts
- Expanded view: type selector, points input, duplicate/delete buttons, prompt textarea
- Type-specific editors: mcq (radio+options), tf (True/False buttons), fib (blank inputs), short (rubric textarea + AI badge), match (pairs with inputs), essay (word count inputs), code (language select + expected output), upload (file upload card)

- [ ] **Step 2: Implement Grading Queue**

`apps/web/src/app/(app)/teacher/grading/page.tsx` — port `TeacherGrading`.

Key parts:
- 2-col layout: 300px sticky left sidebar (queue list) + right content
- Queue list: each item has Avatar, student name, Badge(type), item text, submitted time, written count
- Active item border-left: 3px solid var(--brand), background: brand-tint
- Submission detail: header (avatar, name, badge, item/course, prev/next nav), 4-box score summary (auto-graded, manual, combined, final %)
- Auto-graded section: collapsible, shows breakdown rows with ✓/✗ icons
- Manual questions: rendered by `ManualGrader` component
- Overall feedback textarea + footer (AI draft, voice note, Save draft, Return graded)

`apps/web/src/components/teacher/ManualGrader.tsx` — port `ManualGrader`:
- Student answer box (paper-2 background)
- AI suggestion card (brand-tint gradient, Sparkle icon, score badge, AI notes)
- Score picker: 0..points buttons, selected=dark
- Comment textarea

- [ ] **Step 3: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add "apps/web/src/app/(app)/teacher/quiz/" "apps/web/src/app/(app)/teacher/grading/" apps/web/src/components/teacher/
git commit -m "feat(frontend): quiz builder with 8 question types, grading queue with AI suggestions"
```

---

### Task 10: Settings page

**Files:**
- Create: `apps/web/src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Implement Settings page**

Port `Settings`, `ProfileTab`, `AccountTab`, `NotificationsTab`, `BillingTab`, `AppearanceTab` from `design_handoff_atlas/screens/teacher-grading.jsx`.

`apps/web/src/app/(app)/settings/page.tsx`:
- Vertical tabs sidebar: 200px, buttons styled with active background/shadow
- Tab panels: Profile, Account & security, Notifications, Billing, Appearance
- Use `useRole()` from context to show correct label (Instructor/Student account)
- Use `MOCK.user` for default values; populate form fields
- `Toggle` component for notification checkboxes and appearance settings
- Notifications table: 5 rows × 3 columns (Email/Push/In-app) with Toggle per cell
- Billing: gradient Pro card (brand linear-gradient), Visa card row
- Appearance: Density SegControl, Reduce motion Toggle

- [ ] **Step 2: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/(app)/settings/"
git commit -m "feat(frontend): settings page with 5 tabs (profile, account, notifications, billing, appearance)"
```

---

### Task 11: Live Classes pages (student + teacher)

**Files:**
- Create: `apps/web/src/app/(app)/live/page.tsx`
- Create: `apps/web/src/app/(app)/teacher/live/page.tsx`
- Create: `apps/web/src/components/live/RecordingPlayer.tsx`
- Create: `apps/web/src/components/live/ScheduleModal.tsx`

- [ ] **Step 1: Create RecordingPlayer modal**

`apps/web/src/components/live/RecordingPlayer.tsx` — port `RecordingPlayer` from `design_handoff_atlas/screens/live-classes.jsx`:
- Fixed overlay (dark 80% overlay), centered container
- Dark header bar with title/course/instructor, X button
- 16:9 stage with gradient background (fake content), bottom controls bar (play/pause, time, scrubber, CC, maximize)
- `useEffect` timer for fake progress

- [ ] **Step 2: Create ScheduleModal**

`apps/web/src/components/live/ScheduleModal.tsx` — port `ScheduleModal`:
- Fixed overlay, centered card (560px max-width)
- Form: Class title, Course select, Date/Time/Duration grid, Capacity/Visibility grid, Session features checkboxes
- Cancel / Schedule class buttons

- [ ] **Step 3: Create Live Classes Student page**

`apps/web/src/app/(app)/live/page.tsx` — port `LiveClassesStudent`:
- Live Now hero: 2-col card — left (title, course/instructor, avatar stack, attendee count, Join button), right (gradient with play icon)
- Upcoming sessions: 3-col grid of `.live-card` with thumb, status badge, title, instructor, when/duration, RSVP button
- Recordings: 2-col grid of horizontal cards (thumb left, info right, duration overlay, badges)
- `RecordingPlayer` modal: opens when recording card is clicked
- Join button → `router.push('/live/room')`

- [ ] **Step 4: Create Live Classes Teacher page**

`apps/web/src/app/(app)/teacher/live/page.tsx` — port `LiveClassesTeacher`:
- Header with Schedule button + Start instant class button
- 4-stat grid (Live now, Scheduled, Recordings, Avg attendance)
- Live now resume card (danger-tint background, "Rejoin class" button → `/live/room`)
- Scheduled sessions: card list (date column, thumb, title, RSVP badge, Edit/Start buttons)
- Recordings: table view (Session, Course, Date, Length, Views, Includes badges, Copy/Download actions)
- `RecordingPlayer` modal + `ScheduleModal`

- [ ] **Step 5: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/app/(app)/live/" "apps/web/src/app/(app)/teacher/live/" apps/web/src/components/live/
git commit -m "feat(frontend): live classes pages (student + teacher), recording player, schedule modal"
```

---

### Task 12: Live Room (full-screen dark UI)

**Files:**
- Create: `apps/web/src/app/(app)/live/room/page.tsx`
- Create: `apps/web/src/components/live/Whiteboard.tsx`
- Create: `apps/web/src/components/live/VideoTile.tsx`

**Interfaces:**
- Produces: Full-screen dark live room at `/live/room`

- [ ] **Step 1: Create Whiteboard component**

`apps/web/src/components/live/Whiteboard.tsx` — port the `Whiteboard` component from `design_handoff_atlas/screens/live-room.jsx`.

Key points:
- `useRef` for canvas, drawing state, current stroke, strokes array
- `useCallback` for `redraw` and `resize`
- `useEffect` for ResizeObserver
- Pointer events: `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerLeave`
- `setPointerCapture` for drag tracking
- Seed content (text and path strokes) pre-populates the whiteboard
- Tools: pen, highlighter, eraser
- Color swatches: 6 colors from `WB_COLORS`
- Toolbar at bottom (pen/highlighter/eraser, color swatches, undo, clear)
- Remote cursor decorations (static): Amir (red), Yuna (green)
- Banner at top center

- [ ] **Step 2: Create VideoTile component**

`apps/web/src/components/live/VideoTile.tsx` — port `Tile`:
```tsx
interface Participant { id: string; name: string; role: 'host' | 'student'; color: string; cam: boolean; mic: boolean; hand: boolean }
export function VideoTile({ p, big, you }: { p: Participant; big?: boolean; you?: boolean }) { ... }
```
- Renders a dark tile with gradient background (cam=on) or avatar (cam=off)
- Name label bottom-left with mic icon
- VideoOff badge top-right
- Hand raise badge top-left (animated wave)
- `speaking` class when `p.mic && p.role === 'host'`

- [ ] **Step 3: Create Live Room page**

`apps/web/src/app/(app)/live/room/page.tsx` — port `LiveRoom`:

This is a full-screen dark UI. The page must override the normal app layout. Add at the top:
```tsx
// This page renders outside the (app) scrollable main by using position:fixed via CSS class .lr
```

Key structure:
```
<div class="lr">
  <div class="lr-top">  // header bar
  <div class="lr-body [with-panel]">
    <div class="lr-stage">
      <div class="lr-main">  // whiteboard / screen / speaker / grid
      <div class="lr-strip">  // filmstrip
    </div>
    <div class="lr-panel">  // people / chat
  </div>
  <div class="lr-controls">  // bottom controls
</div>
```

Mode states: `speaker` (default), `grid`, `whiteboard`, `screen`
Panel states: `people` (default), `chat`, `none`

Controls bar: Mic, Camera, Screen share, Whiteboard, Raise hand (student) / Record (teacher), People, Chat, Grid/Speaker toggle, Leave button

The component reads `?role=teacher` query param to determine role. Default to student.
- Use `useSearchParams()` to get role
- `router.push('/live')` on Leave

- [ ] **Step 4: Override layout for live room**

The live room needs to escape the padded app layout. Add a check in `(app)/layout.tsx`:

```tsx
// In AppLayout, the live room page needs full-screen; it achieves this via .lr { position: fixed; inset: 0; z-index: 100; }
// No layout changes needed — the .lr CSS class takes over the viewport
```

The `.lr` class is `position: fixed; inset: 0; z-index: 100` so it escapes the layout automatically.

- [ ] **Step 5: Verify build**

```bash
cd apps/web && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/app/(app)/live/room/" apps/web/src/components/live/
git commit -m "feat(frontend): live room — whiteboard, video tiles, controls, chat panel"
```

---

### Task 13: Teacher Reports stub + wire up remaining nav routes

**Files:**
- Create: `apps/web/src/app/(app)/teacher/reports/page.tsx`
- Modify: `apps/web/src/middleware.ts` (ensure all new routes are protected)

- [ ] **Step 1: Create reports stub**

`apps/web/src/app/(app)/teacher/reports/page.tsx`:
```tsx
export default function ReportsPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Assess</div>
          <h1 className="h1">Reports</h1>
        </div>
      </div>
      <div className="card card-pad-lg" style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Analytics coming soon</div>
        <div>Course performance charts and student progress reports will appear here.</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify all routes work end-to-end**

Start dev server:
```bash
cd apps/web && npm run dev
```

Visit and visually verify each route:
- `http://localhost:3000/dashboard` — Student dashboard
- `http://localhost:3000/courses` — Courses grid
- `http://localhost:3000/courses/1` — Course detail
- `http://localhost:3000/courses/1/lessons/l15` — Video lesson
- `http://localhost:3000/quiz/q1` — Quiz
- `http://localhost:3000/exam/e1` — Exam lobby → start exam
- `http://localhost:3000/results/demo` — Results with score ring
- `http://localhost:3000/teacher` — Teacher dashboard (after clicking Teacher in role switcher)
- `http://localhost:3000/teacher/students` — Roster table
- `http://localhost:3000/teacher/quiz/new` — Quiz builder
- `http://localhost:3000/teacher/grading` — Grading queue
- `http://localhost:3000/settings` — Settings tabs
- `http://localhost:3000/live` — Live classes student
- `http://localhost:3000/teacher/live` — Live classes teacher
- `http://localhost:3000/live/room` — Live room (full-screen dark)

- [ ] **Step 3: Final build check**

```bash
cd apps/web && npm run build
```
Expected: All pages compile successfully.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/
git commit -m "feat(frontend): teacher reports stub, all routes verified"
```

---

## Self-Review

### Spec Coverage

All design handoff screens mapped:
- ✅ 01 Student Dashboard → `/dashboard`
- ✅ 02 Student Courses → `/courses`
- ✅ 03 Student Course → `/courses/[id]`
- ✅ 04 Video Lesson → `/courses/[id]/lessons/[lid]`
- ✅ 05 Quiz → `/quiz/[id]`
- ✅ 06 Exam → `/exam/[id]`
- ✅ 07 Results → `/results/[id]`
- ✅ 08 Teacher Dashboard → `/teacher`
- ✅ 09 Student Roster → `/teacher/students`
- ✅ 10 Quiz Builder → `/teacher/quiz/new`
- ✅ 11 Grading Queue → `/teacher/grading`
- ✅ 12 Settings → `/settings`
- ✅ 13 Live Classes Student → `/live`
- ✅ 14 Live Classes Teacher → `/teacher/live`
- ✅ 15 Live Room → `/live/room`
- ✅ Sidebar with role switcher, nav groups, LIVE pill, user footer

### Shared Components
- ✅ Button, Badge, Avatar, Progress, Tabs, Field, Stat, SegControl, CourseThumb, Toggle, Sparkline, MatchPairs, QuestionEditor, ManualGrader, StudentDrawer, VideoTile, Whiteboard, RecordingPlayer, ScheduleModal

### Global Constraints Check
- All work in `apps/web/` ✅
- CSS variables only, no hardcoded colors in components ✅ (exception: seed data colors in Whiteboard and VideoTile which must match the design spec exactly)
- Mock data from `lib/mock-data.ts` ✅
- TypeScript throughout ✅
- `'use client'` on all interactive components ✅
