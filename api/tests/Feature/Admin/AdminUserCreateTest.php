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
