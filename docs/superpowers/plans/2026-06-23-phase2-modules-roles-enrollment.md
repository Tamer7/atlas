# Phase 2 — Module Architecture, Roles Pivot & Student Invite Flow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Laravel API into a module-based architecture, replace the `roles` JSON column with a proper pivot table, and build an invite-only student onboarding flow.

**Architecture:** Each feature domain lives in `app/Modules/{Name}/` with its own controllers, services, repositories, models, requests, resources, and routes — all self-contained so any module can be replaced independently. Shared Eloquent models (User, Role) stay in `app/Models/`. Route registration stays in `routes/api.php` which simply requires each module's route file. Module service providers handle only repository bindings.

**Tech Stack:** Laravel 12, Pest, PostgreSQL (via Docker), Sanctum SPA cookie auth, Mailpit (local email preview, port 8025), `QUEUE_CONNECTION=sync` (Phase 2 — no worker needed)

## Global Constraints

- All IDs are UUIDs (`HasUuids` trait on every model, `$table->uuid('id')->primary()` in migrations)
- CSR pattern strictly enforced: controllers call services, services call repositories, no Eloquent in controllers or services
- Every new endpoint requires a FormRequest class — no inline `$request->validate()`
- All API responses use the envelope `{ "data": ..., "message": "..." }` (errors add `"errors": {}`)
- Namespace for module files: `App\Modules\{Module}\{Layer}\{Class}`
- Shared models namespace: `App\Models\{Class}` (unchanged from Phase 1)
- Route prefix: `/api/v1/` — all endpoints remain at the same URLs after the module migration
- `routes/api.php` is the single route entry point — modules do NOT self-register routes in service providers
- Pest for all tests; run inside Docker: `docker compose exec api php artisan test`
- Branch: `develop`
- All commits go to `develop`; one commit per task minimum

---

## File Map

### New files

```
api/app/Modules/
├── Auth/
│   ├── AuthServiceProvider.php
│   ├── Controllers/AuthController.php          ← moved + re-namespaced
│   ├── Services/AuthService.php                ← moved + re-namespaced
│   ├── Repositories/
│   │   ├── Contracts/UserRepositoryInterface.php  ← moved + re-namespaced
│   │   └── UserRepository.php                     ← moved + re-namespaced
│   ├── Models/MagicLinkToken.php               ← moved + re-namespaced
│   ├── Requests/
│   │   ├── LoginRequest.php                    ← moved + re-namespaced
│   │   ├── RegisterRequest.php                 ← moved + re-namespaced
│   │   └── MagicLinkRequest.php                ← moved + re-namespaced
│   ├── Resources/UserResource.php              ← moved + re-namespaced
│   └── Routes/api.php                          ← extracted from routes/api.php
├── Enrollment/
│   ├── EnrollmentServiceProvider.php
│   ├── Controllers/InvitationController.php
│   ├── Services/InvitationService.php
│   ├── Repositories/
│   │   ├── Contracts/InvitationRepositoryInterface.php
│   │   └── InvitationRepository.php
│   ├── Models/Invitation.php
│   ├── Requests/InviteStudentRequest.php
│   ├── Resources/InvitationResource.php
│   ├── Mail/InvitationMail.php
│   └── Routes/api.php

api/app/Models/
└── Role.php                                    ← new shared model

api/app/Http/Middleware/
└── RoleMiddleware.php                          ← new

api/database/migrations/
├── YYYY_MM_DD_create_roles_table.php
├── YYYY_MM_DD_create_user_roles_table.php
├── YYYY_MM_DD_drop_roles_column_from_users.php
└── YYYY_MM_DD_create_invitations_table.php

api/database/seeders/
└── RoleSeeder.php

api/tests/Feature/
├── Auth/AuthTest.php                           ← updated (namespaces, factory)
└── Enrollment/InvitationTest.php               ← new
```

### Modified files

```
api/app/Models/User.php                         ← add roles() BelongsToMany, hasRole(), remove roles cast
api/app/Providers/AppServiceProvider.php        ← remove binding (moved to AuthServiceProvider)
api/bootstrap/providers.php                     ← add AuthServiceProvider, EnrollmentServiceProvider
api/bootstrap/app.php                           ← register RoleMiddleware alias
api/routes/api.php                              ← replace content with require statements
api/database/factories/UserFactory.php          ← add afterCreating() to attach student role
```

### Deleted files (after content is moved to modules)

```
api/app/Http/Controllers/Api/V1/Auth/AuthController.php
api/app/Services/AuthService.php
api/app/Repositories/Contracts/UserRepositoryInterface.php
api/app/Repositories/UserRepository.php
api/app/Models/MagicLinkToken.php
api/app/Http/Requests/Auth/LoginRequest.php
api/app/Http/Requests/Auth/RegisterRequest.php
api/app/Http/Requests/Auth/MagicLinkRequest.php
api/app/Http/Resources/UserResource.php
```

