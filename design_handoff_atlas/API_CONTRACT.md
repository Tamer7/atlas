# Atlas — Laravel API Contract

All endpoints are prefixed `/api/v1/`. All responses follow:

```json
{ "data": ..., "meta": ..., "message": "...", "errors": {} }
```

Auth: Laravel Sanctum SPA (cookie-based for the Next.js same-domain app). Set `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` in `.env`.

---

## Auth

### POST `/api/v1/auth/magic-link`
Send a magic sign-in link.

**Request**
```json
{ "email": "sofia@email.com" }
```
**Response** `200`
```json
{ "message": "Sign-in link sent." }
```
Queues a `SendMagicLinkJob` → email with a signed URL containing a short-lived token (15 min, single-use, stored in `magic_link_tokens` table).

---

### GET `/api/v1/auth/magic-link/verify`
**Query**: `token=abc123`
Verifies token, creates Sanctum session, returns user.
**Response** `200`
```json
{
  "data": { "user": { "id": 1, "name": "Sofia Chen", "email": "...", "roles": ["student","teacher"] } }
}
```

---

### POST `/api/v1/auth/login`
Password sign-in.
**Request**
```json
{ "email": "...", "password": "..." }
```
**Response** `200` — same user object as above. `422` on failure.

---

### POST `/api/v1/auth/logout`
Revokes current session.

---

### GET `/api/v1/auth/me`
Returns the authenticated user + roles + active role preference.

---

### POST `/api/v1/auth/google`
Initiates Google OAuth. Redirects to Google. Callback: `GET /api/v1/auth/google/callback`.

---

## Users & Profiles

### GET `/api/v1/profile`
Returns full profile (name, avatar_url, bio, timezone, language, goal).

### PATCH `/api/v1/profile`
**Request** (any subset)
```json
{
  "name": "Sofia Chen",
  "display_name": "Sofia",
  "timezone": "Europe/Madrid",
  "language": "en",
  "bio": "...",
  "goal": "Reach C1 by Dec"
}
```

### POST `/api/v1/profile/avatar`
Multipart upload. Stores to S3, returns `avatar_url`.

### PATCH `/api/v1/profile/password`
```json
{ "current_password": "...", "password": "...", "password_confirmation": "..." }
```

---

## Courses

### GET `/api/v1/courses`
Returns enrolled courses (student) or taught courses (teacher) based on role header.

**Query params**: `?role=student|teacher&category=Languages&status=in_progress`

**Response**
```json
{
  "data": [
    {
      "id": 1,
      "title": "English B2 — Conversational Fluency",
      "tag": "English · B2",
      "category": "Languages",
      "instructor": { "id": 2, "name": "Lena Ortega" },
      "lessons_total": 24,
      "lessons_done": 14,
      "progress": 58,
      "next_lesson": { "id": 15, "title": "Mixed conditionals & nuance" },
      "due": "Tomorrow",
      "thumb_gradient": "grad-1",
      "glyph": "E"
    }
  ]
}
```

### GET `/api/v1/courses/{id}`
Single course with full module/lesson tree.
```json
{
  "data": {
    "id": 1,
    "title": "...",
    "modules": [
      {
        "id": 1,
        "title": "Module 1 · Confident Greetings",
        "order": 1,
        "lessons": [
          {
            "id": 1,
            "number": 1,
            "title": "Tone, pacing, and first impressions",
            "duration_seconds": 760,
            "status": "done",
            "has_quiz": false,
            "is_locked": false
          }
        ]
      }
    ]
  }
}
```

### POST `/api/v1/courses` *(teacher)*
Create a course. Multipart (thumbnail optional).
```json
{
  "title": "...",
  "category": "Languages",
  "tag": "English · B2",
  "description": "..."
}
```

### PATCH `/api/v1/courses/{id}` *(teacher)*
### DELETE `/api/v1/courses/{id}` *(teacher)*

---

## Lessons

### GET `/api/v1/lessons/{id}`
Returns lesson detail including video URL (signed S3 URL, TTL 1h), chapters, transcript, attachments.
```json
{
  "data": {
    "id": 15,
    "title": "Mixed conditionals & nuance",
    "video_url": "https://s3...signed...",
    "duration_seconds": 1085,
    "chapters": [
      { "id": 1, "title": "Why mixed conditionals trip people up", "offset_seconds": 0, "done": true }
    ],
    "transcript": [
      { "offset_seconds": 408, "speaker": "Lena", "text": "..." }
    ],
    "attachments": [
      { "id": 1, "name": "Cheat sheet", "file_type": "pdf", "size_bytes": 286720, "url": "..." }
    ],
    "notes": "User's private notes text",
    "next_lesson_id": 16
  }
}
```

