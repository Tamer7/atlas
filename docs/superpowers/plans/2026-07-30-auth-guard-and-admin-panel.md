# Auth Guard + Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken cookie-presence route guard with a real server-side auth check, then add an admin panel for managing users.

**Architecture:** Phase 1 moves the guard decision into a pure, unit-tested function consumed by Next 16's `proxy.ts`, which validates the session against Laravel's `/api/v1/auth/me`. Phase 2 adds an `Admin` module to the Laravel API following the existing module layout, plus two admin screens in the Next app.

**Tech Stack:** Laravel 13 / PHP 8.4 / Pest 4, Next.js 16 / React 19 / TanStack Query, Vitest (added in Task 1), PostgreSQL 16.

## Global Constraints

- Backend module code lives under `app/Modules/{Module}/`, never `app/Http/`. Namespace `App\Modules\{Module}\{Layer}\{Class}`.
- Repositories bind with `$this->app->bind(...)` — **never `singleton()`**. Octane keeps workers alive between requests; a singleton holding request state leaks across users.
- Never call `env()` outside `config/`. Production runs `config:cache`, where `env()` returns null.
- Module service providers register bindings only. Routes are registered by `require`-ing the module's `Routes/api.php` from `routes/api.php`.
- Shared models (used by 2+ modules or by middleware) go in `app/Models/`. Module-only models go in the module.
- Pest feature tests declare `uses(RefreshDatabase::class);` at the top of each file and seed roles in `beforeEach`.
- Role name for the admin is `admin` (already seeded by `RoleSeeder`). Do not introduce `super_admin`.
- A user has exactly one role through the admin UI; `PATCH` replaces the role rather than appending.

---

# PHASE 1 — Auth Guard

Ships independently. Fixes a live production issue: unauthenticated visitors currently see the full UI shell on every route.

---

### Task 1: Guard decision logic (pure, unit-tested)

The current bug existed because untestable logic sat inside the Next middleware. Extract the decision into a pure function first.

**Files:**
- Create: `apps/web/src/lib/auth/guard.ts`
- Create: `apps/web/src/lib/auth/guard.test.ts`
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `isPublicPath(pathname: string): boolean`, `landingPathFor(user: GuardUser): string`, `decide(pathname: string, user: GuardUser | null): GuardDecision`, `type GuardUser = { roles: string[] }`, `type GuardDecision = { type: 'allow' } | { type: 'redirect'; to: string }`.

- [ ] **Step 1: Add Vitest**

`apps/web` has no test runner. Install one:

```bash
cd apps/web
npm install -D vitest@^3
```

Add to `apps/web/package.json` `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `apps/web/src/lib/auth/guard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { decide, isPublicPath, landingPathFor } from '@/lib/auth/guard';

describe('isPublicPath', () => {
  it('allows auth pages', () => {
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/register')).toBe(true);
    expect(isPublicPath('/magic')).toBe(true);
    expect(isPublicPath('/invitation/accept')).toBe(true);
  });

  it('does not treat app pages as public', () => {
    expect(isPublicPath('/courses')).toBe(false);
    expect(isPublicPath('/dashboard')).toBe(false);
  });
});

describe('landingPathFor', () => {
  it('routes each role to its own landing page', () => {
    expect(landingPathFor({ roles: ['admin'] })).toBe('/admin/users');
    expect(landingPathFor({ roles: ['teacher'] })).toBe('/teacher');
    expect(landingPathFor({ roles: ['student'] })).toBe('/dashboard');
  });

  it('prefers admin when a user somehow holds several roles', () => {
    expect(landingPathFor({ roles: ['student', 'admin'] })).toBe('/admin/users');
  });
});

