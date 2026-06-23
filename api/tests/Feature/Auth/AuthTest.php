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
    \App\Modules\Auth\Models\MagicLinkToken::create([
        'email' => 'test@example.com',
        'token' => hash('sha256', $rawToken),
        'expires_at' => now()->addMinutes(15),
    ]);

    $this->getJson('/api/v1/auth/magic-link/verify?token=' . $rawToken)
        ->assertOk()
        ->assertJsonPath('data.user.email', 'test@example.com');
});

test('expired magic link token returns 422', function () {
    \App\Modules\Auth\Models\MagicLinkToken::create([
        'email' => 'test@example.com',
        'token' => hash('sha256', 'expiredtoken'),
        'expires_at' => now()->subMinute(),
    ]);

    $this->getJson('/api/v1/auth/magic-link/verify?token=expiredtoken')
        ->assertUnprocessable();
});

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
