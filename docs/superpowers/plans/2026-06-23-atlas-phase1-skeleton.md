# Atlas Phase 1: Foundation Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a connected Next.js 15 + Laravel 12 skeleton with working login/register flows (password + magic link) proven end-to-end via Sanctum SPA cookie auth.

**Architecture:** Next.js App Router frontend at localhost:3000 communicates with a Dockerised Laravel API at localhost:8000 using Sanctum SPA cookie authentication (HttpOnly cookies, CSRF-protected). Laravel follows Controller→Service→Repository pattern. API responses follow `{ data, meta, message, errors }` envelope.

**Tech Stack:** Next.js 15 (App Router, TypeScript, Tailwind CSS v3), Axios, TanStack Query v5, React Context for auth; Laravel 12, Sanctum, Pest, PostgreSQL 16, Redis 7 (all in Docker).

## Global Constraints

- All API routes prefixed `/api/v1/`
- API response envelope: `{ "data": ..., "meta": ..., "message": "...", "errors": {} }`
- Laravel follows CSR: Controller → Service → Repository; no direct Eloquent calls in controllers
- Frontend: all API calls via the central Axios instance at `lib/api/client.ts`; all server-state via TanStack Query hooks in `hooks/`
- Auth: Sanctum SPA cookies — `withCredentials: true`, `X-Requested-With: XMLHttpRequest`, CSRF cookie fetched before mutating requests
- **Do not touch files in `design_handoff_atlas/`** — they are read-only design reference
- Laravel version note: user requested "Laravel 13"; use `laravel/laravel` which will install the latest stable (12.x as of Aug 2025)
- Working directory: `d:\Projects\education-atlas\` (Windows, use PowerShell for all shell commands)

---

## File Map

### Project Root
```
d:\Projects\education-atlas\
├── docker-compose.yml
├── .env.example
├── PROGRESS.md                          ← tracks what's built vs handoff spec
├── api/                                 ← Laravel backend (mounted into Docker)
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── entrypoint.sh
│   └── ... (scaffolded by composer)
└── apps/
    └── web/                             ← Next.js frontend
```

### Laravel (`api/`)
```
app/
├── Http/
│   ├── Controllers/Api/V1/Auth/
│   │   └── AuthController.php
│   ├── Requests/Auth/
│   │   ├── LoginRequest.php
│   │   ├── RegisterRequest.php
│   │   └── MagicLinkRequest.php
│   └── Resources/
│       └── UserResource.php
├── Models/
│   ├── User.php                         (extend with extra columns)
│   └── MagicLinkToken.php
├── Repositories/
│   ├── Contracts/
│   │   └── UserRepositoryInterface.php
│   └── UserRepository.php
├── Services/
│   └── AuthService.php
└── Providers/
    └── AppServiceProvider.php           (bind repository)

database/migrations/
├── ..._create_users_table.php           (add color, avatar_url, bio, timezone, language, goal)
└── ..._create_magic_link_tokens_table.php

routes/api.php                           (v1 auth routes)
tests/Feature/Auth/AuthTest.php
```

### Next.js (`apps/web/`)
```
src/
├── app/
│   ├── layout.tsx                       (root layout — fonts, Providers)
│   ├── providers.tsx                    (QueryClientProvider + AuthProvider)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx                   (sidebar shell — placeholder for now)
│       └── dashboard/page.tsx           (stub "you're logged in" page)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── LoginHero.tsx
│   │   └── RegisterForm.tsx
│   └── ui/
│       └── Spinner.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── auth/
│       ├── useLogin.ts
│       ├── useLogout.ts
│       ├── useRegister.ts
│       └── useMagicLink.ts
├── lib/
│   └── api/
│       ├── client.ts                    (axios instance + CSRF interceptor)
│       ├── routes.ts                    (API route constants)
│       └── auth.ts                      (auth API functions)
├── types/
│   ├── user.ts
│   └── api.ts
├── middleware.ts                        (session-cookie guard)
└── styles/
    └── globals.css                      (design tokens as CSS vars + Tailwind base)
```

---

## Task 1: Project Scaffold + Docker Infrastructure

**Files:**
- Create: `docker-compose.yml`
- Create: `api/docker/Dockerfile`
- Create: `api/docker/entrypoint.sh`
- Create: `.env.example`

- [ ] **Step 1: Create top-level directory structure**

Run in PowerShell (from `d:\Projects\education-atlas\`):
```powershell
New-Item -ItemType Directory -Force -Path "api/docker", "apps"
```

- [ ] **Step 2: Create `api/docker/Dockerfile`**

Write this file:
```dockerfile
FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    git curl libpng-dev libzip-dev zip unzip \
    postgresql-dev oniguruma-dev linux-headers \
    nodejs npm ${PHPIZE_DEPS}

RUN docker-php-ext-install \
    pdo_pgsql pgsql mbstring zip exif pcntl bcmath gd

RUN pecl install redis && docker-php-ext-enable redis

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini" && \
    echo "memory_limit = 512M" >> "$PHP_INI_DIR/php.ini" && \
    echo "upload_max_filesize = 64M" >> "$PHP_INI_DIR/php.ini" && \
    echo "post_max_size = 64M" >> "$PHP_INI_DIR/php.ini" && \
    echo "realpath_cache_size = 4096K" >> "$PHP_INI_DIR/php.ini" && \
    echo "realpath_cache_ttl = 600" >> "$PHP_INI_DIR/php.ini"

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs 2>/dev/null || true

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/sessions \
    storage/framework/views storage/framework/cache && \
    chmod -R 777 storage bootstrap/cache

