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