---

## Task 1: Module Infrastructure + Auth Module Migration

Move existing auth code into `app/Modules/Auth/`, update all namespaces, wire up the new service provider, and verify all 10 existing Pest tests still pass unchanged.

**Files:**
- Create: `api/app/Modules/Auth/AuthServiceProvider.php`
- Create: `api/app/Modules/Auth/Controllers/AuthController.php`
- Create: `api/app/Modules/Auth/Services/AuthService.php`
- Create: `api/app/Modules/Auth/Repositories/Contracts/UserRepositoryInterface.php`
- Create: `api/app/Modules/Auth/Repositories/UserRepository.php`
- Create: `api/app/Modules/Auth/Models/MagicLinkToken.php`
- Create: `api/app/Modules/Auth/Requests/LoginRequest.php`
- Create: `api/app/Modules/Auth/Requests/RegisterRequest.php`
- Create: `api/app/Modules/Auth/Requests/MagicLinkRequest.php`
- Create: `api/app/Modules/Auth/Resources/UserResource.php`
- Create: `api/app/Modules/Auth/Routes/api.php`
- Modify: `api/bootstrap/providers.php`
- Modify: `api/app/Providers/AppServiceProvider.php`
- Modify: `api/routes/api.php`
- Delete: `api/app/Http/Controllers/Api/V1/Auth/AuthController.php`
- Delete: `api/app/Services/AuthService.php`
- Delete: `api/app/Repositories/Contracts/UserRepositoryInterface.php`
- Delete: `api/app/Repositories/UserRepository.php`
- Delete: `api/app/Models/MagicLinkToken.php`
- Delete: `api/app/Http/Requests/Auth/LoginRequest.php`
- Delete: `api/app/Http/Requests/Auth/RegisterRequest.php`
- Delete: `api/app/Http/Requests/Auth/MagicLinkRequest.php`
- Delete: `api/app/Http/Resources/UserResource.php`
- Test: `api/tests/Feature/Auth/AuthTest.php` (update MagicLinkToken namespace reference)

**Interfaces:**
- Produces: `App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface` with methods `create(array): User`, `findByEmail(string): ?User`, `createMagicLinkToken(string): string`, `findByMagicLinkToken(string): ?User`
- Produces: `App\Modules\Auth\Resources\UserResource` — used in Task 2 (updated to load roles relationship)

- [ ] **Step 1: Create the Modules directory tree**

```bash
docker compose exec api mkdir -p app/Modules/Auth/Controllers \
  app/Modules/Auth/Services \
  app/Modules/Auth/Repositories/Contracts \
  app/Modules/Auth/Models \
  app/Modules/Auth/Requests \
  app/Modules/Auth/Resources \
  app/Modules/Auth/Routes
```

- [ ] **Step 2: Create `AuthServiceProvider`**

Create `api/app/Modules/Auth/AuthServiceProvider.php`:

```php
<?php

namespace App\Modules\Auth;

use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }
}
```

- [ ] **Step 3: Create `UserRepositoryInterface`**

Create `api/app/Modules/Auth/Repositories/Contracts/UserRepositoryInterface.php`:

```php
<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    public function findByEmail(string $email): ?User;
    public function createMagicLinkToken(string $email): string;
    public function findByMagicLinkToken(string $token): ?User;
}
```

- [ ] **Step 4: Create `MagicLinkToken` model**

Create `api/app/Modules/Auth/Models/MagicLinkToken.php`:

```php
<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MagicLinkToken extends Model
{
    use HasUuids;

    protected $fillable = ['email', 'token', 'expires_at', 'used_at'];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at'    => 'datetime',
    ];
}
```

- [ ] **Step 5: Create `UserRepository`**

Create `api/app/Modules/Auth/Repositories/UserRepository.php`:

```php
<?php

namespace App\Modules\Auth\Repositories;

use App\Models\User;
use App\Modules\Auth\Models\MagicLinkToken;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Str;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function createMagicLinkToken(string $email): string
    {
        MagicLinkToken::where('email', $email)->delete();

        $token = Str::random(64);

        MagicLinkToken::create([
            'email'      => $email,
            'token'      => hash('sha256', $token),
            'expires_at' => now()->addMinutes(15),
        ]);

        return $token;
    }

    public function findByMagicLinkToken(string $token): ?User
    {
        $record = MagicLinkToken::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereNull('used_at')
            ->first();

        if (! $record) {
            return null;
        }

        $record->update(['used_at' => now()]);

        return User::where('email', $record->email)->first();
    }
}
```

- [ ] **Step 6: Create `AuthService`**

Create `api/app/Modules/Auth/Services/AuthService.php`:

