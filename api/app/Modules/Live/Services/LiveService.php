<?php

namespace App\Modules\Live\Services;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\EgressServiceClient;
use Agence104\LiveKit\EncodedOutputs;
use Agence104\LiveKit\VideoGrant;
use App\Models\LiveClass;
use App\Models\User;
use App\Modules\Course\Models\CourseScheduleSlot;
use App\Modules\Course\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Livekit\EncodedFileOutput;
use Livekit\S3Upload;

class LiveService
{
    public function __construct(
        private readonly LiveClassRepositoryInterface $repo,
        private readonly EnrollmentRepositoryInterface $enrollmentRepo,
        private readonly ScheduleRepositoryInterface $scheduleRepo,
    ) {}

    /**
     * Lazy materialisation entry points: there is no cron or queue worker in
     * this app (QUEUE_CONNECTION=sync), so upcoming schedule-slot occurrences
     * are turned into joinable LiveClass rows on demand, right before we list
     * them. firstOrCreateForSlot() makes repeated calls idempotent.
     */
    public function materialiseUpcomingForUser(User $user): void
    {
        $this->materialiseFromSlots($this->scheduleRepo->listForUser($user));
    }

    public function materialiseUpcomingForCourse(string $courseId): void
    {
        $this->materialiseFromSlots($this->scheduleRepo->listForCourse($courseId));
    }

    /**
     * @param Collection<int, CourseScheduleSlot> $slots each expected to have `course` eager-loaded
     */
    public function materialiseFromSlots(Collection $slots): void
    {
        // Schedule slots carry no timezone of their own, and config('app.timezone')
        // is UTC, so occurrences are computed in the app timezone. Known
        // limitation: this will be wrong once courses/teachers span timezones —
        // a proper fix needs a per-course (or per-user) timezone to convert from.
        $now     = Carbon::now(config('app.timezone'));
        $horizon = $now->copy()->addWeeks(2);

        foreach ($slots as $slot) {
            $course = $slot->course;

            if (! $course) {
                continue;
            }

            foreach ($this->occurrencesFor($slot, $now, $horizon) as $occurrence) {
                $this->repo->firstOrCreateForSlot($slot->id, $occurrence, [
                    'course_id'  => $course->id,
                    'teacher_id' => $course->instructor_id,
                    'title'      => $slot->label ?: $course->title,
                    'room_name'  => 'atlas-' . Str::uuid(),
                    'status'     => 'scheduled',
                ]);
            }
        }
    }

    /**
     * @return list<CarbonInterface>
     */
    private function occurrencesFor(CourseScheduleSlot $slot, CarbonInterface $now, CarbonInterface $horizon): array
    {
        $occurrences  = [];
        $startOfToday = $now->copy()->startOfDay();

        // Scan every day from today through the 2-week horizon (inclusive)
        // and keep the ones matching this slot's weekday.
        for ($i = 0; $i <= 14; $i++) {
            $day = $startOfToday->copy()->addDays($i);

            if ($day->isoWeekday() !== (int) $slot->day_of_week) {
                continue;
            }

            $occurrence = $day->setTimeFromTimeString((string) $slot->start_time);

            // Never backfill an occurrence that has already happened, and
            // never materialise past the 2-week horizon.
            if ($occurrence->lessThanOrEqualTo($now) || $occurrence->greaterThan($horizon)) {
                continue;
            }

            $occurrences[] = $occurrence;
        }

        return $occurrences;
    }

    public function create(array $data, User $teacher): LiveClass
    {
        return $this->repo->create([
            'course_id'    => $data['course_id'],
            'teacher_id'   => $teacher->id,
            'title'        => $data['title'],
            'description'  => $data['description'] ?? null,
            'room_name'    => 'atlas-' . Str::uuid(),
            'status'       => 'scheduled',
            'scheduled_at' => $data['scheduled_at'] ?? null,
        ]);
    }

