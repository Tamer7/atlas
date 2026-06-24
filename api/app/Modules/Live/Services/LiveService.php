<?php

namespace App\Modules\Live\Services;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\EgressServiceClient;
use Agence104\LiveKit\EncodedOutputs;
use Agence104\LiveKit\VideoGrant;
use App\Models\LiveClass;
use App\Models\User;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Str;
use Livekit\EncodedFileOutput;
use Livekit\S3Upload;

class LiveService
{
    public function __construct(
        private readonly LiveClassRepositoryInterface $repo,
        private readonly EnrollmentRepositoryInterface $enrollmentRepo,
    ) {}

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

    public function generateToken(LiveClass $class, User $user): string
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

        return (new AccessToken(
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