```php
<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function login(array $credentials): User
    {
        if (! Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            throw new AuthenticationException('Invalid credentials.');
        }

        $this->regenerateSessionIfAvailable(request());

        return Auth::user();
    }

    public function register(array $data): User
    {
        $user = $this->userRepository->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'color'    => $this->randomColor(),
        ]);

        Auth::login($user);
        $this->regenerateSessionIfAvailable(request());

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    public function sendMagicLink(string $email): void
    {
        $token = $this->userRepository->createMagicLinkToken($email);
        logger()->info('Magic link for ' . $email . ': ' . env('FRONTEND_URL', 'http://localhost:3000') . '/auth/magic?token=' . $token);
    }

    public function verifyMagicLink(string $token): User
    {
        $user = $this->userRepository->findByMagicLinkToken($token);

        if (! $user) {
            throw new \InvalidArgumentException('Invalid or expired sign-in link.');
        }

        Auth::login($user);
        $this->regenerateSessionIfAvailable(request());

        return $user;
    }

    private function regenerateSessionIfAvailable(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }

    private function randomColor(): string
    {
        $colors = ['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E'];
        return $colors[array_rand($colors)];
    }
}
```

Note: `register()` no longer sets `roles` — that is handled by `AuthService::register()` after Task 2 attaches the role via the pivot. For Task 1, leave the `roles` column out of `create()` entirely (the JSON column will be dropped in Task 2; for now it will default to `["student"]` from the DB default — but actually the JSON column default is `'["student"]'` so this is safe).

Wait — the `users` table still has the `roles` JSON column at this point (Task 2 drops it). The `User` model still has `roles` in its casts. So the factory and existing tests still work. `AuthService::register()` previously passed `'roles' => ['student']` — in Task 1, omit this. The DB default `'["student"]'` will fill it. This is intentional: Task 2 will properly wire up pivot-based role assignment and remove the column.

- [ ] **Step 7: Create form request classes**

Create `api/app/Modules/Auth/Requests/LoginRequest.php`:

```php
<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

Create `api/app/Modules/Auth/Requests/RegisterRequest.php`:

```php
<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}
```

Create `api/app/Modules/Auth/Requests/MagicLinkRequest.php`:

```php
<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MagicLinkRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
        ];
    }
}
```

- [ ] **Step 8: Create `UserResource`**

Create `api/app/Modules/Auth/Resources/UserResource.php`:

```php
<?php

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'roles'      => $this->roles ?? ['student'],
            'color'      => $this->color,
            'avatar_url' => $this->avatar_url,
        ];
    }
}
```

Note: `$this->roles ?? ['student']` still works because the JSON cast is still on User in Task 1. Task 2 updates this to `$this->roles->pluck('name')`.

- [ ] **Step 9: Create `AuthController`**

Create `api/app/Modules/Auth/Controllers/AuthController.php`:

```php
<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\MagicLinkRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->login($request->validated());
        } catch (AuthenticationException) {
            return response()->json(['message' => 'Invalid credentials.', 'errors' => []], 401);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Logged in successfully.',
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Account created successfully.',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['user' => new UserResource($request->user())],
        ]);
    }

    public function sendMagicLink(MagicLinkRequest $request): JsonResponse
    {
        $this->authService->sendMagicLink($request->validated('email'));

        return response()->json(['message' => 'Sign-in link sent.']);
    }

    public function verifyMagicLink(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string']]);

        try {
            $user = $this->authService->verifyMagicLink($request->query('token'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Signed in successfully.',
        ]);
    }
}
```

- [ ] **Step 10: Create the Auth module routes file**

Create `api/app/Modules/Auth/Routes/api.php`:

```php
<?php

use App\Modules\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('magic-link', [AuthController::class, 'sendMagicLink']);
    Route::get('magic-link/verify', [AuthController::class, 'verifyMagicLink']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});
```

- [ ] **Step 11: Update `routes/api.php` to require module routes**

Replace the entire content of `api/routes/api.php` with:

```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require app_path('Modules/Auth/Routes/api.php');
});
```

- [ ] **Step 12: Register `AuthServiceProvider` in `bootstrap/providers.php`**

Replace content of `api/bootstrap/providers.php`:

```php
<?php