    public function generateToken(LiveClass $class, User $user): array
    {
        $isTeacher = $user->id === $class->teacher_id;

        if (! $isTeacher && ! $this->enrollmentRepo->isEnrolled($user, $class->course_id)) {
            throw new AuthorizationException('You are not enrolled in this course.');
        }

        $grant = (new VideoGrant())
            ->setRoomJoin()
            ->setRoomName($class->room_name)
            ->setCanPublish()
            ->setCanSubscribe();

        if ($isTeacher) {
            $grant->setRoomAdmin();
        }

        $jwt = (new AccessToken(
            config('services.livekit.api_key'),
            config('services.livekit.api_secret'),
        ))
            ->init(
                (new AccessTokenOptions())
                    ->setIdentity($user->id)
                    ->setName($user->name)
                    ->setTtl(7200)
            )
            ->setGrant($grant)
            ->toJwt();

        return [
            'token' => $jwt,
            'role'  => $isTeacher ? 'teacher' : 'student',
        ];
    }

    public function start(LiveClass $class, User $teacher): LiveClass
    {
        if ($class->teacher_id !== $teacher->id) {
            throw new AuthorizationException('Only the teacher can start this class.');
        }

        $egressId = $this->startEgress($class);

        return $this->repo->update($class, [
            'status'     => 'live',
            'started_at' => now(),
            'egress_id'  => $egressId,
        ]);
    }

    public function end(LiveClass $class, User $teacher): LiveClass
    {
        if ($class->teacher_id !== $teacher->id) {
            throw new AuthorizationException('Only the teacher can end this class.');
        }

        $recordingUrl = $this->stopEgress($class);

        return $this->repo->update($class, [
            'status'        => 'ended',
            'ended_at'      => now(),
            'recording_url' => $recordingUrl,
        ]);
    }

    private function startEgress(LiveClass $class): ?string
    {
        $key    = config('services.livekit.api_key');
        $secret = config('services.livekit.api_secret');
        $host   = config('services.livekit.url');
        $bucket = config('services.livekit.egress_bucket');

        if (! $key || ! $secret || ! $host || ! $bucket) {
            return null;
        }

        try {
            $s3 = new S3Upload([
                'access_key' => config('services.livekit.egress_s3_key', config('filesystems.disks.s3.key')),
                'secret'     => config('services.livekit.egress_s3_secret', config('filesystems.disks.s3.secret')),
                'region'     => config('services.livekit.egress_s3_region', config('filesystems.disks.s3.region', 'us-east-1')),
                'bucket'     => $bucket,
                'endpoint'   => config('services.livekit.egress_s3_endpoint', ''),
            ]);

            $output = new EncodedFileOutput([
                'filepath' => "recordings/{$class->id}.mp4",
                's3'       => $s3,
            ]);

            $client = new EgressServiceClient($host, $key, $secret);
            $info   = $client->startRoomCompositeEgress($class->room_name, 'speaker-dark', $output);

            return $info->getEgressId();
        } catch (\Throwable $e) {
            logger()->error('LiveKit egress start failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function stopEgress(LiveClass $class): ?string
    {
        if (! $class->egress_id) {
            return null;
        }

        $key    = config('services.livekit.api_key');
        $secret = config('services.livekit.api_secret');
        $host   = config('services.livekit.url');

        if (! $key || ! $secret || ! $host) {
            return null;
        }

        try {
            $client = new EgressServiceClient($host, $key, $secret);
            $client->stopEgress($class->egress_id);

            $bucket   = config('services.livekit.egress_bucket');
            $endpoint = config('services.livekit.egress_s3_endpoint');
            $base     = $endpoint
                ? rtrim($endpoint, '/') . '/' . $bucket
                : "https://{$bucket}.s3.amazonaws.com";

            return "{$base}/recordings/{$class->id}.mp4";
        } catch (\Throwable $e) {
            logger()->error('LiveKit egress stop failed', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
