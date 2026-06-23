<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\QuizQuestion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
});

test('student cannot access teacher dashboard', function () {
    $student = User::factory()->create();

    $this->actingAs($student)
        ->getJson('/api/v1/teacher/dashboard')
        ->assertForbidden();
});

test('teacher dashboard returns real stats and grading queue', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->create(['email' => 'sofia@example.com']);
    $atRiskStudent = User::factory()->create(['email' => 'amir@example.com']);

    $course = Course::create([
        'title'          => 'English B2',
        'tag'            => 'English · B2',
        'category'       => 'Languages',
        'instructor_id'  => $teacher->id,
        'thumb_gradient' => 'grad-1',
        'glyph'          => 'E',
    ]);

    foreach ([$student, $atRiskStudent] as $enrollee) {
        Enrollment::create([
            'user_id'     => $enrollee->id,
            'course_id'   => $course->id,
            'enrolled_at' => now(),
        ]);
    }

    $module = Module::create([
        'course_id'  => $course->id,
        'title'      => 'Module 1',
        'sort_order' => 0,
    ]);

    $lessonOne = Lesson::create([
        'module_id'        => $module->id,
        'title'            => 'Intro',
        'number'           => 1,
        'sort_order'       => 0,
        'duration_seconds' => 300,
        'content_type'     => 'text',
    ]);

    $lessonTwo = Lesson::create([
        'module_id'        => $module->id,
        'title'            => 'Practice',
        'number'           => 2,
        'sort_order'       => 1,
        'duration_seconds' => 600,
        'content_type'     => 'video',
    ]);

    LessonProgress::create([
        'user_id'          => $student->id,
        'lesson_id'        => $lessonOne->id,
        'completed_at'     => now(),
        'position_seconds' => 300,
    ]);

    LessonProgress::create([
        'user_id'          => $student->id,
        'lesson_id'        => $lessonTwo->id,
        'completed_at'     => now(),
        'position_seconds' => 600,
    ]);

    $quiz = Quiz::create([
        'course_id'      => $course->id,
        'title'          => 'Check-in Quiz',
        'passing_score'  => 60,
        'published_at'   => now(),
        'created_by'     => $teacher->id,
    ]);

    $shortQuestion = QuizQuestion::create([
        'quiz_id'    => $quiz->id,
        'type'       => 'short',
        'prompt'     => 'Explain tone.',
        'points'     => 5,
        'config'     => [],
        'sort_order' => 0,
    ]);

    QuizAttempt::create([
        'quiz_id'      => $quiz->id,
        'user_id'      => $student->id,
        'status'       => 'graded',
        'started_at'   => now()->subDay(),
        'submitted_at' => now()->subDay(),
        'auto_score'   => 0,
        'manual_score' => 4,
        'total_score'  => 4,
    ]);

    $pendingAttempt = QuizAttempt::create([
        'quiz_id'      => $quiz->id,
        'user_id'      => $atRiskStudent->id,
        'status'       => 'submitted',
        'started_at'   => now()->subDay(),
        'submitted_at' => now()->subHour(),
        'auto_score'   => 0,
    ]);

    QuizAnswer::create([
        'attempt_id'  => $pendingAttempt->id,
        'question_id' => $shortQuestion->id,
        'answer'      => ['text' => 'Tone helps convey intent.'],
    ]);

    $this->actingAs($teacher)
        ->getJson('/api/v1/teacher/dashboard')
        ->assertOk()
        ->assertJsonPath('data.stats.active_students', 2)
        ->assertJsonPath('data.stats.courses_count', 1)
        ->assertJsonPath('data.stats.awaiting_grading', 1)
        ->assertJsonPath('data.stats.avg_class_score', 4)
        ->assertJsonPath('data.stats.at_risk_students', 2)
        ->assertJsonCount(1, 'data.grading_queue')
        ->assertJsonPath('data.grading_queue.0.student.id', $atRiskStudent->id);
});

test('teacher reports returns per-course aggregates', function () {
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

    $module = Module::create([
        'course_id'  => $course->id,
        'title'      => 'Module 1',
        'sort_order' => 0,
    ]);

    $lesson = Lesson::create([
        'module_id'        => $module->id,
        'title'            => 'Intro',
        'number'           => 1,
        'sort_order'       => 0,
        'duration_seconds' => 300,
        'content_type'     => 'text',
    ]);

    LessonProgress::create([
        'user_id'          => $student->id,
        'lesson_id'        => $lesson->id,
        'completed_at'     => now(),
        'position_seconds' => 300,
    ]);

    $quiz = Quiz::create([
        'course_id'     => $course->id,
        'title'         => 'Quiz 1',
        'passing_score' => 60,
        'published_at'  => now(),
        'created_by'    => $teacher->id,
    ]);

    QuizAttempt::create([
        'quiz_id'      => $quiz->id,
        'user_id'      => $student->id,
        'status'       => 'graded',
        'started_at'   => now(),
        'submitted_at' => now(),
        'total_score'  => 80,
    ]);

    $this->actingAs($teacher)
        ->getJson('/api/v1/teacher/reports')
        ->assertOk()
        ->assertJsonPath('data.summary.total_students', 1)
        ->assertJsonPath('data.summary.avg_score', 80)
        ->assertJsonPath('data.summary.avg_attendance', 100)
        ->assertJsonCount(1, 'data.courses')
        ->assertJsonPath('data.courses.0.students_count', 1)
        ->assertJsonPath('data.courses.0.avg_score', 80)
        ->assertJsonPath('data.courses.0.completion_pct', 100)
        ->assertJsonPath('data.courses.0.quiz_count', 1);
});