### POST `/api/v1/lessons/{id}/progress`
Mark a chapter done / update watch position.
```json
{ "chapter_id": 3, "watch_seconds": 612 }
```

### PATCH `/api/v1/lessons/{id}/notes`
```json
{ "notes": "..." }
```

### POST `/api/v1/lessons` *(teacher)*
Upload lesson (multipart, video file). Queues transcoding job.
```json
{
  "course_id": 1,
  "module_id": 3,
  "title": "...",
  "order": 15,
  "video": <file>
}
```

---

## Discussions

### GET `/api/v1/lessons/{id}/discussion`
### POST `/api/v1/lessons/{id}/discussion`
```json
{ "text": "...", "parent_id": null }
```
### PATCH `/api/v1/discussion/{id}`
### DELETE `/api/v1/discussion/{id}`

---

## Quizzes & Exams

### GET `/api/v1/assessments`
Lists quizzes/exams for authenticated student (due, available, completed).

### GET `/api/v1/assessments/{id}`
Returns assessment with questions (answer options, no correct answers — those come in results).
```json
{
  "data": {
    "id": 1,
    "title": "Mixed Conditionals — Practice Quiz",
    "type": "quiz",
    "duration_minutes": 10,
    "attempts_allowed": 2,
    "shuffle_questions": true,
    "questions": [
      {
        "id": 1,
        "type": "mcq",
        "prompt": "Which sentence is a correctly-formed mixed conditional?",
        "points": 2,
        "options": [
          { "id": "a", "text": "If I had studied harder, I will pass the exam." },
          { "id": "b", "text": "If I had studied harder, I would be passing the exam now." }
        ]
      },
      {
        "id": 2,
        "type": "tf",
        "prompt": "Mixed conditionals always combine...",
        "points": 1
      },
      {
        "id": 3,
        "type": "fib",
        "prompt": "Complete: \"If she ___ (take)...\"",
        "blank_count": 2,
        "points": 2
      },
      {
        "id": 4,
        "type": "short",
        "prompt": "In your own words...",
        "points": 3
      },
      {
        "id": 5,
        "type": "match",
        "prompt": "Match each clause...",
        "points": 3,
        "left_items": ["If I hadn't moved abroad,", ...],
        "right_items": ["I wouldn't be fluent today.", ...]
      }
    ]
  }
}
```

### POST `/api/v1/assessments/{id}/start`
Creates an `attempt` record. Returns `attempt_id` + `started_at` + `expires_at` (for timed exams).
```json
{ "data": { "attempt_id": 42, "expires_at": "2026-06-23T14:30:00Z" } }
```

### PATCH `/api/v1/attempts/{attemptId}/answers`
Save-as-you-go (debounced from frontend). Idempotent.
```json
{
  "answers": [
    { "question_id": 1, "value": "b" },
    { "question_id": 2, "value": false },
    { "question_id": 3, "value": ["had taken", "would be living"] },
    { "question_id": 4, "value": "I would use a mixed conditional when..." },
    { "question_id": 5, "value": { "0": 0, "1": 2, "2": 1 } }
  ]
}
```

### POST `/api/v1/attempts/{attemptId}/submit`
Triggers auto-grading for gradeable types. Returns results immediately for auto-only quizzes; returns `pending` status for anything with manual questions.

**Response (auto-graded)**
```json
{
  "data": {
    "attempt_id": 42,
    "score": 80,
    "max_score": 100,
    "passed": true,
    "time_taken_seconds": 402,
    "breakdown": [
      { "question_id": 1, "correct": true, "points_earned": 2, "points_possible": 2, "given": "b", "expected": "b" },
      { "question_id": 4, "correct": null, "status": "pending_review", "points_earned": null }
    ]
  }
}
```

### GET `/api/v1/attempts/{attemptId}/results`
Poll for results (for pending manual review).

---

## Teacher — Assessments

### GET `/api/v1/teacher/assessments`
Lists assessments created by the teacher.

### POST `/api/v1/teacher/assessments`
Create quiz/exam.
```json
{
  "title": "...",
  "course_id": 1,
  "type": "quiz",
  "duration_minutes": 10,
  "attempts_allowed": 2,
  "shuffle": true,
  "passing_score": 70,
  "show_results": "on_submit",
  "show_correct_answers": true,
  "show_explanations": true,
  "questions": [
    {
      "type": "mcq",
      "prompt": "...",
      "points": 2,
      "options": [
        { "text": "...", "correct": false },
        { "text": "...", "correct": true }
      ]
    }
  ]
}
```

