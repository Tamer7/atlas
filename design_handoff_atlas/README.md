# Atlas — Developer Handoff

## Overview

Atlas is a full-stack tutoring/learning platform. Students enrol in courses, watch recorded lessons, take quizzes and timed exams, and join live classes. Teachers manage their roster, build assessments, grade written answers (with AI suggestions), host live classes with a collaborative whiteboard, and publish recordings automatically.

This package contains **high-fidelity HTML prototypes** — design references showing the intended look, layout, copy, and interactions. Your job is to **recreate these designs in a Next.js (App Router) frontend** speaking to a **Laravel 11 REST API backend**. Do not ship the prototype HTML directly; use it as a pixel-accurate spec.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** | TypeScript, Tailwind CSS |
| Backend | **Laravel 11** | REST API, Sanctum auth, Queues |
| Database | **PostgreSQL** | via Laravel Eloquent |
| Auth | **Laravel Sanctum** | SPA cookie auth + magic-link tokens |
| Real-time classroom | **LiveKit** (self-hosted or LiveKit Cloud) | See `REALTIME.md` |
| File storage | **S3-compatible** (AWS / Cloudflare R2) | Videos, attachments, recordings |
| Video transcoding | **FFmpeg via Laravel Queue** | Or delegate to Mux |
| Search | **Laravel Scout + Meilisearch** | Course/lesson search |
| Email | **Mailgun / Resend** | Magic link, notifications |
| Queue | **Laravel Horizon + Redis** | Background jobs |
| Cache | **Redis** | Sessions, rate-limiting |

---

## Repository Structure (recommended)

```
atlas/
├── apps/
│   └── web/          ← Next.js frontend  (this README lives here)
└── api/              ← Laravel backend
```

Or two separate repos — your call.

---

## Design Tokens

All tokens are defined in `styles.css` → `:root`. Translate to Tailwind config / CSS variables in Next.js.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#F6F4EE` | App background |
| `--paper-2` | `#EFECE3` | Sidebar, input backgrounds |
| `--card` | `#FFFFFF` | Card surfaces |
| `--ink` | `#14130F` | Primary text, primary button bg |
| `--ink-2` | `#2A2823` | Secondary text |
| `--muted` | `#6E6A60` | Tertiary / helper text |
| `--faint` | `#A8A39A` | Placeholder, disabled |
| `--line` | `#E5E1D6` | Borders (light) |
| `--line-2` | `#D7D2C4` | Borders (medium) |
| `--brand` | `#2747E0` | Brand primary (indigo) |
| `--brand-2` | `#1F3AC2` | Brand hover |
| `--brand-tint` | `#E6EAFB` | Brand light bg |
| `--accent` | `#D97757` | Terracotta accent |
| `--accent-tint` | `#F6E6DC` | Accent light bg |
| `--success` | `#1F7A47` | Pass / correct |
| `--success-tint` | `#DCEEDE` | Success bg |
| `--warning` | `#B47A00` | Warning |
| `--warning-tint` | `#F7EBC9` | Warning bg |
| `--danger` | `#B43A2A` | Error / fail |
| `--danger-tint` | `#F4DDD6` | Error bg |
| Live red | `#FF3B3B` | LIVE pill, REC indicator |
| Speaking green | `#4ADE80` | Active mic in classroom |

### Typography

| Token | Value |
|---|---|
| `--font-sans` | `"Geist"` (Google Fonts or Vercel CDN) |
| `--font-mono` | `"Geist Mono"` |
| h1 | 38px / 600 / -0.025em tracking |
| h2 | 28px / 600 / -0.01em |
| h3 | 18px / 600 / -0.005em |
| body | 14px / 400 / 1.45 lh |
| eyebrow | 11px / 600 / 0.14em tracking / uppercase / muted |

### Spacing / Radius

| Token | Value |
|---|---|
| `--r-xs` | 4px |
| `--r-sm` | 6px |
| `--r-md` | 10px |
| `--r-lg` | 14px |
| `--r-xl` | 20px |
| `--r-pill` | 999px |

### Shadows

| Token | Value |
|---|---|
| `--sh-sm` | `0 1px 2px rgba(20,19,15,.05)` |
| `--sh-md` | `0 4px 12px rgba(20,19,15,.06), 0 1px 2px rgba(20,19,15,.04)` |
| `--sh-lg` | `0 12px 36px rgba(20,19,15,.10), 0 2px 6px rgba(20,19,15,.05)` |
| `--sh-pop` | `0 24px 60px rgba(20,19,15,.18)` |