RUN composer dump-autoload --optimize 2>/dev/null || true

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

- [ ] **Step 3: Create `api/docker/entrypoint.sh`**

```sh
#!/bin/sh
set -e

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force

exec "$@"
```

- [ ] **Step 4: Create `docker-compose.yml`**

```yaml
services:
  api:
    build:
      context: ./api
      dockerfile: docker/Dockerfile
    image: atlas-api:local
    container_name: atlas_api
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    volumes:
      - ./api:/var/www/html
      - api_vendor:/var/www/html/vendor
      - api_node_modules:/var/www/html/node_modules
    environment:
      APP_ENV: ${APP_ENV:-local}
      APP_DEBUG: "true"
      APP_KEY: ${APP_KEY}
      APP_URL: ${APP_URL:-http://localhost:8000}
      LOG_CHANNEL: stderr
      LOG_LEVEL: debug
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
      SESSION_DOMAIN: ${SESSION_DOMAIN:-localhost}
      SANCTUM_STATEFUL_DOMAINS: ${SANCTUM_STATEFUL_DOMAINS:-localhost:3000}
      SESSION_COOKIE: atlas_session
      DB_CONNECTION: pgsql
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${DB_DATABASE:-atlas}
      DB_USERNAME: ${DB_USERNAME:-atlas}
      DB_PASSWORD: ${DB_PASSWORD:-secret}
      CACHE_STORE: redis
      QUEUE_CONNECTION: sync
      SESSION_DRIVER: redis
      REDIS_HOST: redis
      REDIS_PASSWORD: "null"
      REDIS_PORT: 6379
      MAIL_MAILER: smtp
      MAIL_HOST: mailpit
      MAIL_PORT: 1025
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    container_name: atlas_postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME:-atlas}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
      POSTGRES_DB: ${DB_DATABASE:-atlas}
    ports:
      - "${DB_HOST_PORT:-5433}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-atlas}"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: atlas_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  mailpit:
    image: axllent/mailpit:latest
    container_name: atlas_mailpit
    ports:
      - "8025:8025"
      - "1025:1025"

volumes:
  postgres_data:
  api_vendor:
  api_node_modules:
```

- [ ] **Step 5: Create `.env.example`**

```env
APP_ENV=local
APP_DEBUG=true
APP_KEY=

BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000

DB_DATABASE=atlas
DB_USERNAME=atlas
DB_PASSWORD=secret
DB_HOST_PORT=5433

NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 6: Verify no typos**

Run: `docker compose config --quiet`
Expected: exits 0 (no output = valid YAML)

---

## Task 2: Laravel Bootstrap

**Files:**
- Create: `api/` (full Laravel project scaffold)
- Modify: `api/.env`
- Modify: `api/config/cors.php`
- Modify: `api/config/sanctum.php` (stateful domains)

- [ ] **Step 1: Scaffold Laravel inside Docker (pulls composer image, writes to `api/`)**

Run from `d:\Projects\education-atlas\`:
```powershell
docker run --rm -v "${PWD}/api:/app" -w /app composer:latest create-project laravel/laravel . --prefer-dist --no-interaction
```
Expected: `api/artisan`, `api/composer.json`, etc. are created.

- [ ] **Step 2: Create `api/.env` from the scaffold's `.env.example`**

Copy `api/.env.example` to `api/.env`, then update these values:
```env
APP_NAME=Atlas
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=atlas
DB_USERNAME=atlas
DB_PASSWORD=secret

CACHE_STORE=redis
SESSION_DRIVER=redis
SESSION_DOMAIN=localhost
SESSION_COOKIE=atlas_session
SANCTUM_STATEFUL_DOMAINS=localhost:3000

QUEUE_CONNECTION=sync

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@atlas.local"
MAIL_FROM_NAME="Atlas"

FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 3: Install Sanctum**

```powershell
docker run --rm -v "${PWD}/api:/app" -w /app composer:latest require laravel/sanctum
```

- [ ] **Step 4: Configure CORS — update `api/config/cors.php`**

Replace the `paths`, `allowed_origins`, and `supports_credentials` values:
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

- [ ] **Step 5: Publish Sanctum config and set stateful domains**

Run:
```powershell
docker compose run --rm api php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Then in `api/config/sanctum.php`, confirm `stateful` reads from env (it does by default):
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000')),
```

- [ ] **Step 6: Generate app key**

```powershell
docker compose run --rm api php artisan key:generate
```
Verify `api/.env` now has `APP_KEY=base64:...`

- [ ] **Step 7: Start services and verify**

```powershell
docker compose up -d
```
Run: `docker compose logs api --tail=20`
Expected: No fatal errors. API server is listening.

Then: `curl http://localhost:8000/up`
Expected: `200 OK` (Laravel health check)

---

## Task 3: Laravel Migrations + Models

**Files:**
- Modify: `api/database/migrations/0001_01_01_000000_create_users_table.php`
- Create: `api/database/migrations/YYYY_MM_DD_create_magic_link_tokens_table.php`
- Modify: `api/app/Models/User.php`
- Create: `api/app/Models/MagicLinkToken.php`
- Modify: `api/database/factories/UserFactory.php`