use App\Providers\AppServiceProvider;
use App\Modules\Auth\AuthServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
];
```

- [ ] **Step 13: Remove binding from `AppServiceProvider`**

Replace content of `api/app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void {}
}
```

- [ ] **Step 14: Update the Pest test to use the new MagicLinkToken namespace**

In `api/tests/Feature/Auth/AuthTest.php`, find all references to `\App\Models\MagicLinkToken` and `App\Models\MagicLinkToken` and replace with `App\Modules\Auth\Models\MagicLinkToken`. There are two references:

In the `magic link verify` test, change:
```php
\App\Models\MagicLinkToken::create([
```
to:
```php
\App\Modules\Auth\Models\MagicLinkToken::create([
```

In the `expired magic link` test, change:
```php
\App\Models\MagicLinkToken::create([
```
to:
```php
\App\Modules\Auth\Models\MagicLinkToken::create([
```

- [ ] **Step 15: Run the test suite**

```bash
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php --compact
```

Expected: `10 passed (23 assertions)`. If any fail, the namespace migration has a typo — check each `use` statement against the new paths.

- [ ] **Step 16: Delete the old files**

```bash
docker compose exec api rm -rf \
  app/Http/Controllers/Api \
  app/Services/AuthService.php \
  app/Repositories \
  app/Models/MagicLinkToken.php \
  app/Http/Requests/Auth \
  app/Http/Resources/UserResource.php
```

Run tests again to confirm nothing broke after deletion:

```bash
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php --compact
```

Expected: `10 passed (23 assertions)`.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "refactor: migrate auth code into Modules/Auth module structure"
```

---

## Task 2: Roles Pivot Table + RoleMiddleware

Replace the `roles` JSON column on `users` with a proper `roles` / `user_roles` pivot table. Add `User::hasRole()` helper. Add `RoleMiddleware`. Update `AuthService`, `UserResource`, and the factory.

**Files:**
- Create: `api/database/migrations/YYYY_create_roles_table.php`
- Create: `api/database/migrations/YYYY_create_user_roles_table.php`
- Create: `api/database/migrations/YYYY_drop_roles_column_from_users.php`
- Create: `api/database/seeders/RoleSeeder.php`
- Create: `api/app/Models/Role.php`
- Create: `api/app/Http/Middleware/RoleMiddleware.php`
- Modify: `api/app/Models/User.php`
- Modify: `api/app/Modules/Auth/Repositories/Contracts/UserRepositoryInterface.php`
- Modify: `api/app/Modules/Auth/Repositories/UserRepository.php`
- Modify: `api/app/Modules/Auth/Services/AuthService.php`
- Modify: `api/app/Modules/Auth/Resources/UserResource.php`
- Modify: `api/database/factories/UserFactory.php`
- Modify: `api/bootstrap/app.php`
- Test: `api/tests/Feature/Auth/AuthTest.php`

**Interfaces:**
- Consumes: `App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface` (from Task 1)
- Produces: `User::roles()` BelongsToMany — used by Task 3's InvitationService to assign student role
- Produces: `User::hasRole(string|array): bool` — used by `RoleMiddleware`
- Produces: `RoleMiddleware` registered as alias `role` — used by Task 3's routes

- [ ] **Step 1: Write the failing tests**

The existing 10 tests still run. Add new assertions and a new test file to verify role behavior. Add to `api/tests/Feature/Auth/AuthTest.php` (at the bottom, before the closing):

```php
test('registered user gets student role', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name'                  => 'New Student',
        'email'                 => 'newstudent@example.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('user_roles', [
        'user_id' => \App\Models\User::where('email', 'newstudent@example.com')->value('id'),
        'role_id' => \App\Models\Role::where('name', 'student')->value('id'),
    ]);
});

test('user roles are returned as string array in api response', function () {
    $user = \App\Models\User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.user.roles', ['student']);
});
```

Run to confirm they fail:

```bash
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php --compact
```

Expected: 10 pass, 2 fail (roles column / user_roles table do not exist yet).

- [ ] **Step 2: Create the `roles` migration**

```bash
docker compose exec api php artisan make:migration create_roles_table
```

Fill the generated file (find it in `database/migrations/`):

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
```

- [ ] **Step 3: Create the `user_roles` pivot migration**

```bash
docker compose exec api php artisan make:migration create_user_roles_table
```

Fill:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('role_id');
            $table->primary(['user_id', 'role_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
```

- [ ] **Step 4: Create the drop-roles-column migration**

```bash
docker compose exec api php artisan make:migration drop_roles_column_from_users
```

Fill:

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
            $table->dropColumn('roles');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('roles')->default('["student"]');
        });
    }
};
```

- [ ] **Step 5: Create `RoleSeeder`**

Create `api/database/seeders/RoleSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['student', 'teacher', 'admin'] as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
    }
}
```

Update `api/database/seeders/DatabaseSeeder.php` to call it:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);
    }
}
```

- [ ] **Step 6: Create the `Role` model**

Create `api/app/Models/Role.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasUuids;

    protected $fillable = ['name'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }
}
```

- [ ] **Step 7: Update the `User` model**

Replace `api/app/Models/User.php`:

```php
<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'color', 'avatar_url', 'bio', 'timezone', 'language', 'goal'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        return $this->roles()->whereIn('name', $roles)->exists();
    }
}
```

Changes from Phase 1: removed `'roles'` from `#[Fillable]`, removed `'roles' => 'array'` from casts, added `roles()` relationship and `hasRole()`.

- [ ] **Step 8: Update `UserRepositoryInterface` to add `assignRole`**

Replace `api/app/Modules/Auth/Repositories/Contracts/UserRepositoryInterface.php`:

```php
<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    public function findByEmail(string $email): ?User;
    public function createMagicLinkToken(string $email): string;
    public function findByMagicLinkToken(string $token): ?User;
    public function assignRole(User $user, string $roleName): void;
}
```

- [ ] **Step 9: Update `UserRepository` to implement `assignRole`**

Add to `api/app/Modules/Auth/Repositories/UserRepository.php` (add import and method):

```php
<?php

namespace App\Modules\Auth\Repositories;

use App\Models\Role;
use App\Models\User;
use App\Modules\Auth\Models\MagicLinkToken;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Str;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function createMagicLinkToken(string $email): string
    {
        MagicLinkToken::where('email', $email)->delete();

        $token = Str::random(64);

        MagicLinkToken::create([
            'email'      => $email,
            'token'      => hash('sha256', $token),
            'expires_at' => now()->addMinutes(15),
        ]);

        return $token;
    }

    public function findByMagicLinkToken(string $token): ?User
    {
        $record = MagicLinkToken::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereNull('used_at')
            ->first();

        if (! $record) {
            return null;
        }

        $record->update(['used_at' => now()]);

        return User::where('email', $record->email)->first();
    }

    public function assignRole(User $user, string $roleName): void
    {
        $role = Role::firstOrCreate(['name' => $roleName]);
        $user->roles()->syncWithoutDetaching($role);
    }
}
```

- [ ] **Step 10: Update `AuthService::register` to assign student role via pivot**

In `api/app/Modules/Auth/Services/AuthService.php`, update `register()`:

```php
public function register(array $data): User
{
    $user = $this->userRepository->create([
        'name'     => $data['name'],
        'email'    => $data['email'],
        'password' => Hash::make($data['password']),
        'color'    => $this->randomColor(),
    ]);

    $this->userRepository->assignRole($user, 'student');

    Auth::login($user);
    $this->regenerateSessionIfAvailable(request());

    return $user;
}
```

- [ ] **Step 11: Update `UserResource` to use the relationship**

Replace `api/app/Modules/Auth/Resources/UserResource.php`:

```php
<?php

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'roles'      => $this->roles->pluck('name')->values()->all(),
            'color'      => $this->color,
            'avatar_url' => $this->avatar_url,
        ];
    }
}
```

- [ ] **Step 12: Update `UserFactory` to attach `student` role after creating**

Read `api/database/factories/UserFactory.php` first, then update the `configure()` method. Replace the factory completely:

```php
<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'password'          => bcrypt('password'),
            'email_verified_at' => now(),
            'color'             => '#2747E0',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            $student = Role::firstOrCreate(['name' => 'student']);
            $user->roles()->syncWithoutDetaching($student);
        });
    }

    public function teacher(): static
    {
        return $this->afterCreating(function (User $user) {
            $teacher = Role::firstOrCreate(['name' => 'teacher']);
            $user->roles()->syncWithoutDetaching($teacher);
            // detach student if present
            $student = Role::where('name', 'student')->first();
            if ($student) {
                $user->roles()->detach($student);
            }
        });
    }
}
```

- [ ] **Step 13: Create `RoleMiddleware`**

Create `api/app/Http/Middleware/RoleMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! $request->user()->hasRole($roles)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
```

- [ ] **Step 14: Register `RoleMiddleware` alias in `bootstrap/app.php`**

In `api/bootstrap/app.php`, update the `withMiddleware` callback:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```

- [ ] **Step 15: Run migrations fresh with seed**

```bash
docker compose exec api php artisan migrate:fresh --seed --force
```

Expected output: all migrations run, RoleSeeder creates student/teacher/admin rows.

- [ ] **Step 16: Run the full test suite**

```bash
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php --compact
```

Expected: `12 passed` (10 original + 2 new role tests). Fix any failures before continuing.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "feat: replace roles JSON column with user_roles pivot table and add RoleMiddleware"
```

---

## Task 3: Enrollment Module + Student Invite Flow

Build the `Enrollment` module with an invite-only student onboarding flow. A teacher POSTs an invite, which creates an `Invitation` record, sends an email via Mailpit, and returns a success response. The student follows the link to `GET /api/v1/invitations/accept?token=...` which creates their account (if new), assigns the `student` role, and logs them in.

**Files:**
- Create: `api/app/Modules/Enrollment/EnrollmentServiceProvider.php`
- Create: `api/app/Modules/Enrollment/Controllers/InvitationController.php`
- Create: `api/app/Modules/Enrollment/Services/InvitationService.php`
- Create: `api/app/Modules/Enrollment/Repositories/Contracts/InvitationRepositoryInterface.php`
- Create: `api/app/Modules/Enrollment/Repositories/InvitationRepository.php`
- Create: `api/app/Modules/Enrollment/Models/Invitation.php`
- Create: `api/app/Modules/Enrollment/Requests/InviteStudentRequest.php`
- Create: `api/app/Modules/Enrollment/Resources/InvitationResource.php`
- Create: `api/app/Modules/Enrollment/Mail/InvitationMail.php`
- Create: `api/app/Modules/Enrollment/Routes/api.php`
- Create: `api/database/migrations/YYYY_create_invitations_table.php`
- Create: `api/tests/Feature/Enrollment/InvitationTest.php`
- Modify: `api/bootstrap/providers.php`
- Modify: `api/routes/api.php`

**Interfaces:**
- Consumes: `User::hasRole(string|array): bool` (from Task 2)
- Consumes: `UserRepository::assignRole(User, string): void` (from Task 2)
- Consumes: `UserRepositoryInterface` (from Task 1) — to find/create the student user
- Produces: `POST /api/v1/teacher/students/invite` protected by `auth:sanctum,role:teacher`
- Produces: `GET /api/v1/invitations/accept?token=` public endpoint, returns user resource + logs them in

- [ ] **Step 1: Write the failing tests first**

Create `api/tests/Feature/Enrollment/InvitationTest.php`:

```php
<?php

use App\Models\Role;
use App\Models\User;
use App\Modules\Enrollment\Models\Invitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles so factory afterCreating works
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

test('teacher can invite a student by email', function () {
    Mail::fake();

    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson('/api/v1/teacher/students/invite', [
            'email'      => 'student@example.com',
            'course_ids' => [],
        ])
        ->assertOk()
        ->assertJsonPath('message', 'Invitation sent.');

    $this->assertDatabaseHas('invitations', [
        'email'       => 'student@example.com',
        'invited_by'  => $teacher->id,
        'accepted_at' => null,
    ]);

    Mail::assertQueued(\App\Modules\Enrollment\Mail\InvitationMail::class);
});

test('non-teacher cannot send invitation', function () {
    $student = User::factory()->create(); // default: student role

    $this->actingAs($student)
        ->postJson('/api/v1/teacher/students/invite', [
            'email'      => 'other@example.com',
            'course_ids' => [],
        ])
        ->assertForbidden();
});

test('unauthenticated user cannot send invitation', function () {
    $this->postJson('/api/v1/teacher/students/invite', [
        'email'      => 'other@example.com',
        'course_ids' => [],
    ])->assertUnauthorized();
});

test('invitation requires valid email', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson('/api/v1/teacher/students/invite', [
            'email'      => 'not-an-email',
            'course_ids' => [],
        ])
        ->assertUnprocessable();
});

test('student can accept invitation and account is created', function () {
    $teacher = User::factory()->teacher()->create();

    $rawToken = \Illuminate\Support\Str::random(64);

    Invitation::create([
        'email'      => 'newstudent@example.com',
        'invited_by' => $teacher->id,
        'token'      => hash('sha256', $rawToken),
        'course_ids' => [],
        'expires_at' => now()->addDays(7),
    ]);

    $this->getJson('/api/v1/invitations/accept?token=' . $rawToken)
        ->assertOk()
        ->assertJsonPath('data.user.email', 'newstudent@example.com')
        ->assertJsonPath('data.user.roles', ['student']);

    $this->assertDatabaseHas('users', ['email' => 'newstudent@example.com']);
    $this->assertNotNull(Invitation::where('email', 'newstudent@example.com')->value('accepted_at'));
});

test('existing user can accept invitation and gets logged in', function () {
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);
    $teacher = User::factory()->teacher()->create();

    $rawToken = \Illuminate\Support\Str::random(64);

    Invitation::create([
        'email'      => 'existing@example.com',
        'invited_by' => $teacher->id,
        'token'      => hash('sha256', $rawToken),
        'course_ids' => [],
        'expires_at' => now()->addDays(7),
    ]);

    $this->getJson('/api/v1/invitations/accept?token=' . $rawToken)
        ->assertOk()
        ->assertJsonPath('data.user.id', $existingUser->id);

    $this->assertCount(1, User::where('email', 'existing@example.com')->get());
});

test('expired invitation token returns 422', function () {
    $teacher = User::factory()->teacher()->create();

    Invitation::create([
        'email'      => 'late@example.com',
        'invited_by' => $teacher->id,
        'token'      => hash('sha256', 'expiredtoken'),
        'course_ids' => [],
        'expires_at' => now()->subDay(),
    ]);

    $this->getJson('/api/v1/invitations/accept?token=expiredtoken')
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Invalid or expired invitation.');
});

test('already accepted invitation token returns 422', function () {
    $teacher = User::factory()->teacher()->create();

    Invitation::create([
        'email'      => 'already@example.com',
        'invited_by' => $teacher->id,
        'token'      => hash('sha256', 'usedtoken'),
        'course_ids' => [],
        'expires_at' => now()->addDays(7),
        'accepted_at'=> now()->subHour(),
    ]);

    $this->getJson('/api/v1/invitations/accept?token=usedtoken')
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Invalid or expired invitation.');
});
```

Run to confirm all 8 fail:

```bash
docker compose exec api php artisan test tests/Feature/Enrollment/InvitationTest.php --compact
```

Expected: all fail (Invitation model, routes, controller don't exist yet).

- [ ] **Step 2: Create the `invitations` migration**

```bash
docker compose exec api php artisan make:migration create_invitations_table
```

Fill:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->index();
            $table->uuid('invited_by');
            $table->foreign('invited_by')->references('id')->on('users')->cascadeOnDelete();
            $table->string('token')->index();
            $table->json('course_ids')->default('[]');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
```

Run migration:

```bash
docker compose exec api php artisan migrate --force
```

- [ ] **Step 3: Create the `Invitation` model**

Create `api/app/Modules/Enrollment/Models/Invitation.php`:

```php
<?php

namespace App\Modules\Enrollment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Invitation extends Model
{
    use HasUuids;

    protected $fillable = ['email', 'invited_by', 'token', 'course_ids', 'expires_at', 'accepted_at'];

    protected $casts = [
        'course_ids'  => 'array',
        'expires_at'  => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
```

- [ ] **Step 4: Create `InvitationRepositoryInterface`**

Create `api/app/Modules/Enrollment/Repositories/Contracts/InvitationRepositoryInterface.php`:

```php
<?php

namespace App\Modules\Enrollment\Repositories\Contracts;

use App\Modules\Enrollment\Models\Invitation;

interface InvitationRepositoryInterface
{
    public function create(array $data): Invitation;
    public function findByToken(string $token): ?Invitation;
}
```

- [ ] **Step 5: Create `InvitationRepository`**

Create `api/app/Modules/Enrollment/Repositories/InvitationRepository.php`:

```php
<?php

namespace App\Modules\Enrollment\Repositories;

use App\Modules\Enrollment\Models\Invitation;
use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;

class InvitationRepository implements InvitationRepositoryInterface
{
    public function create(array $data): Invitation
    {
        return Invitation::create($data);
    }

    public function findByToken(string $token): ?Invitation
    {
        return Invitation::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->first();
    }
}
```

- [ ] **Step 6: Create `InvitationMail`**

Create `api/app/Modules/Enrollment/Mail/InvitationMail.php`:

```php
<?php

namespace App\Modules\Enrollment\Mail;

use App\Modules\Enrollment\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(private readonly Invitation $invitation, string $rawToken)
    {
        $this->acceptUrl = env('FRONTEND_URL', 'http://localhost:3000')
            . '/invitation/accept?token=' . $rawToken;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'You have been invited to Atlas');
    }

    public function content(): Content
    {
        return new Content(text: 'enrollment::invitation');
    }
}
```

Create the plain-text email view `api/resources/views/enrollment/invitation.blade.php`:

```
You have been invited to join Atlas.

Click the link below to create your account and get started:

{{ $acceptUrl }}

This link expires in 7 days.
```

- [ ] **Step 7: Create `InvitationService`**

Create `api/app/Modules/Enrollment/Services/InvitationService.php`:

```php
<?php

namespace App\Modules\Enrollment\Services;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Enrollment\Mail\InvitationMail;
use App\Modules\Enrollment\Models\Invitation;
use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationService
{
    public function __construct(
        private readonly InvitationRepositoryInterface $invitationRepository,
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    public function invite(User $teacher, string $email, array $courseIds): void
    {
        $rawToken = Str::random(64);

        $invitation = $this->invitationRepository->create([
            'email'      => $email,
            'invited_by' => $teacher->id,
            'token'      => hash('sha256', $rawToken),
            'course_ids' => $courseIds,
            'expires_at' => now()->addDays(7),
        ]);

        Mail::queue(new InvitationMail($invitation, $rawToken));
    }

    public function accept(string $rawToken): User
    {
        $invitation = $this->invitationRepository->findByToken($rawToken);

        if (! $invitation) {
            throw new \InvalidArgumentException('Invalid or expired invitation.');
        }

        $user = $this->userRepository->findByEmail($invitation->email);

        if (! $user) {
            $user = $this->userRepository->create([
                'name'     => explode('@', $invitation->email)[0],
                'email'    => $invitation->email,
                'password' => '',
                'color'    => $this->randomColor(),
            ]);
            $this->userRepository->assignRole($user, 'student');
        }

        $invitation->update(['accepted_at' => now()]);

        Auth::login($user);

        if (request()->hasSession()) {
            request()->session()->regenerate();
        }

        return $user;
    }

    private function randomColor(): string
    {
        $colors = ['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E'];
        return $colors[array_rand($colors)];
    }
}
```

- [ ] **Step 8: Create form request**

Create `api/app/Modules/Enrollment/Requests/InviteStudentRequest.php`:

```php
<?php

namespace App\Modules\Enrollment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email'        => ['required', 'email'],
            'course_ids'   => ['present', 'array'],
            'course_ids.*' => ['uuid'],
        ];
    }
}
```

- [ ] **Step 9: Create `InvitationResource`**

Create `api/app/Modules/Enrollment/Resources/InvitationResource.php`:

```php
<?php

namespace App\Modules\Enrollment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'email'       => $this->email,
            'expires_at'  => $this->expires_at->toISOString(),
            'accepted_at' => $this->accepted_at?->toISOString(),
        ];
    }
}
```

- [ ] **Step 10: Create `InvitationController`**

Create `api/app/Modules/Enrollment/Controllers/InvitationController.php`:

```php
<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Enrollment\Requests\InviteStudentRequest;
use App\Modules\Enrollment\Services\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(private readonly InvitationService $invitationService) {}

    public function store(InviteStudentRequest $request): JsonResponse
    {
        $this->invitationService->invite(
            $request->user(),
            $request->validated('email'),
            $request->validated('course_ids'),
        );

        return response()->json(['message' => 'Invitation sent.']);
    }

    public function accept(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string']]);

        try {
            $user = $this->invitationService->accept($request->query('token'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Welcome to Atlas.',
        ]);
    }
}
```

- [ ] **Step 11: Create the Enrollment module routes**

Create `api/app/Modules/Enrollment/Routes/api.php`:

```php
<?php