---

## App Layout

The app has two zones:
- **Public zone** — Login (`/login`). No sidebar.
- **App zone** — All authenticated routes. Fixed `248px` left sidebar + scrollable main content area.

### Sidebar

- **Brand mark** top: logo mark (28×28, ink bg, "A") + "Atlas" wordmark.
- **Role switcher**: two-segment control — `Student` | `Teacher`. Switching updates the nav and redirects to that role's dashboard. Both roles are on the same account for now.
- **Nav groups** with labelled sections. Active item: white card background + `--sh-sm`.
- **LIVE pill** on the "Live Classes" nav item when a session is in progress.
- **User footer**: avatar + name + role label + logout icon button.

---

## Screens

### 00 · Login (`/login`)

**Layout**: Full-viewport 2-column grid (`1fr 1fr`).

**Left column** — form area, centred, max-width 420px:
- Brand mark
- h1: "Welcome back."
- Subtext muted paragraph
- **Auth mode toggle** (2-segment: Magic link | Password) — `background: paper-2, border-radius: r-md`
  - Magic link mode: email input → "Send sign-in link" button → success state (green card, check inbox)
  - Password mode: email + password (with show/hide toggle) + forgot password link
- "OR" divider
- "Continue with Google" button (standard Google OAuth branding)
- "Create an account" link

**Right column** — brand panel, brand gradient (`--brand` → `--brand-2` → `#0E2278`):
- Live sessions counter top-left (green dot + text)
- Large display headline: "Learn anything, one focused session at a time." (38px+, 600 weight)
- Two decorative cards: "Now playing" (progress bar) + "Today" (lesson count chips)
- Testimonial quote + attribution at bottom

**Auth flows to implement**:
1. Magic link: `POST /api/auth/magic-link` → user gets email → clicks link with token → `GET /api/auth/magic-link/verify?token=…` → Sanctum session set → redirect to dashboard
2. Password: `POST /api/auth/login` (email + password) → Sanctum session
3. Google OAuth: Laravel Socialite → `/api/auth/google` → callback → session
4. Logout: `POST /api/auth/logout`

---

### 01 · Student Dashboard (`/dashboard`)

**Layout**: Full-width main content, `padding: 32px 48px`.

**Page header**: date eyebrow, h1 "Welcome back, {firstName}.", search + bell buttons right.

**Stats row** (card, flex, gap-32): 4 stats — "This week", "Active streak", "Lessons done", "Avg. score". Right-aligned "See progress →" link.

**Hero card** (no padding, 2-col grid `1.1fr 1fr`):
- Left: eyebrow + lesson title (display font) + instructor + meta chips (time remaining, progress %, "Quiz after") + thick progress bar + two CTA buttons
- Right: gradient panel (grad-1 = brand blue) with large decorative letter + quote text

**In progress courses** (2-col grid): Course thumb cards with progress bar. Click → course page.

**This week** (right column): date-pill list of upcoming lessons/quizzes/exams.

**Recent results** (right column): score circle + title + when.

---

### 02 · My Courses (`/courses`)

**Layout**: Page header + filter control + 3-col card grid.

**Filter**: Segmented control — All | Languages | Test Prep | Soft Skills.

**Course card**: thumbnail (gradient bg + glyph), badge chips (tag, status), title, instructor, progress bar, `n/total lessons` + %.

Click → course page.

---

### 03 · Course Page (`/courses/[id]`)

**Layout**: Page header with "Continue" CTA + 2-col grid (`1.6fr 1fr`).

**Left** — Curriculum: modules (eyebrow + divider) each containing lesson rows:
- Status icon (done=green check, current=brand play, quiz=accent list, locked=lock)
- Lesson number + title + badge (Current / Quiz) + duration/count right-aligned
- Current lesson highlighted `brand-tint` background

**Right** — Sticky panel:
- Progress % (large display number) + thick progress bar
- Instructor card (avatar + name + role + "Message" button)
- Assessments due (quiz + exam with coloured badges)

---

### 04 · Video Lesson (`/courses/[id]/lessons/[lessonId]`)

**Layout**: Page header + 2-col grid (`1fr 340px`).

**Video player** (`.video-stage`):
- Aspect ratio 16:9, dark background, decorative overlay
- Captions overlay (bottom-centre, semi-transparent)
- Play/pause button (centred, 76px white circle when paused)
- Controls bar (bottom, gradient): play/pause, timestamp, scrubber (click to seek), speed selector (1×/1.25×/1.5×/2×), CC toggle, volume, fullscreen