- [ ] **Step 1: Extend the users migration**

Open `api/database/migrations/0001_01_01_000000_create_users_table.php`.
Inside `Schema::create('users', ...)`, after `$table->string('password');`, add:

```php
$table->json('roles')->default('["student"]');
$table->string('color')->nullable();
$table->string('avatar_url')->nullable();
$table->text('bio')->nullable();
$table->string('timezone')->default('UTC');
$table->string('language', 10)->default('en');
$table->string('goal')->nullable();
```

- [ ] **Step 2: Create magic_link_tokens migration**

Run:
```powershell
docker compose exec api php artisan make:migration create_magic_link_tokens_table
```

Fill the generated file:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magic_link_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('token');
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magic_link_tokens');
    }
};
```

- [ ] **Step 3: Update `api/app/Models/User.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
        'roles', 'color', 'avatar_url', 'bio',
        'timezone', 'language', 'goal',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'roles' => 'array',
    ];
}
```

- [ ] **Step 4: Create `api/app/Models/MagicLinkToken.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MagicLinkToken extends Model
{
    protected $fillable = ['email', 'token', 'expires_at', 'used_at'];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];
}
```

- [ ] **Step 5: Update `api/database/factories/UserFactory.php`**

Add these to the `definition()` return array:
```php
'roles' => ['student'],
'color' => fake()->randomElement(['#2747E0', '#1F7A47', '#D97757', '#B47A00']),
```

- [ ] **Step 6: Run migrations**

```powershell
docker compose exec api php artisan migrate
```

Expected: All migrations run without errors, including `magic_link_tokens`.

---

## Task 4: Laravel CSR Auth Layer

**Files:**
- Create: `api/app/Repositories/Contracts/UserRepositoryInterface.php`
- Create: `api/app/Repositories/UserRepository.php`
- Create: `api/app/Services/AuthService.php`
- Create: `api/app/Http/Resources/UserResource.php`
- Create: `api/app/Http/Requests/Auth/LoginRequest.php`
- Create: `api/app/Http/Requests/Auth/RegisterRequest.php`
- Create: `api/app/Http/Requests/Auth/MagicLinkRequest.php`
- Create: `api/app/Http/Controllers/Api/V1/Auth/AuthController.php`
- Modify: `api/app/Providers/AppServiceProvider.php`

- [ ] **Step 1: Create directory structure**

```powershell
docker compose exec api mkdir -p \
    app/Repositories/Contracts \
    app/Services \
    app/Http/Controllers/Api/V1/Auth \
    app/Http/Requests/Auth \
    app/Http/Resources
```

- [ ] **Step 2: Create `api/app/Repositories/Contracts/UserRepositoryInterface.php`**

```php
<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    public function findByEmail(string $email): ?User;
    public function createMagicLinkToken(string $email): string;
    public function findByMagicLinkToken(string $token): ?User;
}
```

- [ ] **Step 3: Create `api/app/Repositories/UserRepository.php`**

```php
<?php

namespace App\Repositories;

use App\Models\MagicLinkToken;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
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
            'email' => $email,
            'token' => hash('sha256', $token),
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

        if (!$record) {
            return null;
        }

        $record->update(['used_at' => now()]);

        return User::where('email', $record->email)->first();
    }
}
```

- [ ] **Step 4: Create `api/app/Services/AuthService.php`**

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
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
        if (!Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            throw new AuthenticationException('Invalid credentials.');
        }

        request()->session()->regenerate();

        return Auth::user();
    }

    public function register(array $data): User
    {
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'roles' => ['student'],
            'color' => $this->randomColor(),
        ]);

        Auth::login($user);
        request()->session()->regenerate();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    public function sendMagicLink(string $email): void
    {
        $token = $this->userRepository->createMagicLinkToken($email);
        // Phase 1: log only — email job queued in phase 2
        logger()->info("Magic link for {$email}: " . url("/auth/magic?token={$token}"));
    }

    public function verifyMagicLink(string $token): User
    {
        $user = $this->userRepository->findByMagicLinkToken($token);

        if (!$user) {
            throw new \InvalidArgumentException('Invalid or expired sign-in link.');
        }

        Auth::login($user);
        request()->session()->regenerate();

        return $user;
    }

    private function randomColor(): string
    {
        return fake()->randomElement(['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E']);
    }
}
```

- [ ] **Step 5: Create `api/app/Http/Resources/UserResource.php`**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles ?? ['student'],
            'color' => $this->color,
            'avatar_url' => $this->avatar_url,
        ];
    }
}
```

- [ ] **Step 6: Create `api/app/Http/Requests/Auth/LoginRequest.php`**

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

- [ ] **Step 7: Create `api/app/Http/Requests/Auth/RegisterRequest.php`**

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

- [ ] **Step 8: Create `api/app/Http/Requests/Auth/MagicLinkRequest.php`**

```php
<?php

namespace App\Http\Requests\Auth;

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

- [ ] **Step 9: Create `api/app/Http/Controllers/Api/V1/Auth/AuthController.php`**

```php
<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\MagicLinkRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->login($request->validated());
        } catch (AuthenticationException) {
            return response()->json(['message' => 'Invalid credentials.', 'errors' => []], 401);
        }

        return response()->json([
            'data' => ['user' => new UserResource($user)],
            'message' => 'Logged in successfully.',
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'data' => ['user' => new UserResource($user)],
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
            'data' => ['user' => new UserResource($user)],
            'message' => 'Signed in successfully.',
        ]);
    }
}
```

