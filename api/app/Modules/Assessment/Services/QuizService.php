<?php

namespace App\Modules\Assessment\Services;

use App\Models\Course;
use App\Models\Quiz;
use App\Models\User;
use App\Modules\Assessment\Repositories\Contracts\QuizRepositoryInterface;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class QuizService
{
    public function __construct(
        private readonly QuizRepositoryInterface $quizRepository,
        private readonly CourseRepositoryInterface $courseRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listForCourse(User $user, string $courseId): Collection
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertCanViewCourse($user, $course);

        $quizzes = $this->quizRepository->listForCourse($courseId);

        if (! ($user->hasRole('teacher') && $course->instructor_id === $user->id)) {
            return $quizzes->filter(fn (Quiz $quiz) => $quiz->isPublished())->values();
        }

        return $quizzes;
    }

    public function listForTeacher(User $teacher): Collection
    {
        if (! $teacher->hasRole('teacher')) {
            throw new AuthorizationException('Only teachers can list all quizzes.');
        }

        return $this->quizRepository->listForTeacher($teacher->id);
    }

    public function show(User $user, string $quizId): Quiz
    {
        $quiz = $this->quizRepository->find($quizId);

        if (! $quiz) {
            throw new ModelNotFoundException('Quiz not found.');
        }

        $this->assertCanViewCourse($user, $quiz->course);

        if ($user->hasRole('student') && ! $quiz->isPublished()) {
            throw new AuthorizationException('This quiz is not available.');
        }

        return $quiz;
    }

    public function create(User $teacher, string $courseId, array $data): Quiz
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertIsInstructor($teacher, $course);

        $questions = $data['questions'] ?? [];
        unset($data['questions']);

        $quiz = $this->quizRepository->create([
            'course_id'           => $courseId,
            'lesson_id'           => $data['lesson_id'] ?? null,
            'title'               => $data['title'],
            'quiz_type'           => $data['quiz_type'] ?? 'graded',
            'time_limit_minutes'  => $data['time_limit_minutes'] ?? null,
            'max_attempts'        => $data['max_attempts'] ?? 1,
            'shuffle_questions'   => $data['shuffle_questions'] ?? false,
            'show_results'        => $data['show_results'] ?? 'after',
            'passing_score'       => $data['passing_score'] ?? 60,
            'show_correct'        => $data['show_correct'] ?? true,
            'show_score'          => $data['show_score'] ?? true,
            'published_at'        => ! empty($data['publish']) ? now() : null,
            'created_by'          => $teacher->id,
        ], $questions);

        if (! empty($data['publish']) && $quiz->published_at === null) {
            return $this->quizRepository->publish($quiz);
        }

        return $quiz;
    }

    public function update(User $teacher, string $quizId, array $data): Quiz
    {
        $quiz = $this->quizRepository->find($quizId);

        if (! $quiz) {
            throw new ModelNotFoundException('Quiz not found.');
        }

        $this->assertIsInstructor($teacher, $quiz->course);

        $questions = $data['questions'] ?? null;
        $publish = ! empty($data['publish']);
        unset($data['questions'], $data['publish']);

        if ($data !== [] || $questions !== null) {
            $quiz = $this->quizRepository->update($quiz, $data, $questions);
        }

        if ($publish) {
            return $this->publish($teacher, $quizId);
        }

        return $quiz;
    }

    public function publish(User $teacher, string $quizId): Quiz
    {
        $quiz = $this->quizRepository->find($quizId);

        if (! $quiz) {
            throw new ModelNotFoundException('Quiz not found.');
        }

        $this->assertIsInstructor($teacher, $quiz->course);

        if ($quiz->questions->isEmpty()) {
            throw new \InvalidArgumentException('Cannot publish a quiz without questions.');
        }

        return $this->quizRepository->publish($quiz);
    }

    public function delete(User $teacher, string $quizId): void
    {
        $quiz = $this->quizRepository->find($quizId);

        if (! $quiz) {
            throw new ModelNotFoundException('Quiz not found.');
        }

        $this->assertIsInstructor($teacher, $quiz->course);

        $this->quizRepository->delete($quiz);
    }

    public function canSeeAnswers(User $user, Quiz $quiz): bool
    {
        return $user->hasRole('teacher') && $quiz->course->instructor_id === $user->id;
    }

    private function findCourseOrFail(string $courseId): Course
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course) {
            throw new ModelNotFoundException('Course not found.');
        }

        return $course;
    }

    private function assertCanViewCourse(User $user, Course $course): void
    {
        if ($user->hasRole('teacher') && $course->instructor_id === $user->id) {
            return;
        }

        if ($this->enrollmentRepository->isEnrolled($user, $course->id)) {
            return;
        }

        throw new AuthorizationException('You do not have access to this course.');
    }

    private function assertIsInstructor(User $teacher, Course $course): void
    {
        if ($course->instructor_id !== $teacher->id) {
            throw new AuthorizationException('You do not have access to this course.');
        }
    }
}