describe('decide', () => {
  it('allows public paths without a user', () => {
    expect(decide('/login', null)).toEqual({ type: 'allow' });
  });

  it('redirects an unauthenticated user away from a protected path', () => {
    expect(decide('/courses', null)).toEqual({ type: 'redirect', to: '/login' });
  });

  it('allows an authenticated user through a protected path', () => {
    expect(decide('/courses', { roles: ['student'] })).toEqual({ type: 'allow' });
  });

  it('keeps non-admins out of the admin area', () => {
    expect(decide('/admin/users', { roles: ['teacher'] }))
      .toEqual({ type: 'redirect', to: '/teacher' });
    expect(decide('/admin/users', { roles: ['student'] }))
      .toEqual({ type: 'redirect', to: '/dashboard' });
  });

  it('lets an admin into the admin area', () => {
    expect(decide('/admin/users', { roles: ['admin'] })).toEqual({ type: 'allow' });
  });

  it('redirects an unauthenticated user away from the admin area', () => {
    expect(decide('/admin/users', null)).toEqual({ type: 'redirect', to: '/login' });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd apps/web && npm test`
Expected: FAIL — `Failed to resolve import "@/lib/auth/guard"`.

- [ ] **Step 4: Write the implementation**

Create `apps/web/src/lib/auth/guard.ts`:

```ts
export type GuardUser = { roles: string[] };

export type GuardDecision =
  | { type: 'allow' }
  | { type: 'redirect'; to: string };

const PUBLIC_PATHS = ['/login', '/register', '/magic', '/invitation'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function landingPathFor(user: GuardUser): string {
  if (user.roles.includes('admin')) return '/admin/users';
  if (user.roles.includes('teacher')) return '/teacher';
  return '/dashboard';
}

export function decide(pathname: string, user: GuardUser | null): GuardDecision {
  if (isPublicPath(pathname)) return { type: 'allow' };
  if (!user) return { type: 'redirect', to: '/login' };

  if (pathname.startsWith('/admin') && !user.roles.includes('admin')) {
    return { type: 'redirect', to: landingPathFor(user) };
  }

  return { type: 'allow' };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd apps/web && npm test`
Expected: PASS — 9 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/auth apps/web/vitest.config.ts apps/web/package.json apps/web/package-lock.json
git commit -m "feat(web): add tested route-guard decision logic"
```

---

### Task 2: Wire the guard into `proxy.ts`

**Files:**
- Create: `apps/web/src/proxy.ts`
- Delete: `apps/web/src/middleware.ts`

**Interfaces:**
- Consumes: `decide`, `isPublicPath` from `@/lib/auth/guard`.
- Produces: `proxy(request: NextRequest)` — the Next 16 route interceptor.

- [ ] **Step 1: Create `proxy.ts`**

Next 16 deprecated the `middleware` file convention in favour of `proxy`. Create `apps/web/src/proxy.ts`:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decide, isPublicPath, type GuardUser } from '@/lib/auth/guard';

// Server-only, so it is read at runtime. NEXT_PUBLIC_* is inlined at build
// time and cannot be changed without rebuilding the web image.
const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

async function fetchUser(request: NextRequest): Promise<GuardUser | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { cookie, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const body = await res.json();
    const user = body?.data?.user;
    return user && Array.isArray(user.roles) ? { roles: user.roles } : null;
  } catch {
    // Fail closed. An API outage must never expose the app shell.
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the API round-trip entirely for public pages.
  if (isPublicPath(pathname)) return NextResponse.next();

  const decision = decide(pathname, await fetchUser(request));

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|sanctum).*)'],
};
```

- [ ] **Step 2: Delete the old middleware**

```bash
rm apps/web/src/middleware.ts
```

The old file guarded on `request.cookies.get('atlas_session')`. Laravel issues that cookie to unauthenticated visitors too, so the check always passed. It must be removed, not adapted.

- [ ] **Step 3: Verify the guard end-to-end**

Start the stack and confirm all three behaviours:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build web
```

```bash
# Logged out -> redirected to /login (307/308, Location: /login)
curl -sk -o /dev/null -w "logged-out /courses -> %{http_code} %{redirect_url}\n" \
  https://atlas.neoroz.com/courses

# Public page still reachable
curl -sk -o /dev/null -w "/login -> %{http_code}\n" https://atlas.neoroz.com/login
```

Expected: `/courses` redirects to `/login`; `/login` returns 200.

- [ ] **Step 4: Run the unit tests again**

Run: `cd apps/web && npm test`
Expected: PASS — guard logic unchanged.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/proxy.ts
git rm apps/web/src/middleware.ts
git commit -m "fix(web): validate session server-side instead of trusting cookie presence

The guard tested whether atlas_session existed, but Laravel issues that
cookie to unauthenticated visitors, so every protected route was reachable
while logged out. Also migrates middleware.ts to the Next 16 proxy.ts
convention."
```

**Phase 1 is now shippable. Deploy before continuing if you want the fix live.**

---

# PHASE 2 — Admin Panel

---

### Task 3: Schema — deactivation and invitation roles

**Files:**
- Create: `api/database/migrations/2026_07_30_000001_add_deactivated_at_to_users_table.php`
- Create: `api/database/migrations/2026_07_30_000002_add_role_to_invitations_table.php`
- Modify: `api/app/Models/User.php`
- Test: `api/tests/Feature/Admin/DeactivationTest.php`

**Interfaces:**
- Produces: `users.deactivated_at` (nullable timestamp, indexed), `invitations.role` (string, default `'student'`), `User::isActive(): bool`, `User->deactivated_at` cast to `datetime`.

- [ ] **Step 1: Write the failing test**

Create `api/tests/Feature/Admin/DeactivationTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

test('a user is active by default', function () {
    expect(User::factory()->create()->isActive())->toBeTrue();
});

test('a user with deactivated_at set is not active', function () {
    $user = User::factory()->create(['deactivated_at' => now()]);

    expect($user->isActive())->toBeFalse();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && php artisan test --filter=DeactivationTest`
Expected: FAIL — `Call to undefined method App\Models\User::isActive()`.

- [ ] **Step 3: Write the migrations**

`api/database/migrations/2026_07_30_000001_add_deactivated_at_to_users_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('deactivated_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('deactivated_at');
        });
    }
};
```

`api/database/migrations/2026_07_30_000002_add_role_to_invitations_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Existing rows keep today's behaviour: invitations created students.
        Schema::table('invitations', function (Blueprint $table) {
            $table->string('role')->default('student');
        });
    }

    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
```

- [ ] **Step 4: Update the User model**

In `api/app/Models/User.php`, add `'deactivated_at' => 'datetime'` to the `casts()` array and add this method next to `hasRole()`:

```php
    public function isActive(): bool
    {
        return $this->deactivated_at === null;
    }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd api && php artisan test --filter=DeactivationTest`
Expected: PASS — 2 tests.

- [ ] **Step 6: Commit**

```bash
git add api/database/migrations api/app/Models/User.php api/tests/Feature/Admin/DeactivationTest.php
git commit -m "feat(api): add user deactivation column and invitation role"
```

---

### Task 4: Deactivated users cannot authenticate

**Files:**
- Create: `api/app/Http/Middleware/EnsureUserActive.php`
- Modify: `api/bootstrap/app.php`
- Modify: `api/app/Modules/Auth/Services/AuthService.php`
- Test: `api/tests/Feature/Admin/DeactivationTest.php` (append)

**Interfaces:**
- Consumes: `User::isActive()` from Task 3.
- Produces: `EnsureUserActive` middleware, appended to the `api` group so it covers every API route in one place.

- [ ] **Step 1: Write the failing tests**

Append to `api/tests/Feature/Admin/DeactivationTest.php`:

```php
test('a deactivated user cannot log in', function () {
    User::factory()->create([
        'email'          => 'gone@example.com',
        'password'       => bcrypt('password'),
        'deactivated_at' => now(),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email'    => 'gone@example.com',
        'password' => 'password',
    ])->assertStatus(401);
});

test('an active session stops working once the user is deactivated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertOk();

    $user->update(['deactivated_at' => now()]);

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertStatus(401);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=DeactivationTest`
Expected: FAIL — login returns 200, and the second request returns 200 instead of 401.

- [ ] **Step 3: Write the middleware**

Create `api/app/Http/Middleware/EnsureUserActive.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isActive()) {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json(['message' => 'Account deactivated.'], 401);
        }

        return $next($request);
    }
}
```

- [ ] **Step 4: Register it on the API group**

In `api/bootstrap/app.php`, inside `->withMiddleware(...)`, after `$middleware->statefulApi();`:

```php
        // Applied to every API route in one place rather than per route file.
        // Guests pass straight through: $request->user() is null.
        $middleware->api(append: [
            \App\Http\Middleware\EnsureUserActive::class,
        ]);
```

- [ ] **Step 5: Reject deactivated users at login**

In `api/app/Modules/Auth/Services/AuthService.php`, replace the body of `login()` with:

```php
    public function login(array $credentials): User
    {
        if (! Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            throw new AuthenticationException('Invalid credentials.');
        }

        $user = Auth::user();

        if (! $user->isActive()) {
            Auth::guard('web')->logout();

            throw new AuthenticationException('Invalid credentials.');
        }

        $this->regenerateSessionIfAvailable(request());

        return $user;
    }
```

The message stays "Invalid credentials." on purpose — telling an anonymous caller that an account exists but is disabled leaks account existence.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=DeactivationTest`
Expected: PASS — 4 tests.

- [ ] **Step 7: Run the whole suite for regressions**

Run: `cd api && php artisan test`
Expected: PASS — all pre-existing tests still green (47 before this work).

- [ ] **Step 8: Commit**

```bash
git add api/app/Http/Middleware/EnsureUserActive.php api/bootstrap/app.php \
        api/app/Modules/Auth/Services/AuthService.php api/tests/Feature/Admin/DeactivationTest.php
git commit -m "feat(api): block deactivated users at login and mid-session"
```

---

### Task 5: Admin module skeleton + user list endpoint

**Files:**
- Create: `api/app/Modules/Admin/AdminServiceProvider.php`
- Create: `api/app/Modules/Admin/Repositories/Contracts/AdminUserRepositoryInterface.php`
- Create: `api/app/Modules/Admin/Repositories/AdminUserRepository.php`
- Create: `api/app/Modules/Admin/Services/AdminUserService.php`
- Create: `api/app/Modules/Admin/Controllers/AdminUserController.php`
- Create: `api/app/Modules/Admin/Resources/AdminUserResource.php`
- Create: `api/app/Modules/Admin/Routes/api.php`
- Modify: `api/routes/api.php`
- Modify: `api/bootstrap/providers.php`
- Test: `api/tests/Feature/Admin/AdminUserListTest.php`