- [ ] **Step 10: Bind repository in `api/app/Providers/AppServiceProvider.php`**

Add to the `register()` method:
```php
$this->app->bind(
    \App\Repositories\Contracts\UserRepositoryInterface::class,
    \App\Repositories\UserRepository::class,
);
```

- [ ] **Step 11: Add auth routes in `api/routes/api.php`**

Replace the file contents with:
```php
<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('magic-link', [AuthController::class, 'sendMagicLink']);
        Route::get('magic-link/verify', [AuthController::class, 'verifyMagicLink']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });
});
```

- [ ] **Step 12: Verify routes are registered**

```powershell
docker compose exec api php artisan route:list --path=api/v1/auth
```

Expected: 6 routes listed (login, register, magic-link x2, logout, me).

---

## Task 5: Laravel Auth Tests (Pest)

**Files:**
- Create: `api/tests/Feature/Auth/AuthTest.php`

- [ ] **Step 1: Write the failing tests**

Create `api/tests/Feature/Auth/AuthTest.php`:
```php
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can register', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Sofia Chen',
        'email' => 'sofia@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJsonStructure([
            'data' => ['user' => ['id', 'name', 'email', 'roles', 'color']],
            'message',
        ]);

    $this->assertDatabaseHas('users', ['email' => 'sofia@example.com']);
});

test('register fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Test',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertUnprocessable();
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create(['password' => bcrypt('secret123')]);

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'secret123',
    ])
    ->assertOk()
    ->assertJsonPath('data.user.id', $user->id);
});

test('login returns 401 with wrong password', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong',
    ])->assertStatus(401);
});

test('authenticated user can get their profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.user.email', $user->email);
});

test('unauthenticated request to me returns 401', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

test('authenticated user can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/auth/logout')
        ->assertOk();
});

test('magic link can be requested for any email', function () {
    $this->postJson('/api/v1/auth/magic-link', ['email' => 'anyone@example.com'])
        ->assertOk()
        ->assertJsonPath('message', 'Sign-in link sent.');
});

test('magic link verify returns user when token valid', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);

    // Request a magic link to get a real token
    $this->postJson('/api/v1/auth/magic-link', ['email' => 'test@example.com']);

    // Get the raw token from the DB (it's stored hashed; we need to grab via the log or reset)
    // Simpler: call the repository directly
    $rawToken = \Illuminate\Support\Str::random(64);
    \App\Models\MagicLinkToken::create([
        'email' => 'test@example.com',
        'token' => hash('sha256', $rawToken),
        'expires_at' => now()->addMinutes(15),
    ]);

    $this->getJson('/api/v1/auth/magic-link/verify?token=' . $rawToken)
        ->assertOk()
        ->assertJsonPath('data.user.email', 'test@example.com');
});

test('expired magic link token returns 422', function () {
    \App\Models\MagicLinkToken::create([
        'email' => 'test@example.com',
        'token' => hash('sha256', 'expiredtoken'),
        'expires_at' => now()->subMinute(),
    ]);

    $this->getJson('/api/v1/auth/magic-link/verify?token=expiredtoken')
        ->assertUnprocessable();
});
```

- [ ] **Step 2: Run tests to verify they fail (before implementation is wired)**

Wait — implementation is already done in Task 4. Run the tests now:

```powershell
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php
```

Expected: All 10 tests PASS. If any fail, debug the specific assertion before proceeding.

- [ ] **Step 3: Commit**

```powershell
git -C "d:/Projects/education-atlas" init
git -C "d:/Projects/education-atlas" add api/ docker-compose.yml .env.example
git -C "d:/Projects/education-atlas" commit -m "feat: Laravel auth skeleton with CSR pattern and Pest tests"
```

---

## Task 6: Next.js Scaffold + Design System

**Files:**
- Create: `apps/web/` (full Next.js project)
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Scaffold Next.js app**

From `d:\Projects\education-atlas\apps\`:
```powershell
npx create-next-app@latest web `
  --typescript `
  --tailwind `
  --eslint `
  --app `
  --src-dir `
  --import-alias "@/*" `
  --no-turbopack
```

When prompted for any remaining options, accept defaults.

- [ ] **Step 2: Install dependencies**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npm install axios @tanstack/react-query @tanstack/react-query-devtools
```

- [ ] **Step 3: Create `.env.local` in `apps/web/`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 4: Write `apps/web/src/app/globals.css`**

Replace entire file:
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --paper: #F6F4EE;
  --paper-2: #EFECE3;
  --card: #FFFFFF;
  --ink: #14130F;
  --ink-2: #2A2823;
  --muted: #6E6A60;
  --faint: #A8A39A;
  --line: #E5E1D6;
  --line-2: #D7D2C4;
  --brand: #2747E0;
  --brand-2: #1F3AC2;
  --brand-tint: #E6EAFB;
  --accent: #D97757;
  --accent-tint: #F6E6DC;
  --success: #1F7A47;
  --success-tint: #DCEEDE;
  --warning: #B47A00;
  --warning-tint: #F7EBC9;
  --danger: #B43A2A;
  --danger-tint: #F4DDD6;
  --font-sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
  --r-xs: 4px;
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
  --r-xl: 20px;
  --r-pill: 999px;
  --sh-sm: 0 1px 2px rgba(20,19,15,.05);
  --sh-md: 0 4px 12px rgba(20,19,15,.06), 0 1px 2px rgba(20,19,15,.04);
  --sh-lg: 0 12px 36px rgba(20,19,15,.10), 0 2px 6px rgba(20,19,15,.05);
  --sh-pop: 0 24px 60px rgba(20,19,15,.18);
}

html, body {
  background: var(--paper);
  font-family: var(--font-sans);
  color: var(--ink);
}
```

