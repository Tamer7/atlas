<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::firstOrCreate(
            ['email' => 'prof.vale@atlas.edu'],
            [
                'name'     => 'Prof. Marcus Vale',
                'password' => Hash::make('password'),
                'color'    => '#5C3A1E',
            ],
        );
        $teacher->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'teacher'])->id
        );

        $sofia = User::firstOrCreate(
            ['email' => 'sofia@atlas.edu'],
            [
                'name'     => 'Sofia Chen',
                'password' => Hash::make('password'),
                'color'    => '#2747E0',
            ],
        );
        $sofia->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'student'])->id
        );

        $amir = User::firstOrCreate(
            ['email' => 'amir@atlas.edu'],
            [
                'name'     => 'Amir Khoury',
                'password' => Hash::make('password'),
                'color'    => '#D97757',
            ],
        );
        $amir->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'student'])->id
        );

        $english = Course::firstOrCreate(
            ['title' => 'English B2 — Conversational Fluency', 'instructor_id' => $teacher->id],
            [
                'tag'            => 'English · B2',
                'category'       => 'Languages',
                'glyph'          => 'E',
                'thumb_gradient' => 'grad-1',
                'description'    => 'Build conversational fluency at B2 level.',
            ],
        );

        $ielts = Course::firstOrCreate(
            ['title' => 'IELTS Writing Intensive', 'instructor_id' => $teacher->id],
            [
                'tag'            => 'Test Prep',
                'category'       => 'Test Prep',
                'glyph'          => '✎',
                'thumb_gradient' => 'grad-3',
                'description'    => 'Intensive IELTS writing preparation.',
            ],
        );

        foreach ([$sofia, $amir] as $student) {
            Enrollment::firstOrCreate(
                ['user_id' => $student->id, 'course_id' => $english->id],
                ['enrolled_at' => now()],
            );
        }

        Enrollment::firstOrCreate(
            ['user_id' => $sofia->id, 'course_id' => $ielts->id],
            ['enrolled_at' => now()],
        );

        $moduleOne = Module::firstOrCreate(
            ['course_id' => $english->id, 'title' => 'Module 1 · Foundations'],
            ['sort_order' => 0],
        );

        $moduleTwo = Module::firstOrCreate(
            ['course_id' => $english->id, 'title' => 'Module 2 · Conversation'],
            ['sort_order' => 1],
        );

        $lessonIntro = Lesson::firstOrCreate(
            ['module_id' => $moduleOne->id, 'number' => 1],
            [
                'title'            => 'Welcome to B2 Fluency',
                'sort_order'       => 0,
                'duration_seconds' => 420,
                'content_type'     => 'text',
                'body'             => '<p>Welcome! This course builds conversational confidence at B2 level through guided practice and real-world scenarios.</p>',
            ],
        );

        $lessonVideo = Lesson::firstOrCreate(
            ['module_id' => $moduleOne->id, 'number' => 2],
            [
                'title'            => 'Tone and pacing in conversation',
                'sort_order'       => 1,
                'duration_seconds' => 760,
                'content_type'     => 'video',
                'video_url'        => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'body'             => '<p>Watch how native speakers vary tone and pacing in everyday dialogue.</p>',
            ],
        );

        $lessonSmallTalk = Lesson::firstOrCreate(
            ['module_id' => $moduleTwo->id, 'number' => 3],
            [
                'title'            => 'Small talk strategies',
                'sort_order'       => 0,
                'duration_seconds' => 540,
                'content_type'     => 'text',
                'body'             => '<p>Learn openers, follow-up questions, and graceful exits for social conversations.</p>',
            ],
        );

        $lessonRolePlay = Lesson::firstOrCreate(
            ['module_id' => $moduleTwo->id, 'number' => 4],
            [
                'title'            => 'Role play: meeting new colleagues',
                'sort_order'       => 1,
                'duration_seconds' => 900,
                'content_type'     => 'video',
                'video_url'        => 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                'body'             => '<p>Practice a workplace introduction scenario with guided prompts.</p>',
            ],
        );

        $quiz = Quiz::firstOrCreate(
            ['course_id' => $english->id, 'title' => 'Module 1 Check-in'],
            [
                'quiz_type'           => 'formative',
                'time_limit_minutes'  => 15,
                'max_attempts'        => 3,
                'shuffle_questions'   => false,
                'show_results'        => true,
                'passing_score'       => 60,
                'show_correct'        => true,
                'show_score'          => true,
                'published_at'        => now(),
                'created_by'          => $teacher->id,
                'lesson_id'           => $lessonVideo->id,
            ],
        );

        $lessonVideo->update(['quiz_id' => $quiz->id]);

        QuizQuestion::firstOrCreate(
            ['quiz_id' => $quiz->id, 'sort_order' => 0],
            [
                'type'   => 'mcq',
                'prompt' => 'Which phrase best opens a casual workplace conversation?',
                'points' => 2,
                'config' => [
                    'options' => [
                        ['id' => 'a', 'text' => 'How was your weekend?'],
                        ['id' => 'b', 'text' => 'State your quarterly KPIs.'],
                        ['id' => 'c', 'text' => 'Why are you late?'],
                    ],
                    'answer' => 'a',
                ],
            ],
        );

        QuizQuestion::firstOrCreate(
            ['quiz_id' => $quiz->id, 'sort_order' => 1],
            [
                'type'   => 'short',
                'prompt' => 'In one sentence, explain why tone matters in B2 conversations.',
                'points' => 5,
                'config' => [],
            ],
        );

        foreach ([$lessonIntro, $lessonVideo, $lessonSmallTalk] as $lesson) {
            LessonProgress::firstOrCreate(
                ['user_id' => $sofia->id, 'lesson_id' => $lesson->id],
                ['completed_at' => now()->subDays(1), 'position_seconds' => $lesson->duration_seconds],
            );
        }

        LessonProgress::firstOrCreate(
            ['user_id' => $sofia->id, 'lesson_id' => $lessonRolePlay->id],
            ['completed_at' => null, 'position_seconds' => 120],
        );

        LessonProgress::firstOrCreate(
            ['user_id' => $amir->id, 'lesson_id' => $lessonIntro->id],
            ['completed_at' => now()->subDays(3), 'position_seconds' => $lessonIntro->duration_seconds],
        );

        QuizAttempt::firstOrCreate(
            [
                'quiz_id' => $quiz->id,
                'user_id' => $sofia->id,
                'status'  => 'graded',
            ],
            [
                'started_at'   => now()->subDays(2),
                'submitted_at' => now()->subDays(2),
                'auto_score'   => 2,
                'manual_score' => 4,
                'total_score'  => 6,
            ],
        );

        QuizAttempt::firstOrCreate(
            [
                'quiz_id' => $quiz->id,
                'user_id' => $amir->id,
                'status'  => 'graded',
            ],
            [
                'started_at'   => now()->subDays(5),
                'submitted_at' => now()->subDays(5),
                'auto_score'   => 0,
                'manual_score' => 2,
                'total_score'  => 2,
            ],
        );
    }
}