**Below player**: Previous / Next lesson buttons.

**Tabs** below player controls: Transcript | Notes | Attachments | Q&A

- **Transcript**: timestamped lines, search input, auto-scroll toggle. Active line highlighted brand-tint.
- **Notes**: textarea (auto-save on blur), export PDF button.
- **Attachments**: 2-col grid of file cards (icon + name + size + download button).
- **Q&A / Discussion**: post form (avatar + textarea + attach + send); thread list (avatar, name, instructor badge, time, reply count).

**Right rail** — Chapters list:
- Each chapter: number, done/current/empty icon, title, timestamp
- Click seeks video to that chapter's time offset
- Up-next card below (quiz or next lesson)

---

### 05 · Quiz Taking (`/quiz/[id]`)

**Layout**: Page header + centred quiz shell (max-width 760px).

**Progress bar**: Row of n coloured pips (ink=current, brand=answered, line-2=unanswered). Click to jump.

**Question card**:
- Question type badge + points
- Prompt text (display font, 26px)
- Answer area by type:
  - **MCQ**: vertical list of `.choice` divs (letter circle + text). Click to select. States: default / selected (ink bg on letter) / correct (success) / wrong (danger).
  - **True/False**: 2-col grid of large text buttons.
  - **Fill in the blank**: one input per blank.
  - **Short answer**: textarea + word count.
  - **Match pairs**: left column static, right column `<select>` per item.
  - **Essay**: textarea with min/max word count.
  - **Code/Math**: Monaco-style textarea, language selector.
  - **File upload**: drag-drop area.

**Footer**: Previous / Flag / Next (or Submit on last question).

**Submission** → results screen.

---

### 06 · Exam (`/exam/[id]`)

**Pre-flight screen**: exam details card (duration, question count, points, honor pledge) + Start button.

**Exam layout**: Top banner (ink bg → danger bg when <10 min) with live countdown `HH:MM:SS`, question counter, save+exit, submit early.

**Body** (2-col, `1fr 280px`):
- Left: same question card as quiz
- Right: question palette (5-col grid of number buttons: ink=current, success-tint=answered, paper-2=unanswered, accent outline=flagged) + legend

Timer counts down in real time. Auto-submit at 0:00.

---

### 07 · Results (`/results/[attemptId]`)

**Score hero**: animated SVG ring (brand stroke, score %), "Passed/Failed" badge, display congratulations text, class average + time taken stats.

**Breakdown**: one card per question. Header: correct/wrong/pending icon + type badge + points. Shows correct vs given answer for wrong MCQ. Shows "Pending review" state for written answers.

**Footer**: Retake / Continue buttons.

---

### 08 · Teacher Dashboard (`/teacher/dashboard`)

4-col stats row → grading queue list → today's schedule → at-risk alerts.

**At-risk card**: danger-tint border, flag icon, student name + issue + "Reach out" button.

---

### 09 · Student Roster (`/teacher/students`)

**Search + filter** (segmented: All | Excelling | On track | At-risk) + export CSV + invite button.

**Table columns**: checkbox, student (avatar + name + email), status badge, courses, attendance (% + mini progress bar), avg score, sparkline (7-point polyline), last active, flag icon.

**Student drawer** (slide-in right panel, 480px, overlay):
- Avatar + name + email + close button
- 3-col stats (avg score, attendance, courses)
- Recent activity list
- Message + View profile buttons

---

### 10 · Quiz Builder (`/teacher/quiz/new`, `/teacher/quiz/[id]/edit`)

**Header**: inline editable title input (38px display) + Preview / Save draft / Publish buttons.

**Settings bar**: course selector, type (Quiz/Exam), time limit, attempts, shuffle toggle.

**Question list**: collapsed (number circle + type icon + prompt + points + chevron) / expanded (full editor per type).

**Per-type editors**:
- MCQ: radio to mark correct + option text inputs + "Add option"
- T/F: two large clickable buttons, active = success-tint
- Fill blank: blank inputs + "alt answer" option
- Short answer: rubric textarea + AI note
- Match: left/right input pairs + add pair
- Essay: min/max word count fields
- Code: expected output textarea + language select
- Upload: drop zone (PDF, DOCX, JPG, MP3, max 25MB)