- [ ] **Step 5: Write `apps/web/tailwind.config.ts`**

Replace entire file:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        brand: 'var(--brand)',
        'brand-2': 'var(--brand-2)',
        'brand-tint': 'var(--brand-tint)',
        accent: 'var(--accent)',
        'accent-tint': 'var(--accent-tint)',
        success: 'var(--success)',
        'success-tint': 'var(--success-tint)',
        warning: 'var(--warning)',
        'warning-tint': 'var(--warning-tint)',
        danger: 'var(--danger)',
        'danger-tint': 'var(--danger-tint)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        sm: 'var(--sh-sm)',
        md: 'var(--sh-md)',
        lg: 'var(--sh-lg)',
        pop: 'var(--sh-pop)',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Update `apps/web/next.config.ts` to allow localhost API**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/sanctum/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Verify Next.js builds**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npm run build
```

Expected: Build completes without errors. (The default Next.js pages compile fine.)

---

## Task 7: Next.js Auth Infrastructure

**Files:**
- Create: `apps/web/src/types/user.ts`
- Create: `apps/web/src/types/api.ts`
- Create: `apps/web/src/lib/api/client.ts`
- Create: `apps/web/src/lib/api/routes.ts`
- Create: `apps/web/src/lib/api/auth.ts`
- Create: `apps/web/src/contexts/AuthContext.tsx`
- Create: `apps/web/src/hooks/auth/useLogin.ts`
- Create: `apps/web/src/hooks/auth/useLogout.ts`
- Create: `apps/web/src/hooks/auth/useRegister.ts`
- Create: `apps/web/src/hooks/auth/useMagicLink.ts`
- Create: `apps/web/src/app/providers.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/middleware.ts`

- [ ] **Step 1: Create `apps/web/src/types/user.ts`**

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  color?: string;
  avatar_url?: string | null;
}
```

- [ ] **Step 2: Create `apps/web/src/types/api.ts`**

```typescript
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

- [ ] **Step 3: Create `apps/web/src/lib/api/routes.ts`**

```typescript
export const API_ROUTES = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    magicLink: '/api/v1/auth/magic-link',
    magicLinkVerify: '/api/v1/auth/magic-link/verify',
  },
} as const;
```

- [ ] **Step 4: Create `apps/web/src/lib/api/client.ts`**

```typescript
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfInitialised = false;

const ensureCsrf = async () => {
  if (!csrfInitialised) {
    await apiClient.get('/sanctum/csrf-cookie');
    csrfInitialised = true;
  }
};

apiClient.interceptors.request.use(async (config) => {
  const mutating = ['post', 'put', 'patch', 'delete'].includes(
    (config.method || '').toLowerCase()
  );
  if (mutating) {
    await ensureCsrf();
  }
  return config;
});

// Reset on logout so next login refetches CSRF
export const resetCsrf = () => {
  csrfInitialised = false;
};
```

- [ ] **Step 5: Create `apps/web/src/lib/api/auth.ts`**

```typescript
import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.me
  );
  return data.data.user;
};

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<User> => {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.login,
    { email, password }
  );
  return data.data.user;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<User> => {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.register,
    payload
  );
  return data.data.user;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.auth.logout);
};

export const sendMagicLink = async (email: string): Promise<string> => {
  const { data } = await apiClient.post<{ message: string }>(
    API_ROUTES.auth.magicLink,
    { email }
  );
  return data.message;
};

