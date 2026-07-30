<?php

use App\Models\Course;
use App\Models\Enrollment;
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

test("detail shows a student's enrollments", function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $course = Course::create([
        'title'          => 'History 101',
        'tag'            => 'History · 101',
        'category'       => 'Humanities',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-2',
        'glyph'          => 'H',
    ]);

    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);

    $this->actingAs(detailAdmin())
        ->getJson("/api/v1/admin/users/{$student->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data.enrollments')
        ->assertJsonPath('data.enrollments.0.course_id', $course->id);
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

    Mail::assertSent(MagicLinkMail::class, fn ($mail) => $mail->hasTo('reset@example.com'));
});

test('an admin cannot trigger a password reset for a deactivated user', function () {
    $target = User::factory()->create([
        'email'          => 'inactive-reset@example.com',
        'deactivated_at' => now(),
    ]);

    $this->actingAs(detailAdmin())
        ->postJson("/api/v1/admin/users/{$target->id}/password-reset")
        ->assertStatus(422);

    Mail::assertNothingSent();
});

test('non-admins cannot view user detail', function () {
    $target = User::factory()->create();

    $this->actingAs(User::factory()->teacher()->create())
        ->getJson("/api/v1/admin/users/{$target->id}")
        ->assertStatus(403);
});