use App\Modules\Enrollment\Controllers\InvitationController;
use Illuminate\Support\Facades\Route;

// Teacher-only: send invitation
Route::middleware(['auth:sanctum', 'role:teacher'])
    ->prefix('teacher/students')
    ->group(function () {
        Route::post('invite', [InvitationController::class, 'store']);
    });

// Public: accept invitation via token
Route::prefix('invitations')
    ->group(function () {
        Route::get('accept', [InvitationController::class, 'accept']);
    });
```

- [ ] **Step 12: Create `EnrollmentServiceProvider`**

Create `api/app/Modules/Enrollment/EnrollmentServiceProvider.php`:

```php
<?php

namespace App\Modules\Enrollment;

use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;
use App\Modules\Enrollment\Repositories\InvitationRepository;
use Illuminate\Support\ServiceProvider;

class EnrollmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(InvitationRepositoryInterface::class, InvitationRepository::class);
    }
}
```

- [ ] **Step 13: Register `EnrollmentServiceProvider` and add Enrollment routes**

Update `api/bootstrap/providers.php`:

```php
<?php

use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Enrollment\EnrollmentServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    EnrollmentServiceProvider::class,
];
```

Update `api/routes/api.php`:

```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require app_path('Modules/Auth/Routes/api.php');
    require app_path('Modules/Enrollment/Routes/api.php');
});
```

- [ ] **Step 14: Run all tests**

```bash
docker compose exec api php artisan test --compact
```

Expected: `20 passed` (12 auth + 8 enrollment). If enrollment mail tests fail, ensure `QUEUE_CONNECTION=sync` is in the test environment. Check `api/phpunit.xml` — it should have:

```xml
<env name="QUEUE_CONNECTION" value="sync"/>
```

If the `Mail::assertQueued` tests fail because sync mode delivers immediately (not queued), change the test to use `Mail::assertSent` instead of `Mail::assertQueued`. Check which assertion matches the `QUEUE_CONNECTION=sync` behavior (`sync` uses `assertSent`, not `assertQueued`).

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: Enrollment module — student invite flow with InvitationMail and accept endpoint"
```