**Interfaces:**
- Produces:
  - `AdminUserRepositoryInterface::paginate(array $filters, int $perPage): LengthAwarePaginator`
  - `AdminUserRepositoryInterface::findOrFail(string $id): User`
  - `AdminUserRepositoryInterface::countActiveAdmins(): int`
  - `AdminUserService::list(array $filters, int $perPage): LengthAwarePaginator`
  - Route names under `/api/v1/admin/users`.

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Admin/AdminUserListTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

function admin(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('guests cannot list users', function () {
    $this->getJson('/api/v1/admin/users')->assertStatus(401);
});

test('students cannot list users', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/v1/admin/users')
        ->assertStatus(403);
});

test('teachers cannot list users', function () {
    $this->actingAs(User::factory()->teacher()->create())
        ->getJson('/api/v1/admin/users')
        ->assertStatus(403);
});

test('an admin sees every user with role and status', function () {
    $admin = admin();
    User::factory()->teacher()->create(['name' => 'Tina Teacher']);
    User::factory()->create(['name' => 'Sam Student']);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data'  => [['id', 'name', 'email', 'role', 'is_active', 'created_at']],
            'meta'  => ['current_page', 'last_page', 'total'],
        ]);
});

test('an admin can search by name or email', function () {
    $admin = admin();
    User::factory()->create(['name' => 'Findable Person', 'email' => 'findme@example.com']);
    User::factory()->create(['name' => 'Someone Else', 'email' => 'other@example.com']);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?search=findme')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Findable Person');
});

