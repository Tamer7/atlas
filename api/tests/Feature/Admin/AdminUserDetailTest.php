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