**Right rail** (sticky): question count, total points, auto/manual grading breakdown progress bar, passing score slider, show-results segmented control, visibility checkboxes.

**Add question** button → type picker grid (8 types, each with icon + label + desc + Auto/Manual badge).

---

### 11 · Grading Queue (`/teacher/grading`)

**Layout**: 2-col (`300px 1fr`).

**Queue sidebar** (sticky): All/Mine toggle, list of submissions (avatar + student + type badge + item + time + written count). Active item has left brand border + brand-tint bg.

**Submission detail**:
- Student header + prev/next navigation
- 4-col score summary (auto-graded, manual, combined, final grade %)
- Auto-graded section (collapsible list: correct/wrong rows)
- Manual question graders (one card each):
  - Question prompt (display)
  - Student answer (paper-2 panel)
  - AI suggestion card (brand-tint gradient, suggested score badge, notes, rubric reference)
  - Score picker (0…n buttons)
  - Comment textarea
- Overall feedback textarea + AI draft / Attach voice note + Save / Return graded

---

### 12 · Settings (`/settings`)

**Layout**: 2-col (`200px 1fr`), left = vertical tabs.

**Tabs**: Profile | Account & security | Notifications | Billing | Appearance

- **Profile**: avatar upload, name/display/email/timezone/language/title/goal fields, bio textarea.
- **Account & security**: sign-in methods (magic link, password, Google) as list items with status badges. 2FA enable. Danger zone (export + delete).
- **Notifications**: table (event label × Email/Push/In-app toggle switches).
- **Billing**: plan card (gradient brand), payment method row, update button.
- **Appearance**: density segmented control, reduce motion toggle.

---

### 13 · Live Classes — Student (`/live`)

**Live now hero**: 2-col card — left has title, instructor, attendee avatars, "Join live class" CTA; right = gradient with play icon.

**Upcoming sessions**: 3-col card grid — thumb + date pill + title + course + when/duration + RSVP button.

**Recordings**: 2-col list — gradient thumb (play icon + duration overlay) + title/course/instructor/date/badges. Click → playback modal.

**Recording modal**: dark fullscreen overlay, 16:9 video stage (mock playback with scrubber + chapter markers at fixed timestamps), CC/fullscreen controls.

---

### 14 · Live Classes — Teacher (`/teacher/live`)

Stats row + live-now resume card (if session running) + scheduled list (date | thumb | title | RSVP count | Edit/Start) + recordings table (title/course/date/length/views/includes icons).

**Schedule modal**: title, course, date/time/duration, capacity/visibility, feature toggles (auto-record, collaborative whiteboard, student screen share, require approval).

---

### 15 · Live Classroom (full-screen takeover, `/live/room/[sessionId]`)

Full dark UI, see `REALTIME.md` for architecture.

**Top bar**: LIVE pill (pulsing red) + session title/course + REC indicator + participant count + elapsed timer.

**Body** (grid `1fr` or `1fr 320px` with side panel open):

**Stage modes** (toggled from controls):
1. **Speaker** — host tile fills stage, filmstrip of others below
2. **Grid** — equal-size tiles, 3-col, everyone
3. **Screen share** — shared screen fills stage, presenter tile PiP (bottom-right, 200×124)
4. **Whiteboard** — collaborative canvas fills stage

**Whiteboard** (the canvas):
- `<canvas>` element, pointer events for freehand drawing
- Toolbar (bottom-centre, pill shape, white card): Pen | Highlighter | Eraser tools + 6 colour swatches + Undo + Clear
- Remote cursors: animated floating pointer+label for each remote participant who is drawing
- Pre-seeded content for the demo shows a lesson diagram

**Video tile** (`.lr-tile`):
- When camera on: gradient bg + initials circle
- When camera off: flat colour avatar
- Name label (bottom-left, dark pill)
- Camera-off badge (top-right)
- Raised-hand indicator (top-left, yellow pulsing circle)
- Speaking indicator: green border glow

**Filmstrip** (below stage): horizontal scroll of small tiles (aspect 16:10, 104px height) + "+N more" overflow tile.

**Controls bar** (bottom, 76px):
- Mic toggle (active = white ic bg, muted = danger-dark bg)
- Camera toggle
- Screen share (active = white bg)
- Whiteboard (active = white bg)
- Raise hand (student only)
- Record (teacher only — red bg when recording)
- People / Chat / Grid toggles
- **Leave/End button**: red pill, right side

