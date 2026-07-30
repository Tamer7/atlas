<?php

use App\Models\Role;
use App\Models\User;
use App\Modules\Enrollment\Models\Invitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
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

    // Prove the stored password actually authenticates end-to-end, not just
    // that some hash was written — guards against a future double-hashing
    // or storage regression that hasRole()/isActive() would never catch.
    //
    // The admin POST above authenticates via the sanctum guard, which
    // switches Laravel's default auth guard to 'sanctum' for the remainder
    // of this (shared) test application instance — a real second HTTP
    // request boots a fresh container and never has this problem. Restore
    // the default guard so Auth::attempt() below runs against the session
    // guard as it would for a genuine unauthenticated login request.
    Auth::shouldUse('web');
    Auth::forgetGuards();

    $this->postJson('/api/v1/auth/login', [
        'email'    => 'tina@example.com',
        'password' => 'secret-password',
    ])
        ->assertOk()
        ->assertJsonPath('data.user.id', $created->id);
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

test('accepting an admin-created invitation assigns the invited role, not student', function () {
    $this->actingAs(adminUser())
        ->postJson('/api/v1/admin/users', [
            'mode'  => 'invite',
            'email' => 'futureteacher@example.com',
            'role'  => 'teacher',
        ])
        ->assertCreated();

    $rawToken = null;

    Mail::assertQueued(\App\Modules\Enrollment\Mail\InvitationMail::class, function ($mail) use (&$rawToken) {
        preg_match('/token=(.+)$/', $mail->acceptUrl, $matches);
        $rawToken = $matches[1] ?? null;

        return true;
    });

    expect($rawToken)->not->toBeNull();

    // The admin POST above authenticates via the sanctum guard, which
    // switches Laravel's default auth guard to 'sanctum' for the remainder
    // of this (shared) test application instance — a real second HTTP
    // request boots a fresh container and never has this problem. Restore
    // the default guard so accept() below, which calls the guard-agnostic
    // Auth::login(), behaves as it would for a genuine unauthenticated
    // invitee request instead of hitting Sanctum's RequestGuard (no login()).
    Auth::shouldUse('web');
    Auth::forgetGuards();

    $this->getJson('/api/v1/invitations/accept?token=' . $rawToken)
        ->assertOk();

    $created = User::where('email', 'futureteacher@example.com')->first();

    expect($created)->not->toBeNull()
        ->and($created->hasRole('teacher'))->toBeTrue()
        ->and($created->hasRole('student'))->toBeFalse();
});