test('an admin can filter by role and by status', function () {
    $admin = admin();
    User::factory()->teacher()->create();
    User::factory()->create(['deactivated_at' => now()]);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?role=teacher')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?status=inactive')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.is_active', false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=AdminUserListTest`
Expected: FAIL — 404, the route does not exist.

- [ ] **Step 3: Write the repository contract and implementation**

`api/app/Modules/Admin/Repositories/Contracts/AdminUserRepositoryInterface.php`:

```php
<?php

namespace App\Modules\Admin\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminUserRepositoryInterface
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function findOrFail(string $id): User;

    public function countActiveAdmins(): int;
}
```

`api/app/Modules/Admin/Repositories/AdminUserRepository.php`:

```php
<?php

namespace App\Modules\Admin\Repositories;

use App\Models\User;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserRepository implements AdminUserRepositoryInterface
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        return User::query()
            ->with('roles')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, function ($query, string $role) {
                $query->whereHas('roles', fn ($q) => $q->where('name', $role));
            })
            ->when($filters['status'] ?? null, function ($query, string $status) {
                $status === 'inactive'
                    ? $query->whereNotNull('deactivated_at')
                    : $query->whereNull('deactivated_at');
            })
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function findOrFail(string $id): User
    {
        return User::with('roles')->findOrFail($id);
    }

    public function countActiveAdmins(): int
    {
        return User::query()
            ->whereNull('deactivated_at')
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->count();
    }
}
```

`ilike` is PostgreSQL's case-insensitive LIKE. This project is Postgres-only (see `docker-compose.prod.yml`).

- [ ] **Step 4: Write the service, resource, controller and routes**

`api/app/Modules/Admin/Services/AdminUserService.php`:

```php
<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserService
{
    public function __construct(
        private readonly AdminUserRepositoryInterface $users
    ) {}

    public function list(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $perPage);
    }
}
```

`api/app/Modules/Admin/Resources/AdminUserResource.php`:

```php
<?php

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            // One role per user through this UI; first() is the effective role.
            'role'       => $this->roles->pluck('name')->first(),
            'is_active'  => $this->deactivated_at === null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
```

`api/app/Modules/Admin/Controllers/AdminUserController.php`:

```php
<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admin\Resources\AdminUserResource;
use App\Modules\Admin\Services\AdminUserService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUserController extends Controller
{
    public function __construct(private readonly AdminUserService $users) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $paginator = $this->users->list([
            'search' => $request->query('search'),
            'role'   => $request->query('role'),
            'status' => $request->query('status'),
        ], (int) $request->query('per_page', 25));

        return AdminUserResource::collection($paginator);
    }
}
```

`api/app/Modules/Admin/Routes/api.php`:

```php
<?php

use App\Modules\Admin\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::get('users', [AdminUserController::class, 'index']);
    });
```

`api/app/Modules/Admin/AdminServiceProvider.php`:

```php
<?php

namespace App\Modules\Admin;

use App\Modules\Admin\Repositories\AdminUserRepository;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AdminServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AdminUserRepositoryInterface::class, AdminUserRepository::class);
    }
}
```

- [ ] **Step 5: Register the module**

Add to `api/routes/api.php` inside the `v1` group:

```php
    require app_path('Modules/Admin/Routes/api.php');
```

Add to `api/bootstrap/providers.php`:

```php
use App\Modules\Admin\AdminServiceProvider;
```

and `AdminServiceProvider::class,` to the returned array.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=AdminUserListTest`
Expected: PASS — 6 tests.

- [ ] **Step 7: Commit**

```bash
git add api/app/Modules/Admin api/routes/api.php api/bootstrap/providers.php api/tests/Feature/Admin/AdminUserListTest.php
git commit -m "feat(api): add Admin module with user list endpoint"
```

---

### Task 6: Create users — invite and password modes

**Files:**
- Create: `api/app/Modules/Admin/Requests/CreateUserRequest.php`
- Modify: `api/app/Modules/Admin/Repositories/AdminUserRepository.php`
- Modify: `api/app/Modules/Admin/Repositories/Contracts/AdminUserRepositoryInterface.php`
- Modify: `api/app/Modules/Admin/Services/AdminUserService.php`
- Modify: `api/app/Modules/Admin/Controllers/AdminUserController.php`
- Modify: `api/app/Modules/Admin/Routes/api.php`
- Test: `api/tests/Feature/Admin/AdminUserCreateTest.php`

**Interfaces:**
- Consumes: `AdminUserRepositoryInterface` (Task 5), `InvitationService` from `App\Modules\Enrollment\Services`.
- Produces:
  - `AdminUserRepositoryInterface::create(array $data): User`
  - `AdminUserRepositoryInterface::setRole(User $user, string $role): void`
  - `AdminUserService::create(array $data): ?User` — returns the User for `password` mode, `null` for `invite` mode.

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Admin/AdminUserCreateTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use App\Modules\Enrollment\Models\Invitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
    Mail::fake();
});

function adminUser(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('password mode creates an active user with the requested role', function () {
    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'     => 'password',
            'name'     => 'Tina Teacher',
            'email'    => 'tina@example.com',
            'role'     => 'teacher',
            'password' => 'secret-password',
        ])
        ->assertCreated()
        ->assertJsonPath('data.role', 'teacher')
        ->assertJsonPath('data.is_active', true);

    $created = User::where('email', 'tina@example.com')->first();

    expect($created)->not->toBeNull()
        ->and($created->hasRole('teacher'))->toBeTrue()
        ->and($created->isActive())->toBeTrue();
});

test('invite mode creates an invitation carrying the role and sends no account', function () {
    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'  => 'invite',
            'email' => 'invited@example.com',
            'role'  => 'teacher',
        ])
        ->assertCreated();

    expect(User::where('email', 'invited@example.com')->exists())->toBeFalse();

    $invitation = Invitation::where('email', 'invited@example.com')->first();

    expect($invitation)->not->toBeNull()
        ->and($invitation->role)->toBe('teacher');
});

test('password mode requires a password', function () {
    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'  => 'password',
            'name'  => 'No Password',
            'email' => 'nopw@example.com',
            'role'  => 'student',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('password');
});

test('an email already in use is rejected', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'     => 'password',
            'name'     => 'Duplicate',
            'email'    => 'taken@example.com',
            'role'     => 'student',
            'password' => 'secret-password',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('an unknown role is rejected', function () {
    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'     => 'password',
            'name'     => 'Bad Role',
            'email'    => 'badrole@example.com',
            'role'     => 'wizard',
            'password' => 'secret-password',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('role');
});

test('non-admins cannot create users', function () {
    $this->actingAs(User::factory()->teacher()->create())
        ->postJson('/api/v1/admin/users', [
            'mode'     => 'password',
            'name'     => 'Nope',
            'email'    => 'nope@example.com',
            'role'     => 'teacher',
            'password' => 'secret-password',
        ])
        ->assertStatus(403);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=AdminUserCreateTest`
Expected: FAIL — 405/404, the POST route does not exist.

- [ ] **Step 3: Write the request validation**

`api/app/Modules/Admin/Requests/CreateUserRequest.php`:

```php
<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'mode'     => ['required', Rule::in(['invite', 'password'])],
            'email'    => ['required', 'email', 'unique:users,email'],
            'role'     => ['required', Rule::in(['student', 'teacher', 'admin'])],
            'name'     => ['required_if:mode,password', 'string', 'max:255'],
            'password' => ['required_if:mode,password', 'string', 'min:8'],
        ];
    }
}
```

- [ ] **Step 4: Extend the repository**

Add to `AdminUserRepositoryInterface`:

```php
    public function create(array $data): User;

    public function setRole(User $user, string $role): void;
```

Add to `AdminUserRepository` (and `use App\Models\Role;` at the top):

```php
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function setRole(User $user, string $role): void
    {
        // Exactly one role per user through the admin UI: replace, never append.
        $user->roles()->sync([Role::firstOrCreate(['name' => $role])->id]);
    }
```

- [ ] **Step 5: Extend the service**

Replace `AdminUserService` with:

```php
<?php

namespace App\Modules\Admin\Services;

use App\Models\User;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use App\Modules\Enrollment\Services\InvitationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class AdminUserService
{
    public function __construct(
        private readonly AdminUserRepositoryInterface $users,
        private readonly InvitationService $invitations,
    ) {}

    public function list(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $perPage);
    }

    /** Returns the created User in password mode, or null in invite mode. */
    public function create(array $data): ?User
    {
        if ($data['mode'] === 'invite') {
            $this->invitations->inviteWithRole($data['email'], $data['role']);

            return null;
        }

        $user = $this->users->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'color'    => '#2747E0',
        ]);

        $this->users->setRole($user, $data['role']);

        return $user->fresh('roles');
    }
}
```

- [ ] **Step 6: Add `inviteWithRole` to InvitationService**

Open `api/app/Modules/Enrollment/Services/InvitationService.php`. Add a method mirroring the existing invite method but persisting the role, and set `role` on the created invitation row. Also add `'role'` to `Invitation::$fillable` in `api/app/Modules/Enrollment/Models/Invitation.php`.

```php
    public function inviteWithRole(string $email, string $role): void
    {
        $this->invite($email, [], $role);
    }
```

Adjust the existing `invite()` signature to `invite(string $email, array $courseIds = [], string $role = 'student')` and include `'role' => $role` in the payload it persists. Existing callers pass no role and keep today's behaviour.

- [ ] **Step 7: Add the controller action and route**

Add to `AdminUserController` (with `use App\Modules\Admin\Requests\CreateUserRequest;` and `use Illuminate\Http\JsonResponse;`):

```php
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->users->create($request->validated());

        return response()->json([
            'data'    => $user ? new AdminUserResource($user) : null,
            'message' => $user ? 'User created.' : 'Invitation sent.',
        ], 201);
    }
```

Add to `Modules/Admin/Routes/api.php` inside the group:

```php
        Route::post('users', [AdminUserController::class, 'store']);
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=AdminUserCreateTest`
Expected: PASS — 6 tests.

- [ ] **Step 9: Run the full suite**

Run: `cd api && php artisan test`
Expected: PASS — including the 8 pre-existing invitation tests, which must still pass after the `invite()` signature change.

- [ ] **Step 10: Commit**

```bash
git add api/app/Modules/Admin api/app/Modules/Enrollment api/tests/Feature/Admin/AdminUserCreateTest.php
git commit -m "feat(api): admin can create users by invitation or with a password"
```

---

### Task 7: Update, deactivate, reactivate — with lockout guardrails

**Files:**
- Create: `api/app/Modules/Admin/Requests/UpdateUserRequest.php`
- Create: `api/app/Modules/Admin/Exceptions/AdminActionDenied.php`
- Modify: `api/app/Modules/Admin/Services/AdminUserService.php`
- Modify: `api/app/Modules/Admin/Controllers/AdminUserController.php`
- Modify: `api/app/Modules/Admin/Routes/api.php`
- Test: `api/tests/Feature/Admin/AdminUserGuardrailsTest.php`

**Interfaces:**
- Consumes: `AdminUserRepositoryInterface::find`, `::setRole`, `::countActiveAdmins`.
- Produces: `AdminUserService::update(User $actor, string $id, array $data): User`, `::deactivate(User $actor, string $id): User`, `::reactivate(string $id): User`. All throw `AdminActionDenied` (HTTP 422) when a guardrail trips.

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Admin/AdminUserGuardrailsTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use App\Modules\Admin\Exceptions\AdminActionDenied;
use App\Modules\Admin\Services\AdminUserService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

function makeAdmin(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('an admin can rename a user and change their email', function () {
    $target = User::factory()->create();

    $this->actingAs(makeAdmin())
        ->patchJson("/api/v1/admin/users/{$target->id}", [
            'name'  => 'Corrected Name',
            'email' => 'corrected@example.com',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Corrected Name');
});

test('changing a role replaces it rather than adding one', function () {
    $target = User::factory()->create();

    $this->actingAs(makeAdmin())
        ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => 'teacher'])
        ->assertOk()
        ->assertJsonPath('data.role', 'teacher');

    expect($target->fresh()->roles)->toHaveCount(1);
});

test('an admin can deactivate and reactivate a user', function () {
    $admin  = makeAdmin();
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/deactivate")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/reactivate")
        ->assertOk()
        ->assertJsonPath('data.is_active', true);
});

test('an admin cannot deactivate themselves', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$admin->id}/deactivate")
        ->assertStatus(422);

    expect($admin->fresh()->isActive())->toBeTrue();
});

test('an admin cannot demote themselves', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => 'teacher'])
        ->assertStatus(422);

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

