# Full Platform Implementation Plan (excluding LiveKit + S3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the full teaching platform — curriculum, quizzes, attempts, grading, reports, and dashboard — with real Laravel API + Next.js integration. Exclude live classes (LiveKit) and media upload to S3 (use external URLs / rich text).

**Architecture:** Three new Laravel modules (`Curriculum`, `Assessment`, `Analytics`) following existing CSR pattern. Course detail embeds modules/lessons with per-user progress. Quizzes attach to courses (optional lesson link). Auto-grade MCQ/TF/FIB/Match; manual grade Short/Essay/Code/Upload. Frontend replaces all `MOCK` usage except live-class pages.

**Tech Stack:** Laravel 12 (Pest), Next.js 16, TanStack Query, PostgreSQL JSON columns for transcript/chapters/attachments.

## Global Constraints

- All API routes prefixed `/api/v1/`
- Response envelope: `{ data, meta?, message?, errors? }`
- CSR: Controller → Service → Repository
- No S3 uploads — `video_url` and attachment `url` are external strings
- No LiveKit / live session backend — keep `/teacher/live` as placeholder UI
- Lesson video = embed URL (YouTube/Vimeo) or text-only lessons
- Auth: Sanctum SPA cookies, `role:teacher` on teacher-only routes

---

## Database Schema

### curriculum
| Table | Key columns |
|-------|-------------|
| `modules` | id, course_id, title, sort_order |
| `lessons` | id, module_id, title, number, duration_seconds, sort_order, content_type (text\|video), body, video_url, chapters (json), transcript (json), attachments (json), quiz_id (nullable) |
| `lesson_progress` | user_id, lesson_id, position_seconds, completed_at, notes — unique(user_id, lesson_id) |
| `lesson_discussion_posts` | id, lesson_id, user_id, parent_id (nullable), body |

### assessment
| Table | Key columns |
|-------|-------------|
| `quizzes` | id, course_id, lesson_id (nullable), title, quiz_type, time_limit_minutes, max_attempts, shuffle_questions, show_results, passing_score, show_correct, show_score, published_at |
| `quiz_questions` | id, quiz_id, type, prompt, points, config (json), sort_order |
| `quiz_attempts` | id, quiz_id, user_id, status (in_progress\|submitted\|graded), started_at, submitted_at, auto_score, manual_score, total_score, overall_feedback |
| `quiz_answers` | id, attempt_id, question_id, answer (json), auto_score, manual_score, feedback, ai_suggested_score, ai_notes, graded_at, graded_by |

---

## API Routes

### Curriculum (`/api/v1/`)
```
GET    courses/{courseId}/modules              — list modules + lessons (scoped)
POST   courses/{courseId}/modules              — teacher create module
PATCH  modules/{id}                              — teacher update
DELETE modules/{id}                              — teacher delete
POST   modules/{id}/lessons                      — teacher create lesson
GET    lessons/{id}                              — lesson detail + user progress
PATCH  lessons/{id}                              — teacher update
DELETE lessons/{id}                              — teacher delete
POST   lessons/{id}/progress                     — student update position/complete
PATCH  lessons/{id}/notes                        — student save notes
GET    lessons/{id}/discussion                   — list posts
POST   lessons/{id}/discussion                   — create post/reply
```

### Assessment (`/api/v1/`)
```
GET    courses/{courseId}/quizzes                — list quizzes (teacher + enrolled)
POST   courses/{courseId}/quizzes                — teacher create + publish
GET    quizzes/{id}                              — quiz detail (teacher: with answers; student: without)
PATCH  quizzes/{id}                              — teacher update
DELETE quizzes/{id}                              — teacher delete
POST   quizzes/{id}/start                        — student start attempt
GET    attempts/{id}                             — attempt detail
PATCH  attempts/{id}/answers                     — save answer(s)
POST   attempts/{id}/submit                      — submit + auto-grade
GET    attempts/{id}/results                       — results (respect show_results)
GET    teacher/grading                           — grading queue (pending manual)
PATCH  teacher/grading/{attemptId}/answers/{answerId} — grade manual question
POST   teacher/grading/{attemptId}/complete      — finalize + feedback
```

### Analytics (`/api/v1/`)
```
GET    teacher/dashboard                         — real stat cards
GET    teacher/reports                           — per-course aggregates
```

---

## Frontend Wiring

| Area | Files |
|------|-------|
| Types | `types/curriculum.ts`, `types/assessment.ts` |
| API | `lib/api/curriculum.ts`, `lib/api/assessment.ts`, `lib/api/analytics.ts` |
| Hooks | `hooks/curriculum/*`, `hooks/assessment/*`, `hooks/analytics/*` |
| Course detail | curriculum tab + teacher edit; roster tab |
| Lesson player | wire to API, remove MOCK |
| Quiz builder | save/publish to API |
| Student quiz | `/quiz/[id]` wire to attempts API |
| Grading | wire queue + manual grader |
| Reports | wire stats |
| Dashboard | wire real counts; hide live preview |
| Sidebar | hide Live Classes or mark "Coming soon" |

---

## Task Order

1. Migrations + Eloquent models + relations on Course
2. Curriculum module (backend + tests)
3. Assessment module (backend + auto-grader + tests)
4. Analytics module (dashboard + reports + roster metrics)
5. Update CourseDetailResource with modules/progress
6. Demo seeder with sample curriculum + quiz
7. Frontend types + API clients + hooks
8. Wire course detail + lesson player + curriculum CRUD UI
9. Wire quiz builder + student quiz flow
10. Wire grading queue
11. Wire dashboard + reports + roster metrics
12. Hide live nav; run full test suite + build

---

## Out of Scope

- LiveKit live sessions (`/teacher/live`, `/live/room`)
- S3 media upload (video/files stored externally)
- AI grading service (stub `ai_suggested_score` from rubric heuristics optional)
