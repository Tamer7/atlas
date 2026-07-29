# Auth Guard + Admin Panel — Design

**Date:** 2026-07-30
**Status:** Approved, ready for planning

## Problem

Two separate issues, shipped as two phases.

**1. The route guard does not work.** An unauthenticated visitor can navigate to
`/courses`, `/schedule`, `/teacher`, or any other page and see the full UI shell.

Root cause, verified against a running container: `apps/web/src/middleware.ts`
guards routes by testing whether the `atlas_session` cookie *exists*. Laravel
issues that cookie to everyone. An unauthenticated `GET /sanctum/csrf-cookie`
responds with:

```
Set-Cookie: XSRF-TOKEN=<value>; ...
Set-Cookie: atlas_session=<value>; HttpOnly; SameSite=lax
```

`apps/web/src/lib/api/client.ts` calls that endpoint via `ensureCsrf()`, so
merely loading `/login` mints the cookie and every route passes the guard from
then on. Cookie presence carries no authentication information, so this cannot
be fixed by adjusting the check — the guard needs a real auth decision.

Note the API itself is not exposed: every protected endpoint still returns 401.
The leak is the UI shell and route structure, not user data.

**2. There is no administrator.** Accounts can only be created by a teacher
inviting a student. There is no way to create a teacher, change a role, or
disable an account without opening a database console.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Guard mechanism | Validate server-side in `proxy.ts` | Only option that actually knows auth state; also yields roles for admin gating |
| Admin role name | Reuse existing `admin` | Already seeded in `RoleSeeder`, currently unused; avoids two near-identical concepts |
| Account creation | Both invite and set-password, admin chooses | Invite is safer; password mode is a fallback when mail is down |
| User removal | Deactivate only, no hard delete | Hard delete cascades six levels (see below) |
| Admin capabilities | List, detail, create, edit, change role, password reset, deactivate | All four optional items requested |

### Why deactivate rather than delete

`users` is the root of a six-level cascade. Deleting one teacher would trigger:

```
users
 └─ courses (instructor_id, cascadeOnDelete)
     ├─ modules → lessons → lesson_progress, lesson_discussion_posts
     ├─ quizzes → quiz_questions → attempts
     └─ enrollments
```

A single click would destroy every enrolled student's progress and attempt
history, irreversibly and invisibly. The app has no soft-delete infrastructure
anywhere, so `deactivated_at` is introduced by this work.

## Phase 1 — Auth guard

Rename `apps/web/src/middleware.ts` → `proxy.ts`, exporting `proxy` instead of
`middleware`. This is the Next 16 file convention; `middleware` is deprecated.
Codemod: `npx @next/codemod@canary middleware-to-proxy .`

Logic for every request matching the existing matcher:

1. Path in `PUBLIC_PATHS` (`/login`, `/register`, `/magic`, `/invitation`) → allow.
2. Otherwise `GET {INTERNAL_API_URL}/api/v1/auth/me`, forwarding the request's
   `cookie` header.
3. Non-200 → redirect to `/login`.
4. 200, path starts with `/admin`, and `roles` excludes `admin` → redirect to
   that user's landing page: `admin` → `/admin/users`, `teacher` → `/teacher`,
   otherwise `/dashboard`.
5. Otherwise → allow.

**API base URL:** read `INTERNAL_API_URL`, falling back to
`NEXT_PUBLIC_API_URL`. `NEXT_PUBLIC_*` values are inlined at build time, so
without a server-only variable the API address cannot be changed without
rebuilding the web image. In production this is `http://api:8000` — an
in-network call, single-digit milliseconds, and only on page navigations
(static assets are already excluded by the matcher).

**Failure mode:** if the API is unreachable the guard must redirect to `/login`,
not fail open. A transient API outage must never expose the app shell.

**Defence in depth:** the `(app)` layout also redirects when `AuthContext`
resolves `isAuthenticated === false`, covering a session that expires while a
user sits on an already-rendered page.

## Phase 2 — Admin panel

### Backend: `app/Modules/Admin/`

Follows the established module layout, with repositories bound via `bind()` (not
`singleton()`) in `AdminServiceProvider`, consistent with every other module and
required for Octane safety.