// The last-admin rules are tested against the service rather than over HTTP.
// Over HTTP they are unreachable: the caller must be an active admin, so
// whenever the target is a *different* active admin there are at least two,
// and whenever the target is the last one it is the caller — which the
// self-action rule rejects first. The rules are defence in depth for callers
// that are not the HTTP layer (artisan commands, future endpoints), so they
// are exercised where they can actually fire.

test('the service refuses to deactivate the last active admin', function () {
    $victim = makeAdmin();
    $actor  = makeAdmin();
    $actor->update(['deactivated_at' => now()]); // leaves $victim as the only active admin

    expect(fn () => app(AdminUserService::class)->deactivate($actor, $victim->id))
        ->toThrow(AdminActionDenied::class);

    expect($victim->fresh()->isActive())->toBeTrue();
});

test('the service refuses to demote the last active admin', function () {
    $victim = makeAdmin();
    $actor  = makeAdmin();
    $actor->update(['deactivated_at' => now()]);

    expect(fn () => app(AdminUserService::class)->update($actor, $victim->id, ['role' => 'student']))
        ->toThrow(AdminActionDenied::class);

    expect($victim->fresh()->hasRole('admin'))->toBeTrue();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=AdminUserGuardrailsTest`
Expected: FAIL — routes do not exist.

- [ ] **Step 3: Write the exception**

`api/app/Modules/Admin/Exceptions/AdminActionDenied.php`:

```php
<?php

namespace App\Modules\Admin\Exceptions;

use Exception;

class AdminActionDenied extends Exception
{
    public static function selfAction(string $what): self
    {
        return new self("You cannot {$what} your own account.");
    }

    public static function lastAdmin(string $what): self
    {
        return new self("You cannot {$what} the last remaining administrator.");
    }
}
```

- [ ] **Step 4: Write the request validation**

`api/app/Modules/Admin/Requests/UpdateUserRequest.php`:

```php
<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes', 'email',
                Rule::unique('users', 'email')->ignore($this->route('id')),
            ],
            'role'  => ['sometimes', Rule::in(['student', 'teacher', 'admin'])],
        ];
    }
}
```

- [ ] **Step 5: Add the service methods**

Add to `AdminUserService` (with `use App\Modules\Admin\Exceptions\AdminActionDenied;`):

```php
    public function update(User $actor, string $id, array $data): User
    {
        $user = $this->users->findOrFail($id);

        if (array_key_exists('role', $data) && $data['role'] !== 'admin') {
            $this->assertDemotionAllowed($actor, $user);
        }

        $user->fill(array_intersect_key($data, array_flip(['name', 'email'])))->save();

        if (array_key_exists('role', $data)) {
            $this->users->setRole($user, $data['role']);
        }

        return $user->fresh('roles');
    }

    public function deactivate(User $actor, string $id): User
    {
        $user = $this->users->findOrFail($id);

        if ($actor->id === $user->id) {
            throw AdminActionDenied::selfAction('deactivate');
        }

        if ($user->hasRole('admin') && $user->isActive() && $this->users->countActiveAdmins() <= 1) {
            throw AdminActionDenied::lastAdmin('deactivate');
        }

        $user->update(['deactivated_at' => now()]);

        return $user->fresh('roles');
    }

    public function reactivate(string $id): User
    {
        $user = $this->users->findOrFail($id);
        $user->update(['deactivated_at' => null]);

        return $user->fresh('roles');
    }

    private function assertDemotionAllowed(User $actor, User $user): void
    {
        if (! $user->hasRole('admin')) {
            return;
        }

        if ($actor->id === $user->id) {
            throw AdminActionDenied::selfAction('demote');
        }

        if ($user->isActive() && $this->users->countActiveAdmins() <= 1) {
            throw AdminActionDenied::lastAdmin('demote');
        }
    }
```

`findOrFail` already exists on the contract and repository from Task 5; nothing to add there.

- [ ] **Step 6: Add controller actions and routes**

Add to `AdminUserController` (with `use App\Modules\Admin\Exceptions\AdminActionDenied;` and `use App\Modules\Admin\Requests\UpdateUserRequest;`):

```php
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        try {
            $user = $this->users->update($request->user(), $id, $request->validated());
        } catch (AdminActionDenied $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => new AdminUserResource($user)]);
    }

    public function deactivate(Request $request, string $id): JsonResponse
    {
        try {
            $user = $this->users->deactivate($request->user(), $id);
        } catch (AdminActionDenied $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => new AdminUserResource($user)]);
    }

    public function reactivate(string $id): JsonResponse
    {
        return response()->json([
            'data' => new AdminUserResource($this->users->reactivate($id)),
        ]);
    }
```

Add to `Modules/Admin/Routes/api.php` inside the group:

```php
        Route::patch('users/{id}', [AdminUserController::class, 'update']);
        Route::post('users/{id}/deactivate', [AdminUserController::class, 'deactivate']);
        Route::post('users/{id}/reactivate', [AdminUserController::class, 'reactivate']);
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=AdminUserGuardrailsTest`
Expected: PASS — 7 tests.

- [ ] **Step 8: Commit**

```bash
git add api/app/Modules/Admin api/tests/Feature/Admin/AdminUserGuardrailsTest.php
git commit -m "feat(api): admin user update, deactivate, reactivate with lockout guardrails"
```

---

### Task 8: User detail and password reset

**Files:**
- Create: `api/app/Modules/Admin/Resources/AdminUserDetailResource.php`
- Modify: `api/app/Modules/Admin/Services/AdminUserService.php`
- Modify: `api/app/Modules/Admin/Controllers/AdminUserController.php`
- Modify: `api/app/Modules/Admin/Routes/api.php`
- Test: `api/tests/Feature/Admin/AdminUserDetailTest.php`

**Interfaces:**
- Consumes: `AuthService::sendMagicLink(string $email): void`.
- Produces: `AdminUserService::detail(string $id): User`, `::sendPasswordReset(string $id): void`.

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Admin/AdminUserDetailTest.php`:

```php
<?php

use App\Models\Course;
use App\Models\Role;
use App\Models\User;
use App\Modules\Auth\Mail\MagicLinkMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
    Mail::fake();
});

function detailAdmin(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('detail shows a teacher and the courses they own', function () {
    $teacher = User::factory()->teacher()->create();

    Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);

    $this->actingAs(detailAdmin())
        ->getJson("/api/v1/admin/users/{$teacher->id}")
        ->assertOk()
        ->assertJsonPath('data.role', 'teacher')
        ->assertJsonCount(1, 'data.courses')
        ->assertJsonPath('data.courses.0.title', 'English B2');
});

test('detail 404s for an unknown user', function () {
    $this->actingAs(detailAdmin())
        ->getJson('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
        ->assertStatus(404);
});

test('an admin can trigger a password reset email', function () {
    $target = User::factory()->create(['email' => 'reset@example.com']);

    $this->actingAs(detailAdmin())
        ->postJson("/api/v1/admin/users/{$target->id}/password-reset")
        ->assertOk();

    Mail::assertSent(MagicLinkMail::class);
});

test('non-admins cannot view user detail', function () {
    $target = User::factory()->create();

    $this->actingAs(User::factory()->teacher()->create())
        ->getJson("/api/v1/admin/users/{$target->id}")
        ->assertStatus(403);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=AdminUserDetailTest`