### PATCH `/api/v1/teacher/assessments/{id}`
### DELETE `/api/v1/teacher/assessments/{id}`
### POST `/api/v1/teacher/assessments/{id}/publish`
### POST `/api/v1/teacher/assessments/{id}/duplicate`

---

## Teacher — Grading

### GET `/api/v1/teacher/grading-queue`
```json
{
  "data": [
    {
      "attempt_id": 42,
      "student": { "id": 1, "name": "Sofia Chen", "color": "#2747E0" },
      "assessment": { "id": 1, "title": "Mixed Conditionals Quiz", "type": "quiz" },
      "course": { "id": 1, "title": "English B2" },
      "submitted_at": "2026-06-23T11:00:00Z",
      "auto_score": 6,
      "max_score": 10,
      "pending_manual_count": 2
    }
  ]
}
```

### GET `/api/v1/teacher/attempts/{attemptId}`
Full attempt detail for grading (includes student answers, auto-graded results, manual questions).

### POST `/api/v1/teacher/attempts/{attemptId}/grade`
Submit manual scores + overall feedback.
```json
{
  "feedback": "Strong submission overall...",
  "question_grades": [
    { "question_id": 4, "points_earned": 4, "comment": "Great example, could mention reverse pattern." },
    { "question_id": 7, "points_earned": 7, "comment": "Excellent use of three mixed conditionals." }
  ]
}
```

### POST `/api/v1/teacher/attempts/{attemptId}/ai-suggest`
Asks the AI to suggest scores for all pending manual questions. Returns suggestions.
```json
{
  "data": [
    { "question_id": 4, "suggested_score": 4, "notes": "Strong. Clear distinction, good example.", "rubric_match": 0.87 }
  ]
}
```
Backend: call Anthropic Claude API with rubric + student answer → parse suggested score + justification.

---

## Students / Roster (Teacher)

### GET `/api/v1/teacher/students`
**Query**: `?course_id=1&status=at-risk&search=sofia`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sofia Chen",
      "email": "...",
      "color": "#2747E0",
      "courses_count": 3,
      "attendance_pct": 94,
      "avg_score": 88,
      "status": "on_track",
      "last_active_at": "2026-06-23T09:00:00Z",
      "flagged": false,
      "score_trend": [80, 84, 82, 86, 88, 89, 88]
    }
  ]
}
```

### GET `/api/v1/teacher/students/{id}`
Full student profile + recent activity.

### POST `/api/v1/teacher/students/invite`
```json
{ "email": "...", "course_ids": [1, 2] }
```

### PATCH `/api/v1/teacher/students/{id}/flag`
```json
{ "flagged": true }
```

---

## Live Classes

### GET `/api/v1/live-sessions`
Lists upcoming + live-now sessions for the authenticated user.

### GET `/api/v1/live-sessions/{id}`
Session detail including LiveKit room name + token.
```json
{
  "data": {
    "id": "lc-1",
    "title": "Mixed Conditionals — Live Workshop",
    "course_id": 1,
    "instructor": { "id": 2, "name": "Lena Ortega" },
    "starts_at": "2026-06-23T13:30:00Z",
    "duration_minutes": 60,
    "capacity": 20,
    "attending_count": 14,
    "rsvp_count": 18,
    "status": "live",
    "livekit_room": "atlas-lc-1",
    "livekit_token": "eyJ...",
    "features": {
      "auto_record": true,
      "collaborative_whiteboard": true,
      "student_screen_share": true,
      "require_approval": false
    }
  }
}
```

The `livekit_token` is generated server-side via the LiveKit Server SDK for the authenticated participant with appropriate permissions (publish for teacher, subscribe+conditionally-publish for students).

### POST `/api/v1/live-sessions` *(teacher)*
Schedule a session.
```json
{
  "title": "...",
  "course_id": 1,
  "starts_at": "2026-06-25T10:00:00Z",
  "duration_minutes": 60,
  "capacity": 20,
  "visibility": "enrolled",
  "features": { "auto_record": true, "collaborative_whiteboard": true }
}
```

### PATCH `/api/v1/live-sessions/{id}` *(teacher)*
### DELETE `/api/v1/live-sessions/{id}` *(teacher)*

### POST `/api/v1/live-sessions/{id}/rsvp` *(student)*
```json
{ "status": "attending" }
```

### POST `/api/v1/live-sessions/{id}/start` *(teacher)*
Creates the LiveKit room, sets session `status = live`.

### POST `/api/v1/live-sessions/{id}/end` *(teacher)*
Ends LiveKit room, triggers recording-processing job.

---

## Recordings

### GET `/api/v1/recordings`
Lists recordings accessible to the authenticated user.
```json
{
  "data": [
    {
      "id": "rec-1",
      "title": "Second Conditional — Deep Dive",
      "course_id": 1,
      "instructor": { "name": "Lena Ortega" },
      "recorded_at": "2026-05-14",
      "duration_seconds": 3504,
      "views_count": 38,
      "thumb_gradient": "grad-1",
      "has_whiteboard": true,
      "has_chat": true,
      "video_url": "https://s3...signed...",
      "chapters": [ { "offset_seconds": 0, "title": "Intro" }, ... ]
    }
  ]
}
```

### GET `/api/v1/recordings/{id}`
Full recording detail + signed video URL.

### PATCH `/api/v1/recordings/{id}` *(teacher)*
Edit title, publish/unpublish.

### DELETE `/api/v1/recordings/{id}` *(teacher)*

---

## Notifications

### GET `/api/v1/notifications`
Unread notifications list.

### PATCH `/api/v1/notifications/{id}/read`

### PATCH `/api/v1/notifications/read-all`

### GET `/api/v1/notification-preferences`
### PATCH `/api/v1/notification-preferences`
```json
{
  "new_lesson": { "email": true, "push": false, "in_app": true },
  "quiz_graded": { "email": true, "push": true, "in_app": true }
}
```

---

## Database Schema (key tables)

```sql
users               id, name, email, password, avatar_url, bio, timezone, language, goal, color
roles               id, name (student, teacher, admin)
user_roles          user_id, role_id
magic_link_tokens   id, email, token (hashed), expires_at, used_at