```
Admin/
  AdminServiceProvider.php
  Controllers/AdminUserController.php
  Services/AdminUserService.php
  Repositories/AdminUserRepository.php
  Repositories/Contracts/AdminUserRepositoryInterface.php
  Requests/{CreateUserRequest,UpdateUserRequest}.php
  Resources/{AdminUserResource,AdminUserDetailResource}.php
  Routes/api.php
```

All routes under `/api/v1/admin`, middleware `auth:sanctum` + `role:admin`:

| Method | Route | Notes |
|---|---|---|
| GET | `/users` | Paginated; `?search=`, `?role=`, `?status=active\|inactive` |
| GET | `/users/{id}` | Detail: courses taught or enrolled, plus the 10 most recent lesson-progress and quiz-attempt records |
| POST | `/users` | `mode=invite` or `mode=password` |
| PATCH | `/users/{id}` | name, email, role |
| POST | `/users/{id}/deactivate` | |
| POST | `/users/{id}/reactivate` | |
| POST | `/users/{id}/password-reset` | Sends magic link |

`POST /users` validation branches on `mode`:
- `invite` — requires `email`, `role`. Creates an `invitations` row and emails a link.
- `password` — requires `name`, `email`, `role`, `password`. Account is active immediately.

`role` is a single value (`student` | `teacher` | `admin`), not a list. The
underlying `user_roles` table is many-to-many and stays that way, but this UI
assigns exactly one role per user; `PATCH` replaces rather than appends. Multi-role
users are not reachable through the admin panel and are out of scope.

### Migrations

1. `users.deactivated_at` — nullable timestamp, indexed.
2. `invitations.role` — string, default `student`. The existing flow implicitly
   created students; teachers now need to be invitable too.

### Deactivation semantics

- `EnsureUserActive` middleware on authenticated routes returns 401 when
  `deactivated_at` is set, so live sessions terminate on the next request rather
  than persisting until session expiry.
- Login and magic-link redemption both reject deactivated users.
- Deactivation is reversible and destroys no data.

### Guardrails

Both enforced in `AdminUserService` and covered by tests:

- An admin cannot deactivate or demote **themselves**.
- The **last active admin** cannot be deactivated or demoted. Without this, one
  click leaves the platform with no administrator, recoverable only by SSH.

### Provisioning command

```
php artisan atlas:create-admin {email} {--name=}
```

Prompts for a password. Creates the user, or promotes an existing one. Idempotent
— safe to re-run. Required because there is no admin to invite the first admin.

### Frontend

- Routes: `(app)/(admin)/admin/users`, `(app)/(admin)/admin/users/[id]`
- `RoleContext`: widen `AppRole` from `'student' | 'teacher'` to include
  `'admin'`; add `isAdmin`. The current implementation treats "not teacher" as
  student, which would misclassify an admin — this must become an explicit check.
- Admin nav entry renders only when `isAdmin`.
- Query hooks in `src/hooks/admin/`, matching existing TanStack Query conventions.
- User list: search, role filter, status filter, pagination, and per-row actions.

## Testing

Security behaviour, not just happy paths:

- Every admin route returns 403 for `teacher` and `student`, 401 for guests.
- Both creation modes produce a working account with the correct role.
- A deactivated user cannot log in, and an active session stops working.
- Self-deactivation and self-demotion are rejected.
- Last-admin deactivation and demotion are rejected.
- Guard: unauthenticated request to a protected path redirects to `/login`.
- Guard: non-admin request to `/admin/*` is redirected away.
- Guard: API unreachable redirects to `/login` rather than allowing through.

## Out of scope

- Hard-deleting users
- Bulk import or CSV upload
- Audit log of admin actions
- Admin-managed course assignment (teachers already manage their own)
- Any change to teacher or student UI beyond the nav entry

## Risks

- **Guard latency.** One internal API call per navigation. Acceptable in-network;
  if it ever isn't, cache per-request rather than reintroducing a cookie check.
- **Phase ordering.** Phase 1 fixes a live production issue and should ship
  independently of Phase 2.
- **`invitations.role` default.** Existing rows default to `student`, preserving
  current behaviour for any pending invitation.