Expected: FAIL — routes do not exist.

- [ ] **Step 3: Write the detail resource**

`api/app/Modules/Admin/Resources/AdminUserDetailResource.php`:

```php
<?php

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->roles->pluck('name')->first(),
            'is_active'  => $this->deactivated_at === null,
            'created_at' => $this->created_at?->toIso8601String(),

            'courses' => $this->courses->map(fn ($course) => [
                'id'    => $course->id,
                'title' => $course->title,
            ])->values(),

            'enrollments' => $this->enrollments->map(fn ($enrollment) => [
                'id'          => $enrollment->id,
                'course_id'   => $enrollment->course_id,
                'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
```

If `User` has no `courses()` relation, add it next to `enrollments()` in `api/app/Models/User.php`:

```php
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }
```

- [ ] **Step 4: Add the service methods**

Add to `AdminUserService` (inject `AuthService` in the constructor and `use App\Modules\Auth\Services\AuthService;`):

```php
    public function detail(string $id): User
    {
        $user = $this->users->findOrFail($id);
        $user->load(['roles', 'courses', 'enrollments']);

        return $user;
    }

    public function sendPasswordReset(string $id): void
    {
        $this->auth->sendMagicLink($this->users->findOrFail($id)->email);
    }
```

- [ ] **Step 5: Add controller actions and routes**

Add to `AdminUserController` (with `use App\Modules\Admin\Resources\AdminUserDetailResource;`):

```php
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'data' => new AdminUserDetailResource($this->users->detail($id)),
        ]);
    }

    public function passwordReset(string $id): JsonResponse
    {
        $this->users->sendPasswordReset($id);

        return response()->json(['message' => 'Password reset link sent.']);
    }
```

Add to `Modules/Admin/Routes/api.php` inside the group:

```php
        Route::get('users/{id}', [AdminUserController::class, 'show']);
        Route::post('users/{id}/password-reset', [AdminUserController::class, 'passwordReset']);
```

Place `Route::get('users/{id}', ...)` **after** `Route::get('users', ...)` so the collection route is not shadowed.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=AdminUserDetailTest`
Expected: PASS — 4 tests.

- [ ] **Step 7: Commit**

```bash
git add api/app/Modules/Admin api/app/Models/User.php api/tests/Feature/Admin/AdminUserDetailTest.php
git commit -m "feat(api): admin user detail and password reset"
```

---

### Task 9: `atlas:create-admin` provisioning command

**Files:**
- Create: `api/app/Console/Commands/CreateAdminCommand.php`
- Test: `api/tests/Feature/Admin/CreateAdminCommandTest.php`

**Interfaces:**
- Produces: artisan command `atlas:create-admin {email} {--name=} {--password=}`.

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Admin/CreateAdminCommandTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'admin']);
});

test('it creates a new admin', function () {
    $this->artisan('atlas:create-admin', [
        'email'      => 'boss@example.com',
        '--name'     => 'The Boss',
        '--password' => 'secret-password',
    ])->assertExitCode(0);

    $user = User::where('email', 'boss@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('admin'))->toBeTrue()
        ->and($user->isActive())->toBeTrue();
});

test('it promotes an existing user and is idempotent', function () {
    $existing = User::factory()->create(['email' => 'promote@example.com']);

    $this->artisan('atlas:create-admin', ['email' => 'promote@example.com'])
        ->assertExitCode(0);
    $this->artisan('atlas:create-admin', ['email' => 'promote@example.com'])
        ->assertExitCode(0);

    expect($existing->fresh()->hasRole('admin'))->toBeTrue()
        ->and(User::where('email', 'promote@example.com')->count())->toBe(1);
});

test('it reactivates a deactivated admin', function () {
    User::factory()->create([
        'email'          => 'locked@example.com',
        'deactivated_at' => now(),
    ]);

    $this->artisan('atlas:create-admin', ['email' => 'locked@example.com'])
        ->assertExitCode(0);

    expect(User::where('email', 'locked@example.com')->first()->isActive())->toBeTrue();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && php artisan test --filter=CreateAdminCommandTest`
Expected: FAIL — command `atlas:create-admin` does not exist.

- [ ] **Step 3: Write the command**

`api/app/Console/Commands/CreateAdminCommand.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    protected $signature = 'atlas:create-admin
                            {email : Email address of the administrator}
                            {--name= : Display name, used only when creating}
                            {--password= : Password, prompted for when omitted}';

    protected $description = 'Create an administrator, or promote an existing user to administrator';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user  = User::where('email', $email)->first();

        if ($user) {
            $this->promote($user);
            $this->info("Promoted {$email} to administrator.");

            return self::SUCCESS;
        }

        $password = $this->option('password')
            ?: $this->secret('Password for the new administrator');

        if (! $password) {
            $this->error('A password is required when creating a new administrator.');

            return self::FAILURE;
        }

        $user = User::create([
            'name'     => $this->option('name') ?: Str::before($email, '@'),
            'email'    => $email,
            'password' => Hash::make($password),
            'color'    => '#2747E0',
        ]);

        $this->promote($user);
        $this->info("Created administrator {$email}.");

        return self::SUCCESS;
    }

    private function promote(User $user): void
    {
        $user->roles()->sync([Role::firstOrCreate(['name' => 'admin'])->id]);

        // Re-running the command is the documented recovery path when the only
        // administrator has been locked out.
        if (! $user->isActive()) {
            $user->update(['deactivated_at' => null]);
        }
    }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd api && php artisan test --filter=CreateAdminCommandTest`
Expected: PASS — 3 tests.

- [ ] **Step 5: Run the full backend suite**

Run: `cd api && php artisan test`
Expected: PASS — all tests.

- [ ] **Step 6: Commit**

```bash
git add api/app/Console/Commands/CreateAdminCommand.php api/tests/Feature/Admin/CreateAdminCommandTest.php
git commit -m "feat(api): add atlas:create-admin provisioning command"
```

---

### Task 10: Frontend data layer — types, client, hooks, role context

**Files:**
- Create: `apps/web/src/types/admin.ts`
- Create: `apps/web/src/lib/api/admin.ts`
- Create: `apps/web/src/hooks/admin/useAdminUsers.ts`
- Modify: `apps/web/src/contexts/RoleContext.tsx`

**Interfaces:**
- Consumes: `apiClient` from `@/lib/api/client`.
- Produces: `AdminUser`, `AdminUserDetail`, `CreateAdminUserPayload`, `UpdateAdminUserPayload`; hooks `useAdminUsers`, `useAdminUser`, `useCreateAdminUser`, `useUpdateAdminUser`, `useDeactivateUser`, `useReactivateUser`, `useSendPasswordReset`; `useRole()` gains `isAdmin`.

- [ ] **Step 1: Write the types**

`apps/web/src/types/admin.ts`:

