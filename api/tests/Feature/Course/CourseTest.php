<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
});

test('student only sees enrolled courses', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $enrolled = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);

    Course::create([
        'title'          => 'Spanish A2',
        'tag'            => 'Spanish · A2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-2',
        'glyph'          => 'S',
    ]);

    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $enrolled->id,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($student)
        ->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $enrolled->id);
});

test('teacher can create a course', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson('/api/v1/courses', [
            'title'    => 'Public Speaking',
            'tag'      => 'Soft Skills',
            'category' => 'Soft Skills',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Public Speaking');

    $this->assertDatabaseHas('courses', [
        'title'         => 'Public Speaking',
        'instructor_id' => $teacher->id,
    ]);
});

test('student cannot access unenrolled course detail', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $course = Course::create([
        'title'          => 'Locked Course',
        'tag'            => 'Test',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
    ]);

    $this->actingAs($student)
        ->getJson('/api/v1/courses/' . $course->id)
        ->assertForbidden();
});

test('enrolled student can view course detail', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $course = Course::create([
        'title'          => 'My Course',
        'tag'            => 'Test',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
    ]);

    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($student)
        ->getJson('/api/v1/courses/' . $course->id)
        ->assertOk()
        ->assertJsonPath('data.id', $course->id);
});

test('teacher can add student to course by email', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create(['email' => 'newstudent@example.com']);

    $course = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
    ]);

    $this->actingAs($teacher)
        ->postJson('/api/v1/teacher/courses/' . $course->id . '/students', [
            'email' => 'newstudent@example.com',
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'newstudent@example.com');

    $this->assertDatabaseHas('enrollments', [
        'user_id'   => $student->id,
        'course_id' => $course->id,
    ]);
});

test('student cannot create a course', function () {
    $student = User::factory()->create();

    $this->actingAs($student)
        ->postJson('/api/v1/courses', [
            'title'    => 'Hacked Course',
            'tag'      => 'Test',
            'category' => 'Languages',
        ])
        ->assertForbidden();
});

test('student cannot access teacher roster', function () {
    $student = User::factory()->create();

    $this->actingAs($student)
        ->getJson('/api/v1/teacher/students')
        ->assertForbidden();
});

test('teacher can list students in roster', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $course = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
    ]);

    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($teacher)
        ->getJson('/api/v1/teacher/students')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $student->id);
});