courses             id, title, tag, category, instructor_id, thumb_gradient, glyph, description
enrollments         id, user_id, course_id, enrolled_at
modules             id, course_id, title, order
lessons             id, module_id, title, order, video_path, duration_seconds, is_locked
lesson_progress     id, user_id, lesson_id, watch_seconds, completed_at
chapters            id, lesson_id, title, offset_seconds
transcripts         id, lesson_id, offset_seconds, speaker, text
notes               id, user_id, lesson_id, content, updated_at
attachments         id, lesson_id, name, file_path, file_type, size_bytes
discussion_posts    id, lesson_id, user_id, parent_id, text, created_at

assessments         id, course_id, creator_id, title, type, duration_minutes, attempts_allowed,
                    shuffle, passing_score, show_results, show_correct_answers, show_explanations, published_at
questions           id, assessment_id, type, prompt, points, order, blank_count, rubric, explanation
question_options    id, question_id, text, is_correct, order
question_pairs      id, question_id, left_text, right_text, order
attempts            id, user_id, assessment_id, started_at, submitted_at, expires_at, score,
                    max_score, passed, feedback, status
answers             id, attempt_id, question_id, value (jsonb), correct, points_earned, ai_suggested_score, ai_notes

live_sessions       id, course_id, instructor_id, title, starts_at, duration_minutes,
                    capacity, visibility, status, livekit_room, features (jsonb)
live_rsvps          id, user_id, session_id, status
recordings          id, session_id, course_id, title, video_path, duration_seconds,
                    has_whiteboard, has_chat, views_count, published_at

notification_prefs  id, user_id, event_type, email, push, in_app
notifications       id, user_id, type, data (jsonb), read_at, created_at
```

---

## Laravel Project Structure

```
app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── Auth/         MagicLinkController, LoginController, GoogleController
│   │   ├── CourseController
│   │   ├── LessonController
│   │   ├── AssessmentController
│   │   ├── AttemptController
│   │   ├── Teacher/      AssessmentController, GradingController, StudentController
│   │   ├── LiveSessionController
│   │   └── RecordingController
│   ├── Middleware/       RoleMiddleware
│   └── Requests/         Form request validation for every endpoint
├── Models/               One per table above
├── Services/
│   ├── MagicLinkService
│   ├── GradingService    (auto-grading logic)
│   ├── AIGradingService  (Anthropic API calls)
│   ├── LiveKitService    (token generation, room management)
│   └── VideoService      (S3 upload, transcoding queue)
├── Jobs/
│   ├── SendMagicLinkJob
│   ├── ProcessRecordingJob
│   └── TranscodeVideoJob
└── Events/ + Listeners/  (Laravel Echo for notifications)
```
