<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LiveClass;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

function makeCourseWithLiveClass(): array
{
    $teacher = User::factory()->teacher()->create();

    $course = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);

    LiveClass::create([
        'course_id'    => $course->id,
        'teacher_id'   => $teacher->id,
        'title'        => 'One-off Q&A',
        'room_name'    => 'atlas-' . Str::uuid(),
        'status'       => 'scheduled',
        'scheduled_at' => now()->addDay(),
    ]);

    return [$teacher, $course];
}

function grantAdminRole(User $user): void
{
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);
}

test('an authenticated user who is neither enrolled, the instructor, nor an admin is forbidden from listing a course\'s live classes', function () {
    [, $course] = makeCourseWithLiveClass();

    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->getJson("/api/v1/courses/{$course->id}/live-classes")
        ->assertForbidden();
});

test('an enrolled student can list a course\'s live classes', function () {
    [, $course] = makeCourseWithLiveClass();

    $student = User::factory()->create();
    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($student)
        ->getJson("/api/v1/courses/{$course->id}/live-classes")
        ->assertOk();
});

test('the course instructor can list its live classes', function () {
    [$teacher, $course] = makeCourseWithLiveClass();

    $this->actingAs($teacher)
        ->getJson("/api/v1/courses/{$course->id}/live-classes")
        ->assertOk();
});

test('an admin can list any course\'s live classes', function () {
    [, $course] = makeCourseWithLiveClass();

    $admin = User::factory()->create();
    grantAdminRole($admin);

    $this->actingAs($admin)
        ->getJson("/api/v1/courses/{$course->id}/live-classes")
        ->assertOk();
});

test('a guest cannot list a course\'s live classes', function () {
    [, $course] = makeCourseWithLiveClass();

    $this->getJson("/api/v1/courses/{$course->id}/live-classes")
        ->assertUnauthorized();
});
