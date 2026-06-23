# Atlas — Build Progress

> Reference: `design_handoff_atlas/` (do not modify)
> API contract: `design_handoff_atlas/API_CONTRACT.md`
> Design spec: `design_handoff_atlas/README.md`

## Phase 1: Foundation Skeleton ✅

### Infrastructure
- [x] Docker Compose: API + PostgreSQL + Redis + Mailpit
- [x] Laravel 12 bootstrapped with Sanctum SPA cookie auth
- [x] CORS configured for Next.js (localhost:3000)
- [x] Next.js 15 App Router, TypeScript, Tailwind with design tokens

### API (Laravel — CSR pattern)
- [x] `POST /api/v1/auth/register` — create account, session
- [x] `POST /api/v1/auth/login` — password login, session
- [x] `POST /api/v1/auth/logout` — invalidate session
- [x] `GET /api/v1/auth/me` — authenticated user profile
- [x] `POST /api/v1/auth/magic-link` — send (logged) magic link token
- [x] `GET /api/v1/auth/magic-link/verify` — verify token, create session
- [x] Pest: 10 feature tests, all passing

### Frontend (Next.js)
- [x] Axios client with CSRF interceptor (`lib/api/client.ts`)
- [x] TanStack Query v5 with auth context
- [x] `useLogin`, `useLogout`, `useRegister`, `useSendMagicLink` hooks
- [x] Login page (`/login`) — magic link + password modes, from design spec
- [x] Register page (`/register`) — new account form
- [x] Dashboard stub (`/dashboard`) — connection proof + logout
- [x] Next.js middleware: unauthenticated redirects to `/login`

### Not yet in Phase 1
- Magic link email delivery (logged to console; queue job in Phase 2)
- Google OAuth (Phase 2)
- Session cookie name in env (atlas_session)

---

## Phase 2: Core Student Experience 🔲

From `design_handoff_atlas/README.md` screens 01–07:

### API Endpoints to build
- [ ] `GET /api/v1/courses` — enrolled courses
- [ ] `GET /api/v1/courses/{id}` — course with module/lesson tree
- [ ] `GET /api/v1/lessons/{id}` — lesson + chapters + transcript + attachments
- [ ] `POST /api/v1/lessons/{id}/progress` — mark chapter done
- [ ] `PATCH /api/v1/lessons/{id}/notes` — save notes
- [ ] `GET /api/v1/assessments` — student quizzes/exams
- [ ] `GET /api/v1/assessments/{id}` — assessment + questions
- [ ] `POST /api/v1/assessments/{id}/start` — create attempt
- [ ] `PATCH /api/v1/attempts/{id}/answers` — save answers
- [ ] `POST /api/v1/attempts/{id}/submit` — grade + return results
- [ ] `GET /api/v1/attempts/{id}/results` — poll for results

### Screens to build
- [ ] Sidebar navigation component (248px, role switcher, LIVE pill)
- [ ] Student Dashboard (`/dashboard`) — stats, hero card, courses, schedule
- [ ] My Courses (`/courses`) — filter + 3-col card grid
- [ ] Course Detail (`/courses/[courseId]`) — curriculum tree + sticky panel
- [ ] Video Lesson (`/courses/[courseId]/lessons/[id]`) — player + tabs + chapters
- [ ] Quiz Taking (`/quiz/[id]`) — question types + pip progress
- [ ] Exam (`/exam/[id]`) — countdown + question palette
- [ ] Results (`/results/[attemptId]`) — score ring + breakdown

---

## Phase 3: Teacher Experience 🔲

Screens 08–11 from spec:
- [ ] Teacher Dashboard (`/teacher/dashboard`)
- [ ] Student Roster (`/teacher/students`) — table + drawer
- [ ] Quiz Builder (`/teacher/quiz/new`) — multi-type question editor
- [ ] Grading Queue (`/teacher/grading`) — AI-assisted scoring

---

## Phase 4: Live Classroom 🔲

Screens 13–15 from spec (requires LiveKit):
- [ ] Live session list + RSVP
- [ ] Full classroom (`/live/room/[sessionId]`)
- [ ] Collaborative whiteboard
- [ ] Recording playback

---

## Phase 5: Infrastructure 🔲
- [ ] Magic link email (Mailpit → production Resend/Mailgun)
- [ ] Google OAuth (Laravel Socialite)
- [ ] S3/R2 video upload + signed URLs
- [ ] FFmpeg transcoding queue
- [ ] AI grading (Anthropic API in `AIGradingService`)
- [ ] Laravel Scout + Meilisearch for search
- [ ] Notification system