```ts
export type AdminRole = 'student' | 'teacher' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  courses: { id: string; title: string }[];
  enrollments: { id: string; course_id: string; enrolled_at: string | null }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: AdminRole | '';
  status?: 'active' | 'inactive' | '';
}

export type CreateAdminUserPayload =
  | { mode: 'invite'; email: string; role: AdminRole }
  | { mode: 'password'; name: string; email: string; role: AdminRole; password: string };

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  role?: AdminRole;
}
```

- [ ] **Step 2: Write the API client**

`apps/web/src/lib/api/admin.ts`:

```ts
import { apiClient } from '@/lib/api/client';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilters,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/types/admin';

export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUser[]> {
  const { data } = await apiClient.get('/api/v1/admin/users', {
    params: {
      search: filters.search || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    },
  });
  return data.data;
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get(`/api/v1/admin/users/${id}`);
  return data.data;
}

export async function createAdminUser(payload: CreateAdminUserPayload) {
  const { data } = await apiClient.post('/api/v1/admin/users', payload);
  return data;
}

export async function updateAdminUser(id: string, payload: UpdateAdminUserPayload) {
  const { data } = await apiClient.patch(`/api/v1/admin/users/${id}`, payload);
  return data.data as AdminUser;
}

export async function deactivateUser(id: string) {
  const { data } = await apiClient.post(`/api/v1/admin/users/${id}/deactivate`);
  return data.data as AdminUser;
}

export async function reactivateUser(id: string) {
  const { data } = await apiClient.post(`/api/v1/admin/users/${id}/reactivate`);
  return data.data as AdminUser;
}

export async function sendPasswordReset(id: string) {
  const { data } = await apiClient.post(`/api/v1/admin/users/${id}/password-reset`);
  return data;
}
```

- [ ] **Step 3: Write the hooks**

`apps/web/src/hooks/admin/useAdminUsers.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminUser,
  deactivateUser,
  fetchAdminUser,
  fetchAdminUsers,
  reactivateUser,
  sendPasswordReset,
  updateAdminUser,
} from '@/lib/api/admin';
import type {
  AdminUserFilters,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/types/admin';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (filters: AdminUserFilters) => ['admin', 'users', filters] as const,
  detail: (id: string) => ['admin', 'users', id] as const,
};

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => fetchAdminUsers(filters),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => fetchAdminUser(id),
    enabled: !!id,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
}

export function useCreateAdminUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminUser(id: string) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: UpdateAdminUserPayload) => updateAdminUser(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: deactivateUser, onSuccess: invalidate });
}

export function useReactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: reactivateUser, onSuccess: invalidate });
}

export function useSendPasswordReset() {
  return useMutation({ mutationFn: sendPasswordReset });
}
```

- [ ] **Step 4: Fix RoleContext**

The current implementation is `isTeacher ? 'teacher' : 'student'`, which silently classifies an admin as a student. Replace `apps/web/src/contexts/RoleContext.tsx` entirely:

```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export type AppRole = 'student' | 'teacher' | 'admin'

export function useRole() {
  const { user } = useAuth()
  const roles = user?.roles ?? []

  const isAdmin = roles.includes('admin')
  const isTeacher = roles.includes('teacher')

  const role: AppRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student'

  return { role, isAdmin, isTeacher, isStudent: role === 'student' }
}
```

`isStudent` is now `role === 'student'` rather than `!isTeacher`, so an admin is never treated as a student.

- [ ] **Step 5: Fix RoleGuard for the third role**

`apps/web/src/components/auth/RoleGuard.tsx` computes `allowed` as
`require === 'teacher' ? isTeacher : !isTeacher`. With a third role that is
wrong: an admin visiting a student-only page passes the `!isTeacher` branch.
Replace the component body's role check:

```tsx
import { useRole, type AppRole } from '@/contexts/RoleContext'

interface RoleGuardProps {
  require: AppRole;
  redirectTo: string;
  children: React.ReactNode;
}

export function RoleGuard({ require, redirectTo, children }: RoleGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { role } = useRole();

  const allowed = role === require;
  // ...remainder of the component is unchanged
```

Then run `grep -rn "RoleGuard" apps/web/src` and confirm every existing call
site still passes `'teacher'` or `'student'`; both remain valid `AppRole` values,
so no call site needs editing.

- [ ] **Step 6: Verify the app still compiles**

Run: `cd apps/web && npx tsc --noEmit && npm run lint`
Expected: no type errors, no lint errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/types/admin.ts apps/web/src/lib/api/admin.ts \
        apps/web/src/hooks/admin apps/web/src/contexts/RoleContext.tsx \
        apps/web/src/components/auth/RoleGuard.tsx
git commit -m "feat(web): admin data layer and admin-aware role context"
```

---

### Task 11: Admin users screen

**Files:**
- Create: `apps/web/src/app/(app)/(admin)/admin/users/page.tsx`
- Create: `apps/web/src/components/admin/CreateUserModal.tsx`

**Interfaces:**
- Consumes: hooks and types from Task 10; UI primitives from `@/components/ui`.

- [ ] **Step 1: Write the create-user modal**

`apps/web/src/components/admin/CreateUserModal.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useCreateAdminUser } from '@/hooks/admin/useAdminUsers'
import type { AdminRole, CreateAdminUserPayload } from '@/types/admin'

const ROLES: AdminRole[] = ['student', 'teacher', 'admin']

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'invite' | 'password'>('invite')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('teacher')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const create = useCreateAdminUser()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload: CreateAdminUserPayload =
      mode === 'invite'
        ? { mode, email, role }
        : { mode, name, email, role, password }

    try {
      await create.mutateAsync(payload)
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Could not create the user.')
    }
  }

  // Shell (dialog + overlay button + card form) mirrors
  // components/teacher/InviteStudentModal.tsx so both modals behave identically.
  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Add a user"
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        background: 'transparent', display: 'grid', placeItems: 'center',
        zIndex: 50, padding: 0, border: 0, maxWidth: 'none', maxHeight: 'none',
      }}
    >
      <button
        aria-label="Close"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          background: 'var(--overlay)', border: 0, cursor: 'default', padding: 0,
        }}
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 480, zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>Add a user</h2>

        <div className="row" style={{ gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            className={mode === 'invite' ? 'btn btn-brand' : 'btn btn-secondary'}
            onClick={() => setMode('invite')}
          >
            Send invitation
          </button>
          <button
            type="button"
            className={mode === 'password' ? 'btn btn-brand' : 'btn btn-secondary'}
            onClick={() => setMode('password')}
          >
            Set a password
          </button>
        </div>

        {mode === 'password' && (
          <Field label="Full name">
            <input
              className="input"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
            />
          </Field>
        )}

        <Field label="Email address">
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="teacher@example.com"
          />
        </Field>

        <Field label="Role">
          <select
            className="input"
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        {mode === 'password' && (
          <Field label="Password">
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Field>
        )}

        {error && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }} role="alert">
            {error}
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : mode === 'invite' ? 'Send invitation' : 'Create user'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
```

Add `import { Field } from '@/components/ui'` to the imports at the top of the file.

- [ ] **Step 2: Write the list page**

`apps/web/src/app/(app)/(admin)/admin/users/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, Badge } from '@/components/ui'
import {
  useAdminUsers,
  useDeactivateUser,
  useReactivateUser,
} from '@/hooks/admin/useAdminUsers'
import { CreateUserModal } from '@/components/admin/CreateUserModal'
import type { AdminRole } from '@/types/admin'

