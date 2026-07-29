<?php

namespace App\Modules\Profile\Services;

use App\Models\User;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Modules\Profile\Models\StudentComment;
use App\Modules\Profile\Repositories\Contracts\StudentCommentRepositoryInterface;
use App\Modules\Profile\Repositories\Contracts\StudentRecordRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class StudentCommentService
{
    public function __construct(
        private readonly StudentCommentRepositoryInterface $comments,
        private readonly StudentRecordRepositoryInterface $records,
        private readonly CourseRepositoryInterface $courseRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listForStudent(User $teacher, string $studentId): Collection
    {
        $student = $this->findStudentOrFail($studentId);
        $this->assertTeachesStudent($teacher, $student);

        return $this->comments->listForStudent($student->id);
    }

    public function create(User $teacher, string $studentId, array $data): StudentComment
    {
        $student = $this->findStudentOrFail($studentId);
        $this->assertTeachesStudent($teacher, $student);

        if (! empty($data['course_id'])) {
            $this->assertOwnsCourseWithStudent($teacher, $student, $data['course_id']);
        }

        return $this->comments->create([
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'course_id'  => $data['course_id'] ?? null,
            'body'       => $data['body'],
        ]);
    }

    public function update(User $teacher, string $commentId, array $data): StudentComment
    {
        $comment = $this->findCommentOrFail($commentId);
        $this->assertIsAuthor($teacher, $comment);

        return $this->comments->update($comment, ['body' => $data['body']]);
    }

    public function delete(User $teacher, string $commentId): void
    {
        $comment = $this->findCommentOrFail($commentId);
        $this->assertIsAuthor($teacher, $comment);

        $this->comments->delete($comment);
    }

    private function findStudentOrFail(string $studentId): User
    {
        $student = $this->records->findStudent($studentId);

        if (! $student) {
            throw new ModelNotFoundException('Student not found.');
        }

        return $student;
    }

    private function findCommentOrFail(string $commentId): StudentComment
    {
        $comment = $this->comments->find($commentId);

        if (! $comment) {
            throw new ModelNotFoundException('Comment not found.');
        }

        return $comment;
    }

    private function assertTeachesStudent(User $teacher, User $student): void
    {
        $courseIds = $this->courseRepository->listForUser($teacher)->pluck('id')->all();

        if ($courseIds === []
            || $this->enrollmentRepository->coursesCountForUserInCourses($student, $courseIds) === 0) {
            throw new AuthorizationException('This student is not enrolled in any of your courses.');
        }
    }

    private function assertOwnsCourseWithStudent(User $teacher, User $student, string $courseId): void
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course || $course->instructor_id !== $teacher->id) {
            throw new AuthorizationException('You do not have access to this course.');
        }

        if (! $this->enrollmentRepository->isEnrolled($student, $course->id)) {
            throw new AuthorizationException('This student is not enrolled in that course.');
        }
    }

    private function assertIsAuthor(User $teacher, StudentComment $comment): void
    {
        if ($comment->teacher_id !== $teacher->id) {
            throw new AuthorizationException('You can only modify your own comments.');
        }
    }
}
