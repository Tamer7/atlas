<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
});

function curriculumCourse(User $teacher): Course
{
    return Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);
}

function curriculumModule(Course $course, string $title = 'Module 1'): Module
{
    return Module::create([
        'course_id'  => $course->id,
        'title'      => $title,
        'sort_order' => 0,
    ]);
}

function enrollStudent(User $student, Course $course): void
{
    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);
}

test('teacher can create a module', function () {
    $teacher = User::factory()->teacher()->create();
    $course = curriculumCourse($teacher);

    $this->actingAs($teacher)
        ->postJson('/api/v1/courses/' . $course->id . '/modules', [
            'title' => 'Module 1 · Greetings',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Module 1 · Greetings');

    $this->assertDatabaseHas('modules', [
        'course_id' => $course->id,
        'title'     => 'Module 1 · Greetings',
    ]);
});

test('teacher can create a lesson in a module', function () {
    $teacher = User::factory()->teacher()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);

    $this->actingAs($teacher)
        ->postJson('/api/v1/modules/' . $module->id . '/lessons', [
            'title'            => 'Tone and pacing',
            'duration_seconds' => 760,
            'content_type'     => 'video',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Tone and pacing')
        ->assertJsonPath('data.number', 1);

    $this->assertDatabaseHas('lessons', [
        'module_id' => $module->id,
        'title'     => 'Tone and pacing',
    ]);
});

test('enrolled student can update lesson progress', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);
    enrollStudent($student, $course);

    $lesson = Lesson::create([
        'module_id'        => $module->id,
        'title'            => 'First lesson',
        'number'           => 1,
        'duration_seconds' => 600,
        'sort_order'       => 0,
        'content_type'     => 'text',
    ]);

    $this->actingAs($student)
        ->postJson('/api/v1/lessons/' . $lesson->id . '/progress', [
            'position_seconds' => 120,
            'completed'        => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.position_seconds', 120);

    $this->assertDatabaseHas('lesson_progress', [
        'user_id'          => $student->id,
        'lesson_id'        => $lesson->id,
        'position_seconds' => 120,
    ]);

    expect(\App\Models\LessonProgress::first()->completed_at)->not->toBeNull();
});

test('student cannot create a module', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    enrollStudent($student, $course);

    $this->actingAs($student)
        ->postJson('/api/v1/courses/' . $course->id . '/modules', [
            'title' => 'Hacked module',
        ])
        ->assertForbidden();
});

test('student cannot update or delete modules', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);
    enrollStudent($student, $course);

    $this->actingAs($student)
        ->patchJson('/api/v1/modules/' . $module->id, ['title' => 'Renamed'])
        ->assertForbidden();

    $this->actingAs($student)
        ->deleteJson('/api/v1/modules/' . $module->id)
        ->assertForbidden();
});

test('student cannot create or mutate lessons', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);
    enrollStudent($student, $course);

    $this->actingAs($student)
        ->postJson('/api/v1/modules/' . $module->id . '/lessons', [
            'title' => 'Hacked lesson',
        ])
        ->assertForbidden();

    $lesson = Lesson::create([
        'module_id'    => $module->id,
        'title'        => 'Existing lesson',
        'number'       => 1,
        'sort_order'   => 0,
        'content_type' => 'text',
    ]);

    $this->actingAs($student)
        ->patchJson('/api/v1/lessons/' . $lesson->id, ['title' => 'Renamed'])
        ->assertForbidden();

    $this->actingAs($student)
        ->deleteJson('/api/v1/lessons/' . $lesson->id)
        ->assertForbidden();
});

test('unenrolled student cannot list course modules', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    curriculumModule($course);

    $this->actingAs($student)
        ->getJson('/api/v1/courses/' . $course->id . '/modules')
        ->assertForbidden();
});

test('enrolled student can list course modules', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);
    enrollStudent($student, $course);

    $this->actingAs($student)
        ->getJson('/api/v1/courses/' . $course->id . '/modules')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $module->id);
});

test('teacher who does not own course cannot create modules', function () {
    $owner = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();
    $course = curriculumCourse($owner);

    $this->actingAs($otherTeacher)
        ->postJson('/api/v1/courses/' . $course->id . '/modules', [
            'title' => 'Not allowed',
        ])
        ->assertForbidden();
});

test('enrolled student can update lesson notes', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);
    enrollStudent($student, $course);

    $lesson = Lesson::create([
        'module_id'    => $module->id,
        'title'        => 'Notes lesson',
        'number'       => 1,
        'sort_order'   => 0,
        'content_type' => 'text',
    ]);

    $this->actingAs($student)
        ->patchJson('/api/v1/lessons/' . $lesson->id . '/notes', [
            'notes' => 'Mixed conditionals split time.',
        ])
        ->assertOk()
        ->assertJsonPath('data.notes', 'Mixed conditionals split time.');
});

test('unenrolled student cannot update lesson progress', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();
    $course = curriculumCourse($teacher);
    $module = curriculumModule($course);

    $lesson = Lesson::create([
        'module_id'    => $module->id,
        'title'        => 'Locked lesson',
        'number'       => 1,
        'sort_order'   => 0,
        'content_type' => 'text',
    ]);

    $this->actingAs($student)
        ->postJson('/api/v1/lessons/' . $lesson->id . '/progress', [
            'position_seconds' => 30,
        ])
        ->assertForbidden();
});