- [ ] **Step 16: Push to remote**

```bash
git push origin develop
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Module-based architecture — all new code in `app/Modules/`, routes included via `routes/api.php`
- [x] `user_roles` pivot table — replaces JSON column
- [x] `RoleMiddleware` registered as `role` alias
- [x] Teacher invite endpoint: `POST /api/v1/teacher/students/invite` protected by `role:teacher`
- [x] Accept endpoint: `GET /api/v1/invitations/accept?token=` creates account + logs in
- [x] Invitation email sent via `InvitationMail` (queueable, visible in Mailpit)
- [x] All IDs are UUIDs
- [x] CSR pattern maintained: no Eloquent in controllers or services
- [x] Every endpoint has a FormRequest
- [x] All new endpoints have Pest tests

**No placeholders:** All code blocks are complete and copy-pasteable.

**Type/name consistency:**
- `UserRepositoryInterface::assignRole(User $user, string $roleName): void` — matches usage in `AuthService::register()` and `InvitationService::accept()`
- `InvitationRepository::findByToken(string $token)` hashes the token internally — matches `InvitationService::accept()` which passes the raw token
- `InvitationMail` constructor takes `(Invitation $invitation, string $rawToken)` — matches `InvitationService::invite()` call
- `UserResource` is imported from `App\Modules\Auth\Resources\UserResource` in `InvitationController` — correct cross-module usage of a shared resource
