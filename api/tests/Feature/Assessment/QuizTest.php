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

test('teacher can create quiz and student can attempt with auto-grade and manual grading queue', function () {
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

    $createResponse = $this->actingAs($teacher)
        ->postJson('/api/v1/courses/' . $course->id . '/quizzes', [
            'title'   => 'Module 3 Quiz',
            'publish' => true,
            'questions' => [
                [
                    'type'   => 'mcq',
                    'prompt' => 'What is 2 + 2?',
                    'points' => 2,
                    'config' => [
                        'options' => [
                            ['id' => 'a', 'text' => '4'],
                            ['id' => 'b', 'text' => '5'],
                        ],
                        'answer' => 'a',
                    ],
                ],
                [
                    'type'   => 'short',
                    'prompt' => 'Explain photosynthesis briefly.',
                    'points' => 5,
                    'config' => [],
                ],
            ],
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Module 3 Quiz');

    $quizId = $createResponse->json('data.id');

    $startResponse = $this->actingAs($student)
        ->postJson('/api/v1/quizzes/' . $quizId . '/start')
        ->assertCreated();

    $attemptId = $startResponse->json('data.id');
    $answers = $startResponse->json('data.answers');

    $mcqQuestionId = collect($answers)->first(fn ($a) => $a['question']['type'] === 'mcq')['question_id'];
    $shortQuestionId = collect($answers)->first(fn ($a) => $a['question']['type'] === 'short')['question_id'];

    $this->actingAs($student)
        ->patchJson('/api/v1/attempts/' . $attemptId . '/answers', [
            'answers' => [
                [
                    'question_id' => $mcqQuestionId,
                    'answer'      => ['selected' => 'a'],
                ],
                [
                    'question_id' => $shortQuestionId,
                    'answer'      => ['text' => 'Plants convert sunlight into energy.'],
                ],
            ],
        ])
        ->assertOk();

    $submitResponse = $this->actingAs($student)
        ->postJson('/api/v1/attempts/' . $attemptId . '/submit')
        ->assertOk()
        ->assertJsonPath('data.status', 'submitted')
        ->assertJsonPath('data.auto_score', 2);

    expect($submitResponse->json('data.total_score'))->toBeNull();

    $this->assertDatabaseHas('quiz_answers', [
        'attempt_id'  => $attemptId,
        'question_id' => $mcqQuestionId,
        'auto_score'  => 2,
    ]);

    $gradingResponse = $this->actingAs($teacher)
        ->getJson('/api/v1/teacher/grading')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.attempt_id', $attemptId)
        ->assertJsonPath('data.0.pending_count', 1);

    $pendingAnswerId = $gradingResponse->json('data.0.answers.0.id');

    $this->actingAs($teacher)
        ->patchJson('/api/v1/teacher/grading/' . $attemptId . '/answers/' . $pendingAnswerId, [
            'score'    => 4,
            'feedback' => 'Good explanation.',
        ])
        ->assertOk();

    $this->actingAs($teacher)
        ->postJson('/api/v1/teacher/grading/' . $attemptId . '/complete', [
            'overall_feedback' => 'Well done overall.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'graded')
        ->assertJsonPath('data.total_score', 6);

    $this->actingAs($student)
        ->getJson('/api/v1/attempts/' . $attemptId . '/results')
        ->assertOk()
        ->assertJsonPath('data.total_score', 6);
});

test('student quiz detail hides answers', function () {
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

    $quizResponse = $this->actingAs($teacher)
        ->postJson('/api/v1/courses/' . $course->id . '/quizzes', [
            'title'   => 'Hidden Answers Quiz',
            'publish' => true,
            'questions' => [
                [
                    'type'   => 'mcq',
                    'prompt' => 'Pick one',
                    'points' => 1,
                    'config' => [
                        'options' => [
                            ['id' => 'a', 'text' => 'Correct'],
                            ['id' => 'b', 'text' => 'Wrong'],
                        ],
                        'answer' => 'a',
                    ],
                ],
            ],
        ])
        ->assertCreated();

    $quizId = $quizResponse->json('data.id');

    $this->actingAs($student)
        ->getJson('/api/v1/quizzes/' . $quizId)
        ->assertOk()
        ->assertJsonMissingPath('data.questions.0.config.answer');
});

test('starting a quiz twice returns the same in-progress attempt', function () {
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

    $quizId = $this->actingAs($teacher)
        ->postJson('/api/v1/courses/' . $course->id . '/quizzes', [
            'title'     => 'Resume Quiz',
            'publish'   => true,
            'questions' => [
                [
                    'type'   => 'mcq',
                    'prompt' => 'Pick one',
                    'points' => 1,
                    'config' => [
                        'options' => [
                            ['id' => 'a', 'text' => 'Correct'],
                            ['id' => 'b', 'text' => 'Wrong'],
                        ],
                        'answer' => 'a',
                    ],
                ],
            ],
        ])
        ->assertCreated()
        ->json('data.id');

    $firstId = $this->actingAs($student)
        ->postJson('/api/v1/quizzes/' . $quizId . '/start')
        ->assertCreated()
        ->json('data.id');

    $secondId = $this->actingAs($student)
        ->postJson('/api/v1/quizzes/' . $quizId . '/start')
        ->assertCreated()
        ->json('data.id');

    expect($secondId)->toBe($firstId);

    $this->assertDatabaseCount('quiz_attempts', 1);
});
