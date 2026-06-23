<?php

namespace App\Modules\Analytics\Repositories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Modules\Analytics\Support\StudentStatus;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    public function __construct(
        private readonly AttemptRepositoryInterface $attemptRepository,
    ) {}

    public function dashboardStats(User $teacher): array
    {
        $courseIds = $this->courseIdsForTeacher($teacher);
        $students = $this->distinctStudents($courseIds);
        $gradingQueue = $this->attemptRepository->gradingQueueForTeacher($teacher);

        $avgScore = $this->averageGradedScore($courseIds);
        $atRiskCount = $this->countAtRiskStudents($teacher, $courseIds);

        return [
            'active_students'          => $students->count(),
            'courses_count'            => count($courseIds),
            'awaiting_grading'         => $gradingQueue->count(),
            'avg_class_score'          => $avgScore,
            'avg_class_score_change'   => null,
            'at_risk_students'         => $atRiskCount,
            'grading_queue'            => $gradingQueue,
        ];
    }

    public function reports(User $teacher): array
    {
        $courses = Course::where('instructor_id', $teacher->id)
            ->orderBy('title')
            ->get();

        $courseReports = $courses->map(fn (Course $course) => $this->courseReport($course));
        $courseIds = $courses->pluck('id')->all();
        $students = $this->distinctStudents($courseIds);

        $avgScore = $courseReports->avg('avg_score') ?? 0;
        $avgAttendance = $courseReports->avg('avg_attendance') ?? 0;
        $atRiskStudents = $this->countAtRiskStudents($teacher, $courseIds);

        return [
            'summary' => [
                'total_students'   => $students->count(),
                'avg_score'        => round($avgScore, 1),
                'avg_attendance'   => round($avgAttendance, 1),
                'at_risk_students' => $atRiskStudents,
            ],
            'courses' => $courseReports->values()->all(),
        ];
    }

    public function enrichStudentsWithMetrics(Collection $students, User $teacher, ?string $courseId = null): Collection
    {
        if ($students->isEmpty()) {
            return $students;
        }

        $courseIds = $courseId
            ? [$courseId]
            : $this->courseIdsForTeacher($teacher);

        if ($courseIds === []) {
            return $students;
        }

        $studentIds = $students->pluck('id')->all();
        $lessonTotals = $this->lessonCountsByCourse($courseIds);
        $totalLessons = array_sum($lessonTotals);
        $completedByUser = $this->completedLessonsByUser($studentIds, $courseIds);
        $avgScoresByUser = $this->avgScoresByUser($studentIds, $courseIds);
        $lastActiveByUser = $this->lastActiveByUser($studentIds, $courseIds);
        $coursesCountByUser = $this->coursesCountByUser($studentIds, $courseIds);
        $passingScore = $this->defaultPassingScore($courseIds);

        return $students->each(function (User $student) use (
            $totalLessons,
            $completedByUser,
            $avgScoresByUser,
            $lastActiveByUser,
            $coursesCountByUser,
            $passingScore,
        ) {
            $completed = $completedByUser[$student->id] ?? 0;
            $completionPct = $totalLessons > 0
                ? round(($completed / $totalLessons) * 100, 1)
                : 0.0;
            $avgScore = round($avgScoresByUser[$student->id] ?? 0, 1);

            $student->teacherCoursesCount = $coursesCountByUser[$student->id] ?? 0;
            $student->attendancePct = $completionPct;
            $student->avgScore = $avgScore;
            $student->studentStatus = StudentStatus::determine($avgScore, $completionPct, $passingScore);
            $student->lastActiveAt = $lastActiveByUser[$student->id] ?? null;
        });
    }

    /** @return array<string, mixed> */
    private function courseReport(Course $course): array
    {
        $enrolledIds = Enrollment::where('course_id', $course->id)->pluck('user_id')->all();
        $totalLessons = Lesson::whereHas('module', fn ($q) => $q->where('course_id', $course->id))->count();
        $quizCount = Quiz::where('course_id', $course->id)->count();
        $passingScore = Quiz::where('course_id', $course->id)->value('passing_score')
            ?? StudentStatus::DEFAULT_PASSING_SCORE;

        $avgScore = 0.0;
        $avgAttendance = 0.0;
        $completionPct = 0.0;
        $atRiskCount = 0;

        if ($enrolledIds !== []) {
            $avgScore = round(
                (float) QuizAttempt::where('status', 'graded')
                    ->whereIn('user_id', $enrolledIds)
                    ->whereHas('quiz', fn ($q) => $q->where('course_id', $course->id))
                    ->avg('total_score'),
                1,
            );

            if ($totalLessons > 0) {
                $completedCounts = LessonProgress::whereIn('user_id', $enrolledIds)
                    ->whereNotNull('completed_at')
                    ->whereHas('lesson.module', fn ($q) => $q->where('course_id', $course->id))
                    ->select('user_id', DB::raw('count(*) as completed'))
                    ->groupBy('user_id')
                    ->pluck('completed', 'user_id');

                $attendanceValues = collect($enrolledIds)->map(function ($userId) use ($completedCounts, $totalLessons) {
                    $completed = $completedCounts[$userId] ?? 0;

                    return round(($completed / $totalLessons) * 100, 1);
                });

                $avgAttendance = round($attendanceValues->avg() ?? 0, 1);
                $completionPct = $avgAttendance;

                $scoresByUser = QuizAttempt::where('status', 'graded')
                    ->whereIn('user_id', $enrolledIds)
                    ->whereHas('quiz', fn ($q) => $q->where('course_id', $course->id))
                    ->select('user_id', DB::raw('avg(total_score) as avg_score'))
                    ->groupBy('user_id')
                    ->pluck('avg_score', 'user_id');

                $atRiskCount = collect($enrolledIds)->filter(function ($userId) use (
                    $completedCounts,
                    $scoresByUser,
                    $totalLessons,
                    $passingScore,
                ) {
                    $completion = $totalLessons > 0
                        ? round((($completedCounts[$userId] ?? 0) / $totalLessons) * 100, 1)
                        : 0.0;
                    $score = round((float) ($scoresByUser[$userId] ?? 0), 1);

                    return StudentStatus::isAtRisk($score, $completion, (int) $passingScore);
                })->count();
            }
        }

        return [
            'id'              => $course->id,
            'title'           => $course->title,
            'students_count'  => count($enrolledIds),
            'avg_score'       => $avgScore,
            'avg_attendance'  => $avgAttendance,
            'completion_pct'  => $completionPct,
            'at_risk_count'   => $atRiskCount,
            'quiz_count'      => $quizCount,
        ];
    }

    /** @return list<string> */
    private function courseIdsForTeacher(User $teacher): array
    {
        return Course::where('instructor_id', $teacher->id)->pluck('id')->all();
    }

    /** @param list<string> $courseIds */
    private function distinctStudents(array $courseIds): Collection
    {
        if ($courseIds === []) {
            return collect();
        }

        return User::whereHas('enrollments', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->distinct()
            ->get();
    }

    /** @param list<string> $courseIds */
    private function averageGradedScore(array $courseIds): float
    {
        if ($courseIds === []) {
            return 0.0;
        }

        return round(
            (float) QuizAttempt::where('status', 'graded')
                ->whereHas('quiz', fn ($q) => $q->whereIn('course_id', $courseIds))
                ->avg('total_score'),
            1,
        );
    }

    /** @param list<string> $courseIds */
    private function countAtRiskStudents(User $teacher, array $courseIds): int
    {
        $students = $this->distinctStudents($courseIds);

        if ($students->isEmpty()) {
            return 0;
        }

        $enriched = $this->enrichStudentsWithMetrics($students, $teacher);

        return $enriched->filter(fn (User $student) => $student->studentStatus === 'at_risk')->count();
    }

    /** @param list<string> $courseIds */
    private function lessonCountsByCourse(array $courseIds): array
    {
        return Lesson::whereHas('module', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->join('modules', 'lessons.module_id', '=', 'modules.id')
            ->select('modules.course_id', DB::raw('count(*) as total'))
            ->groupBy('modules.course_id')
            ->pluck('total', 'course_id')
            ->all();
    }

    /** @param list<string> $studentIds @param list<string> $courseIds */
    private function completedLessonsByUser(array $studentIds, array $courseIds): array
    {
        if ($studentIds === [] || $courseIds === []) {
            return [];
        }

        return LessonProgress::whereIn('user_id', $studentIds)
            ->whereNotNull('completed_at')
            ->whereHas('lesson.module', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->select('user_id', DB::raw('count(*) as completed'))
            ->groupBy('user_id')
            ->pluck('completed', 'user_id')
            ->all();
    }

    /** @param list<string> $studentIds @param list<string> $courseIds */
    private function avgScoresByUser(array $studentIds, array $courseIds): array
    {
        if ($studentIds === [] || $courseIds === []) {
            return [];
        }

        return QuizAttempt::where('status', 'graded')
            ->whereIn('user_id', $studentIds)
            ->whereHas('quiz', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->select('user_id', DB::raw('avg(total_score) as avg_score'))
            ->groupBy('user_id')
            ->pluck('avg_score', 'user_id')
            ->map(fn ($score) => (float) $score)
            ->all();
    }

    /** @param list<string> $studentIds @param list<string> $courseIds */
    private function lastActiveByUser(array $studentIds, array $courseIds): array
    {
        if ($studentIds === [] || $courseIds === []) {
            return [];
        }

        $lessonActivity = LessonProgress::whereIn('user_id', $studentIds)
            ->whereHas('lesson.module', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->select('user_id', DB::raw('max(updated_at) as last_active'))
            ->groupBy('user_id')
            ->pluck('last_active', 'user_id');

        $quizActivity = QuizAttempt::whereIn('user_id', $studentIds)
            ->whereHas('quiz', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->select('user_id', DB::raw('max(updated_at) as last_active'))
            ->groupBy('user_id')
            ->pluck('last_active', 'user_id');

        $combined = [];

        foreach ($studentIds as $userId) {
            $candidates = array_filter([
                $lessonActivity[$userId] ?? null,
                $quizActivity[$userId] ?? null,
            ]);

            if ($candidates !== []) {
                $combined[$userId] = collect($candidates)->max();
            }
        }

        return $combined;
    }

    /** @param list<string> $studentIds @param list<string> $courseIds */
    private function coursesCountByUser(array $studentIds, array $courseIds): array
    {
        if ($studentIds === [] || $courseIds === []) {
            return [];
        }

        return Enrollment::whereIn('user_id', $studentIds)
            ->whereIn('course_id', $courseIds)
            ->select('user_id', DB::raw('count(*) as total'))
            ->groupBy('user_id')
            ->pluck('total', 'user_id')
            ->all();
    }

    /** @param list<string> $courseIds */
    private function defaultPassingScore(array $courseIds): int
    {
        $score = Quiz::whereIn('course_id', $courseIds)->value('passing_score');

        return $score !== null ? (int) $score : StudentStatus::DEFAULT_PASSING_SCORE;
    }
}
