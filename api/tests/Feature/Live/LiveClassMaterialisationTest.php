<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LiveClass;
use App\Models\Role;
use App\Models\User;
use App\Modules\Course\Models\CourseScheduleSlot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);

    // Freeze time so occurrence maths (day_of_week, "next 2 weeks") is
    // deterministic regardless of when the suite actually runs.
    Carbon::setTestNow(Carbon::parse('2026-08-10 12:00:00'));
});

afterEach(function () {
    Carbon::setTestNow();
});

function makeEnrolledPair(): array
{
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create();

    $course = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);

    Enrollment::create([
        'user_id'     => $student->id,
        'course_id'   => $course->id,
        'enrolled_at' => now(),
    ]);

    return [$teacher, $student, $course];
}

test('a weekly schedule slot materialises upcoming live classes the student can see', function () {
    [$teacher, $student, $course] = makeEnrolledPair();

    $slot = CourseScheduleSlot::create([
        'course_id'   => $course->id,
        'day_of_week' => now()->isoWeekday(),
        'start_time'  => '06:00:00', // before the frozen "now" (12:00)
        'end_time'    => '07:00:00',
        'label'       => 'Weekly Conversation Class',
    ]);

    $this->assertDatabaseCount('live_classes', 0);

    $response = $this->actingAs($student)
        ->getJson('/api/v1/student/live-classes')
        ->assertOk();

    // start_time (06:00) is before "now" (12:00), so today's occurrence is
    // already past and only the two occurrences 7 and 14 days out qualify.
    expect(LiveClass::where('schedule_slot_id', $slot->id)->count())->toBe(2);

    $this->assertDatabaseHas('live_classes', [
        'schedule_slot_id' => $slot->id,
        'course_id'        => $course->id,
        'teacher_id'       => $teacher->id,
        'title'            => 'Weekly Conversation Class',
        'status'           => 'scheduled',
    ]);

    $titles = collect($response->json('data'))->pluck('title');
    expect($titles)->toContain('Weekly Conversation Class');
});

test('materialising twice does not duplicate live classes', function () {
    [, $student, $course] = makeEnrolledPair();

    CourseScheduleSlot::create([
        'course_id'   => $course->id,
        'day_of_week' => now()->isoWeekday(),
        'start_time'  => '06:00:00',
        'end_time'    => '07:00:00',
        'label'       => 'Weekly Class',
    ]);

    $this->actingAs($student)->getJson('/api/v1/student/live-classes')->assertOk();
    $firstCount = LiveClass::count();

    $this->actingAs($student)->getJson('/api/v1/student/live-classes')->assertOk();
    $secondCount = LiveClass::count();

    expect($firstCount)->toBe(2);
    expect($secondCount)->toBe($firstCount);
});

test('an occurrence already in the past today is not materialised', function () {
    [, $student, $course] = makeEnrolledPair();

    $slot = CourseScheduleSlot::create([
        'course_id'   => $course->id,
        'day_of_week' => now()->isoWeekday(),
        'start_time'  => '06:00:00', // earlier than frozen "now" (12:00)
        'end_time'    => '07:00:00',
    ]);

    $this->actingAs($student)->getJson('/api/v1/student/live-classes')->assertOk();

    $todayOccurrence = now()->copy()->setTime(6, 0, 0);

    $this->assertDatabaseMissing('live_classes', [
        'schedule_slot_id' => $slot->id,
        'scheduled_at'     => $todayOccurrence->toDateTimeString(),
    ]);

    $rows = LiveClass::where('schedule_slot_id', $slot->id)->get();
    expect($rows)->not->toBeEmpty();
    expect($rows->every(fn (LiveClass $class) => $class->scheduled_at->greaterThan(now())))->toBeTrue();
});

test('deleting a schedule slot leaves its materialised live classes intact with the slot reference nulled', function () {
    [, $student, $course] = makeEnrolledPair();

    $slot = CourseScheduleSlot::create([
        'course_id'   => $course->id,
        'day_of_week' => now()->isoWeekday(),
        'start_time'  => '06:00:00',
        'end_time'    => '07:00:00',
    ]);

    $this->actingAs($student)->getJson('/api/v1/student/live-classes')->assertOk();

    $classIds = LiveClass::where('schedule_slot_id', $slot->id)->pluck('id');
    expect($classIds)->not->toBeEmpty();

    $slot->delete();

    foreach ($classIds as $id) {
        $this->assertDatabaseHas('live_classes', [
            'id'               => $id,
            'schedule_slot_id' => null,
        ]);
    }
});

test('ad-hoc live classes with no schedule slot are unaffected by materialisation', function () {
    [$teacher, $student, $course] = makeEnrolledPair();

    $adhoc = LiveClass::create([
        'course_id'    => $course->id,
        'teacher_id'   => $teacher->id,
        'title'        => 'One-off Q&A',
        'room_name'    => 'atlas-' . Str::uuid(),
        'status'       => 'scheduled',
        'scheduled_at' => now()->addDay(),
    ]);

    // No schedule slot exists for this course, so materialisation has
    // nothing to do — the ad-hoc class must still show up unmodified.
    $this->actingAs($student)
        ->getJson('/api/v1/student/live-classes')
        ->assertOk()
        ->assertJsonFragment(['id' => $adhoc->id]);

    $this->assertDatabaseHas('live_classes', [
        'id'               => $adhoc->id,
        'schedule_slot_id' => null,
    ]);

    expect(LiveClass::count())->toBe(1);
});