**Side panel** (320px, dark):
- Tabs: People · {n} | Chat
- People tab: mute-all button (teacher), participant rows (avatar + name + host badge + hand/mic/cam icons)
- Chat tab: message list (avatar + name + host badge + time + message) + input + send button

---

## Interactions & Animations

| Interaction | Spec |
|---|---|
| Button hover | `background` transition 150ms |
| Button active | `translateY(0.5px)` |
| Nav item active | white card bg + sh-sm shadow |
| Progress bar fill | `width` transition 300ms |
| Video scrubber | Click to seek (calc position from bounding rect) |
| Quiz pip | Click to jump to that question |
| Exam countdown | Updates every second via `setInterval` |
| LIVE pill | Pulsing dot animation 1.4s infinite |
| REC dot | Same pulse animation |
| Raised hand icon | Rotate ±8deg 1.2s ease-in-out infinite |
| Whiteboard drawing | `pointerdown` / `pointermove` / `pointerup` + `setPointerCapture` |
| Remote cursors | CSS keyframe float animations per participant |
| Student drawer | Slide in from right (translate + opacity), 240ms ease |
| Score ring | SVG `stroke-dasharray` animates on mount |
| Role switch | Immediate nav re-render + redirect to role dashboard |

---

## State Management

Use **Zustand** or **React Context** for client-side state. Server state via **TanStack Query**.

Key stores:
- `authStore` — user, role, session
- `liveStore` — active session ID, mic/cam/hand state, mode, recording state
- `quizStore` — answers map, flagged map, current question index, elapsed

---

## Route Map (Next.js App Router)

```
app/
├── (auth)/
│   └── login/                   page.tsx
├── (app)/
│   ├── layout.tsx               ← sidebar + main shell
│   ├── dashboard/               page.tsx  (student)
│   ├── courses/
│   │   ├── page.tsx             (course grid)
│   │   └── [courseId]/
│   │       ├── page.tsx         (course detail)
│   │       └── lessons/[id]/    page.tsx  (video lesson)
│   ├── quiz/[id]/               page.tsx  (quiz taking)
│   ├── exam/[id]/               page.tsx  (exam)
│   ├── results/[attemptId]/     page.tsx
│   ├── live/
│   │   ├── page.tsx             (student live list)
│   │   └── room/[sessionId]/    page.tsx  (classroom, no sidebar layout)
│   ├── settings/                page.tsx
│   └── teacher/
│       ├── dashboard/           page.tsx
│       ├── students/            page.tsx
│       ├── courses/             page.tsx (same grid, teacher view)
│       ├── quiz/
│       │   ├── new/             page.tsx (builder)
│       │   └── [id]/edit/       page.tsx
│       ├── grading/             page.tsx
│       ├── live/                page.tsx (teacher live list)
│       └── live/room/[id]/      page.tsx (same classroom component, role=teacher)
```

---

## Assets & Icons

All icons are custom SVG stroke icons defined in `icons.jsx`. Translate to a single `<Icon name="..." size={n} />` component in Next.js, or use Lucide React (closest match) and swap the few custom ones (Broadcast, Highlighter, etc.).

Course thumbnails: CSS gradients (`grad-1` through `grad-6`). No images required.

Font: **Geist** — import from `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600`.

---

## Files in this package

| File | Contents |
|---|---|
| `Atlas.html` | Full clickable prototype — open in browser to explore every screen |
| `styles.css` | All design tokens + utility classes |
| `icons.jsx` | SVG icon library |
| `components.jsx` | Shared atoms (Button, Badge, Avatar, Progress, Tabs…) |
| `data.jsx` | Mock data shapes — use as TypeScript interface reference |
| `sidebar.jsx` | Navigation component |
| `screens/login.jsx` | Login screen |
| `screens/student-home.jsx` | Student dashboard + courses list + course detail |
| `screens/student-lesson.jsx` | Video lesson player |
| `screens/student-assess.jsx` | Quiz + Exam + Results |
| `screens/teacher-home.jsx` | Teacher dashboard + roster |
| `screens/teacher-builder.jsx` | Quiz/Exam builder |
| `screens/teacher-grading.jsx` | Grading queue + settings screens |
| `screens/live-classes.jsx` | Live class lists + schedule modal + recording player |
| `screens/live-room.jsx` | Full live classroom + whiteboard |
| `API_CONTRACT.md` | All Laravel endpoints, request/response shapes |
| `REALTIME.md` | Live classroom architecture (LiveKit integration) |