export const verifyMagicLink = async (token: string): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.magicLinkVerify,
    { params: { token } }
  );
  return data.data.user;
};
```

- [ ] **Step 6: Create `apps/web/src/contexts/AuthContext.tsx`**

```typescript
'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <AuthContext.Provider
      value={{
        user: isLoading ? undefined : (user ?? null),
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 7: Create `apps/web/src/hooks/auth/useLogin.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithPassword } from '@/lib/api/auth';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithPassword(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      router.push('/dashboard');
    },
  });
}
```

- [ ] **Step 8: Create `apps/web/src/hooks/auth/useLogout.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api/auth';
import { resetCsrf } from '@/lib/api/client';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      resetCsrf();
      queryClient.clear();
      router.push('/login');
    },
  });
}
```

- [ ] **Step 9: Create `apps/web/src/hooks/auth/useRegister.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth';

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => registerUser(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      router.push('/dashboard');
    },
  });
}
```

- [ ] **Step 10: Create `apps/web/src/hooks/auth/useMagicLink.ts`**

```typescript
import { useMutation } from '@tanstack/react-query';
import { sendMagicLink } from '@/lib/api/auth';

export function useSendMagicLink() {
  return useMutation({
    mutationFn: (email: string) => sendMagicLink(email),
  });
}
```

- [ ] **Step 11: Create `apps/web/src/app/providers.tsx`**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 12: Update `apps/web/src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'Learn anything, one focused session at a time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 13: Create `apps/web/src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = request.cookies.get('atlas_session');
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

- [ ] **Step 14: Verify TypeScript compiles**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npx tsc --noEmit
```

Expected: No errors.

---

## Task 8: Next.js Login Page

**Files:**
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/src/app/(auth)/layout.tsx`
- Create: `apps/web/src/components/auth/LoginForm.tsx`
- Create: `apps/web/src/components/auth/LoginHero.tsx`
- Create: `apps/web/src/components/ui/Spinner.tsx`

- [ ] **Step 1: Create `apps/web/src/components/ui/Spinner.tsx`**

```typescript
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/components/auth/LoginForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/auth/useLogin';
import { useSendMagicLink } from '@/hooks/auth/useMagicLink';
import { Spinner } from '@/components/ui/Spinner';

type Mode = 'link' | 'password';

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const login = useLogin();
  const sendMagicLink = useSendMagicLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'link') {
      sendMagicLink.mutate(email, { onSuccess: () => setLinkSent(true) });
    } else {
      login.mutate({ email, password });
    }
  };

  const isPending = login.isPending || sendMagicLink.isPending;
  const error =
    (login.error as { response?: { data?: { message?: string } } })?.response
      ?.data?.message || (sendMagicLink.error as Error)?.message;

  return (
    <div className="flex items-center justify-center p-12 bg-paper min-h-screen">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>

        <h1
          className="text-ink font-semibold mb-2"
          style={{ fontSize: 38, letterSpacing: '-0.025em' }}
        >
          Welcome back.
        </h1>
        <p className="text-muted mb-7 leading-relaxed" style={{ fontSize: 15, maxWidth: 360 }}>
          Sign in to continue your learning. Choose{' '}
          <strong className="text-ink">magic link</strong> for a passwordless flow,
          or use your password.
        </p>

        {/* Mode toggle */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 mb-6"
          style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}
        >
          {(['link', 'password'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="py-2.5 px-3 text-[13px] font-semibold transition-all duration-150"
              style={{
                background: mode === m ? 'var(--card)' : 'transparent',
                boxShadow: mode === m ? 'var(--sh-sm)' : 'none',
                color: mode === m ? 'var(--ink)' : 'var(--muted)',
                borderRadius: 'var(--r-sm)',
                border: 0,
                cursor: 'pointer',
              }}
            >
              {m === 'link' ? '✦ Magic link' : '🔒 Password'}
            </button>
          ))}
        </div>

        {/* Content */}
        {linkSent ? (
          <div
            className="p-5 mb-4"
            style={{
              background: 'var(--success-tint)',
              border: '1px solid #B5DBC0',
              borderRadius: 'var(--r-md)',
            }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--success)' }}>
              Check your inbox
            </p>
            <p className="text-sm text-ink-2">
              We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold"
              style={{ color: 'var(--brand)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
              onClick={() => setLinkSent(false)}
            >
              Use a different email →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full h-11 px-3.5 text-sm text-ink placeholder:text-faint transition-colors"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
              />
              {mode === 'link' && (
                <p className="mt-1 text-xs text-muted">We'll email you a sign-in link</p>
              )}
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-3.5 pr-10 text-sm text-ink placeholder:text-faint transition-colors"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--line-2)',
                      borderRadius: 'var(--r-md)',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-2 text-base"
                    style={{ background: 'none', border: 0, cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <a href="#" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all active:translate-y-px disabled:opacity-60"
              style={{
                background: 'var(--ink)',
                borderRadius: 'var(--r-md)',
                border: 0,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => !isPending && (e.currentTarget.style.background = 'var(--ink-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}
            >
              {isPending ? (
                <Spinner size={16} />
              ) : mode === 'link' ? (
                'Send sign-in link'
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        )}

        {/* OR divider */}
        <div
          className="flex items-center gap-2.5 my-7 text-[11px] font-semibold tracking-[0.12em]"
          style={{ color: 'var(--faint)' }}
        >
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          OR
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          className="w-full h-11 flex items-center justify-center gap-2.5 text-sm font-medium text-ink transition-colors"
          style={{
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-md)',
            background: 'var(--card)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--card)')}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-7 text-center text-xs" style={{ color: 'var(--muted)' }}>
          New here?{' '}
          <Link href="/register" className="font-semibold text-ink">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 7.9 22 12 22z" />
      <path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z" />
      <path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7c.8-2.5 3.1-4 5.8-4z" />
    </svg>
  );
}
```

- [ ] **Step 3: Create `apps/web/src/components/auth/LoginHero.tsx`**

```typescript
export function LoginHero() {
  return (
    <div
      className="flex flex-col justify-between p-12 text-white min-h-screen"
      style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 60%, #0E2278 100%)',
      }}
    >
      {/* Live count */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#7DDE8C' }} />
        <span className="text-xs font-semibold tracking-[0.1em] uppercase opacity-80">
          1,200 lessons taught this week
        </span>
      </div>

      {/* Main copy */}
      <div>
        <p
          className="font-semibold mb-8"
          style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.035em' }}
        >
          Learn anything,
          <br />
          <span style={{ opacity: 0.65 }}>one focused</span>
          <br />
          session at a time.
        </p>

        {/* Decorative cards */}
        <div className="grid grid-cols-2 gap-3.5">
          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,.10)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 14,
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-2"
              style={{ opacity: 0.7 }}
            >
              Now playing
            </p>
            <p className="font-semibold text-[22px] leading-tight mb-3.5">
              Mixed Conditionals
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span>▶</span>
              <div
                className="flex-1 h-[3px] rounded-pill"
                style={{ background: 'rgba(255,255,255,.2)' }}
              >
                <div
                  className="h-full rounded-pill"
                  style={{ width: '62%', background: '#fff' }}
                />
              </div>
              <span style={{ opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
                06:48 / 18:05
              </span>
            </div>
          </div>

          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,.10)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 14,
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-2"
              style={{ opacity: 0.7 }}
            >
              Today
            </p>
            <p className="font-semibold text-[22px] leading-tight mb-3.5">
              3 lessons · 1 quiz
            </p>
            <div className="flex gap-1.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px]"
                  style={{ borderRadius: 6, background: '#7DDE8C' }}
                />
              ))}
              {[3, 4].map((i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px]"
                  style={{ borderRadius: 6, background: 'rgba(255,255,255,.2)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <blockquote
        className="text-[13px] max-w-[360px] leading-relaxed"
        style={{ opacity: 0.75 }}
      >
        "Atlas changed how I prep my IELTS students — the grading flow used to take my
        Sundays. Now it takes my coffee break."
        <footer className="mt-2.5 font-semibold" style={{ opacity: 0.9 }}>
          — Prof. Marcus Vale, IELTS Coach
        </footer>
      </blockquote>
    </div>
  );
}
```

- [ ] **Step 4: Create `apps/web/src/app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 5: Create `apps/web/src/app/(auth)/login/page.tsx`**

```typescript
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginHero } from '@/components/auth/LoginHero';

export const metadata = { title: 'Sign in — Atlas' };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <LoginForm />
      <LoginHero />
    </div>
  );
}
```

- [ ] **Step 6: Verify the page compiles**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npm run build
```