const ROLE_FILTERS: { value: AdminRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'admin', label: 'Admins' },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<AdminRole | ''>('')
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('')
  const [showCreate, setShowCreate] = useState(false)

  const { data: users = [], isLoading, isError } = useAdminUsers({ search, role, status })
  const deactivate = useDeactivateUser()
  const reactivate = useReactivateUser()

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Administration</div>
          <h1 className="h1">Users</h1>
        </div>
        <button className="btn btn-brand" onClick={() => setShowCreate(true)}>
          Add user
        </button>
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={role}
          onChange={e => setRole(e.target.value as AdminRole | '')}
        >
          {ROLE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          className="input"
          value={status}
          onChange={e => setStatus(e.target.value as 'active' | 'inactive' | '')}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {isLoading && <p className="muted">Loading users…</p>}
      {isError && <p className="muted">Could not load users.</p>}

      {!isLoading && !isError && users.length === 0 && (
        <p className="muted">No users match these filters.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map(user => (
          <div
            key={user.id}
            className="card row"
            style={{ gap: 12, alignItems: 'center', padding: 14 }}
          >
            <Avatar name={user.name} />
            <div style={{ flex: 1 }}>
              <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
              <div className="muted">{user.email}</div>
            </div>

            <Badge tone="brand">{user.role}</Badge>
            <Badge tone={user.is_active ? 'success' : 'danger'}>
              {user.is_active ? 'Active' : 'Deactivated'}
            </Badge>

            {user.is_active ? (
              <button
                className="btn btn-secondary"
                onClick={() => deactivate.mutate(user.id)}
                disabled={deactivate.isPending}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => reactivate.mutate(user.id)}
                disabled={reactivate.isPending}
              >
                Reactivate
              </button>
            )}
          </div>
        ))}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit && npm run lint`
Expected: clean. If `Avatar` or `Badge` props differ from the usage above, adjust to match `src/components/ui/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/src/app/(app)/(admin)" apps/web/src/components/admin
git commit -m "feat(web): admin users list with filters, create, deactivate"
```

---

### Task 12: Admin user detail screen and navigation entry

**Files:**
- Create: `apps/web/src/app/(app)/(admin)/admin/users/[id]/page.tsx`
- Modify: the sidebar/nav component that lists app links

**Interfaces:**
- Consumes: `useAdminUser`, `useUpdateAdminUser`, `useSendPasswordReset` (Task 10), `useRole` (Task 10).

- [ ] **Step 1: Write the detail page**

`apps/web/src/app/(app)/(admin)/admin/users/[id]/page.tsx`:

```tsx
'use client'
import { use, useState } from 'react'
import { Badge } from '@/components/ui'
import {
  useAdminUser,
  useSendPasswordReset,
  useUpdateAdminUser,
} from '@/hooks/admin/useAdminUsers'
import type { AdminRole } from '@/types/admin'

const ROLES: AdminRole[] = ['student', 'teacher', 'admin']

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: user, isLoading, isError } = useAdminUser(id)
  const update = useUpdateAdminUser(id)
  const resetPassword = useSendPasswordReset()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <p className="muted">Loading…</p>
  if (isError || !user) return <p className="muted">Could not load this user.</p>

  const changeRole = async (role: AdminRole) => {
    setError(null)
    try {
      await update.mutateAsync({ role })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Could not change the role.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Administration · Users</div>
          <h1 className="h1">{user.name}</h1>
          <div className="muted">{user.email}</div>
        </div>
        <Badge tone={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Active' : 'Deactivated'}
        </Badge>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Role</h2>
        <select
          value={user.role}
          onChange={e => changeRole(e.target.value as AdminRole)}
          disabled={update.isPending}
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {error && <p className="muted" role="alert">{error}</p>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Access</h2>
        <button
          className="btn"
          onClick={() => resetPassword.mutate(id)}
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? 'Sending…' : 'Send password reset link'}
        </button>
        {resetPassword.isSuccess && <p className="muted">Reset link sent.</p>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Courses taught</h2>
        {user.courses.length === 0
          ? <p className="muted">None.</p>
          : <ul>{user.courses.map(c => <li key={c.id}>{c.title}</li>)}</ul>}
      </section>

      <section>
        <h2 className="h2">Enrollments</h2>
        {user.enrollments.length === 0
          ? <p className="muted">None.</p>
          : <ul>{user.enrollments.map(e => <li key={e.id}>{e.course_id}</li>)}</ul>}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Add the admin navigation**

`apps/web/src/components/layout/Sidebar.tsx` holds `studentNav` and `teacherNav`
arrays and selects between them with `const nav = isTeacher ? teacherNav : studentNav`.
An admin currently falls through to `studentNav`.

Add a third array next to the existing two, using the same shape (`Shield` is
already available from `lucide-react`, which the file imports from):

```tsx
const adminNav = [
  { group: 'Administration', items: [
    { id: 'admin-users', label: 'Users', icon: Users, href: '/admin/users' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]
```

Then change the role destructuring and selection:

```tsx
  const { isTeacher, isAdmin } = useRole()
  ...
  const nav = isAdmin ? adminNav : isTeacher ? teacherNav : studentNav
```

`Users` and `Settings` are already imported at the top of the file, so no import
changes are needed.

- [ ] **Step 3: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Full verification against a running stack**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml exec api php artisan atlas:create-admin you@neoroz.com --name="Tamer"
```

Then confirm by hand:
1. Logged out, `/courses` redirects to `/login`.
2. Logged in as a student or teacher, `/admin/users` redirects away.
3. Logged in as the admin, `/admin/users` lists every user.
4. Creating a user in password mode produces a working login.
5. Deactivating a user logs them out on their next request.
6. Deactivating your own account is refused with a clear message.

- [ ] **Step 5: Run every test**

Run: `cd api && php artisan test` and `cd apps/web && npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/app/(app)/(admin)" apps/web/src/components
git commit -m "feat(web): admin user detail screen and navigation entry"
```

---

## Self-Review Notes

**Spec coverage:** guard (Tasks 1–2), `deactivated_at` and `invitations.role` (Task 3), login and mid-session blocking (Task 4), list with search and filters (Task 5), both creation modes (Task 6), edit, role change, deactivate, reactivate, both guardrails (Task 7), detail and password reset (Task 8), provisioning command (Task 9), `RoleContext` widening (Task 10), both screens and nav (Tasks 11–12). No spec requirement is unimplemented.

**Known deviation:** the spec describes detail as "the 10 most recent lesson-progress and quiz-attempt records". Task 8 returns courses and enrollments only. Recent activity is deliberately deferred — it needs relations that may not exist on `User` yet, and the detail screen is useful without it. Raise this with the user before implementing Task 8 if the activity list is considered essential.

**Pagination:** the API returns Laravel's paginator envelope (`data` + `meta`), and Task 5 tests assert `meta`. The frontend in Task 10 reads `data.data` and ignores `meta`, so the UI shows the first 25 users. Wiring page controls is deliberately out of scope; if user counts exceed 25 in practice, add a follow-up task.