Expected: Build succeeds.

---

## Task 9: Next.js Register Page

**Files:**
- Create: `apps/web/src/components/auth/RegisterForm.tsx`
- Create: `apps/web/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create `apps/web/src/components/auth/RegisterForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/auth/useRegister';
import { Spinner } from '@/components/ui/Spinner';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ name, email, password, password_confirmation: confirm });
  };

  const error =
    (register.error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
      ?.response?.data;

  const fieldError = (field: string) => error?.errors?.[field]?.[0];

  return (
    <div className="flex items-center justify-center p-12 bg-paper min-h-screen">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>

        <h1
          className="text-ink font-semibold mb-2"
          style={{ fontSize: 38, letterSpacing: '-0.025em' }}
        >
          Create your account.
        </h1>
        <p className="text-muted mb-8" style={{ fontSize: 15 }}>
          Join thousands of learners on Atlas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Full name', type: 'text', value: name, setter: setName, placeholder: 'Sofia Chen', required: true },
            { id: 'email', label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@email.com', required: true },
            { id: 'password', label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '8+ characters', required: true },
            { id: 'confirm', label: 'Confirm password', type: 'password', value: confirm, setter: setConfirm, placeholder: '••••••••', required: true },
          ].map(({ id, label, type, value, setter, placeholder, required }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
              <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                required={required}
                minLength={id === 'password' ? 8 : undefined}
                className="w-full h-11 px-3.5 text-sm text-ink placeholder:text-faint"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${fieldError(id) ? 'var(--danger)' : 'var(--line-2)'}`,
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                }}
                onFocus={(e) =>
                  !fieldError(id) && (e.currentTarget.style.borderColor = 'var(--brand)')
                }
                onBlur={(e) =>
                  !fieldError(id) && (e.currentTarget.style.borderColor = 'var(--line-2)')
                }
              />
              {fieldError(id) && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                  {fieldError(id)}
                </p>
              )}
            </div>
          ))}

          {error?.message && !error.errors && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all active:translate-y-px disabled:opacity-60"
            style={{
              background: 'var(--ink)',
              borderRadius: 'var(--r-md)',
              border: 0,
              cursor: register.isPending ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) =>
              !register.isPending && (e.currentTarget.style.background = 'var(--ink-2)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}
          >
            {register.isPending ? <Spinner size={16} /> : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-xs" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/app/(auth)/register/page.tsx`**

```typescript
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginHero } from '@/components/auth/LoginHero';

export const metadata = { title: 'Create account — Atlas' };

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <RegisterForm />
      <LoginHero />
    </div>
  );
}
```

---

## Task 10: Dashboard Stub + App Shell

**Files:**
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`
- Delete: `apps/web/src/app/page.tsx` (replace default Next.js page)

- [ ] **Step 1: Create `apps/web/src/app/(app)/layout.tsx`**

```typescript
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — full sidebar added in Phase 2 */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 248,
          background: 'var(--paper-2)',
          borderRight: '1px solid var(--line)',
          padding: '24px 16px',
        }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>
        <p className="text-xs text-muted">Navigation coming in Phase 2</p>
      </aside>
      <main className="flex-1 bg-paper">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/app/(app)/dashboard/page.tsx`**

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/auth/useLogout';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-12">
      <p
        className="text-xs font-semibold uppercase tracking-[0.14em] mb-2"
        style={{ color: 'var(--muted)' }}
      >
        Dashboard
      </p>
      <h1
        className="text-ink font-semibold mb-6"
        style={{ fontSize: 38, letterSpacing: '-0.025em' }}
      >
        Welcome back, {user?.name?.split(' ')[0] ?? 'there'}.
      </h1>
      <div
        className="inline-flex items-center gap-3 p-4 mb-6"
        style={{
          background: 'var(--success-tint)',
          border: '1px solid #B5DBC0',
          borderRadius: 'var(--r-md)',
        }}
      >
        <span style={{ color: 'var(--success)' }}>✓</span>
        <span className="text-sm text-ink-2">
          API connection confirmed — logged in as <strong>{user?.email}</strong>
        </span>
      </div>
      <br />
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="text-sm font-semibold"
        style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
      >
        {logout.isPending ? 'Signing out…' : 'Sign out →'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Replace `apps/web/src/app/page.tsx`**

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
```

- [ ] **Step 4: Final build check**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npm run build
```

Expected: Build succeeds. No TypeScript errors.

---

## Task 11: Integration Smoke Test + PROGRESS.md

**Files:**
- Create: `PROGRESS.md`

- [ ] **Step 1: Start all services**

```powershell
cd "d:/Projects/education-atlas"
docker compose up -d
```

Wait ~15 seconds for postgres healthcheck to pass and migrations to run.

- [ ] **Step 2: Verify API is healthy**

```powershell
curl http://localhost:8000/up
```
Expected: `200 OK`

- [ ] **Step 3: Run Laravel tests**

```powershell
docker compose exec api php artisan test tests/Feature/Auth/AuthTest.php --compact
```
Expected: `10 passed`

- [ ] **Step 4: Start Next.js dev server**

```powershell
cd "d:/Projects/education-atlas/apps/web"
npm run dev
```
Expected: `ready on http://localhost:3000`

- [ ] **Step 5: Smoke test registration flow**

1. Open `http://localhost:3000/register` in browser
2. Fill in name, email, password, confirm password
3. Submit
4. Expected: Redirected to `/dashboard` showing "Welcome back, [Name]." with green "API connection confirmed" banner

- [ ] **Step 6: Smoke test login flow**

1. Sign out (click "Sign out →")
2. Open `http://localhost:3000/login`
3. Switch to "Password" mode
4. Enter email + password used in registration
5. Submit
6. Expected: Redirected to `/dashboard`

- [ ] **Step 7: Smoke test magic link flow (dev mode)**

1. Sign out
2. Open `/login`, enter any email in "Magic link" mode, click send
3. Check Docker logs for the logged token:
   ```powershell
   docker compose logs api | Select-String "Magic link for"
   ```
4. Grab the token URL from the log, extract the `token=...` value
5. Open: `http://localhost:8000/api/v1/auth/magic-link/verify?token=<token>` in browser
   (or use the frontend when the verify page is built in Phase 2)
6. Expected: JSON response with user data

- [ ] **Step 8: Create `PROGRESS.md`**

```markdown
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
```

- [ ] **Step 9: Commit everything**

```powershell
cd "d:/Projects/education-atlas"
git add apps/ api/ docker-compose.yml .env.example PROGRESS.md docs/
git commit -m "feat: Atlas Phase 1 — Next.js + Laravel skeleton with working auth"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered? |
|---|---|
| Next.js 15 App Router, TypeScript, Tailwind | ✅ Task 6 |
| Design tokens (CSS vars + Tailwind extend) | ✅ Task 6 Steps 4-5 |
| Axios API client with central config | ✅ Task 7 Step 4 |
| TanStack Query for all server state | ✅ Task 7 Steps 11-12 |
| Auth context (auth store) | ✅ Task 7 Step 6 |
| Hooks in `hooks/` directory | ✅ Task 7 Steps 7-10 |
| Login screen from design (magic link + password modes) | ✅ Task 8 |
| Register screen | ✅ Task 9 |
| Laravel CSR (Controller → Service → Repository) | ✅ Task 4 |
| Sanctum SPA cookie auth | ✅ Tasks 2, 7 |
| PostgreSQL via Docker | ✅ Task 1 |
| Redis via Docker | ✅ Task 1 |
| PROGRESS.md tracker (not modifying handoff notes) | ✅ Task 11 Step 8 |
| `POST /api/v1/auth/login` | ✅ Task 4 |
| `POST /api/v1/auth/register` | ✅ Task 4 |
| `POST /api/v1/auth/logout` | ✅ Task 4 |
| `GET /api/v1/auth/me` | ✅ Task 4 |
| `POST /api/v1/auth/magic-link` | ✅ Task 4 |
| `GET /api/v1/auth/magic-link/verify` | ✅ Task 4 |
| Frontend connected to API (proven end-to-end) | ✅ Task 11 |

**Placeholder scan:** No TBD/TODO/fill-in entries found. All steps have exact code.

**Type consistency:**
- `User` type used in `types/user.ts`, imported by `lib/api/auth.ts`, `contexts/AuthContext.tsx`, all hooks ✅
- `ApiResponse<T>` wraps all typed API calls ✅
- `useLogin` → `loginWithPassword` → `API_ROUTES.auth.login` ✅
- `useRegister` → `registerUser` → `API_ROUTES.auth.register` ✅
