<?php

namespace App\Modules\Enrollment\Services;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Enrollment\Mail\InvitationMail;
use App\Modules\Enrollment\Models\Invitation;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationService
{
    public function __construct(
        private readonly InvitationRepositoryInterface $invitationRepository,
        private readonly UserRepositoryInterface $userRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function invite(User $teacher, string $email, array $courseIds): void
    {
        $rawToken = Str::random(64);

        $invitation = $this->invitationRepository->create([
            'email'      => $email,
            'invited_by' => $teacher->id,
            'token'      => hash('sha256', $rawToken),
            'course_ids' => $courseIds,
            'expires_at' => now()->addDays(7),
        ]);

        Mail::queue(new InvitationMail($invitation, $rawToken));
    }

    public function accept(string $rawToken): User
    {
        $invitation = $this->invitationRepository->findByToken($rawToken);

        if (! $invitation) {
            throw new \InvalidArgumentException('Invalid or expired invitation.');
        }

        $user = $this->userRepository->findByEmail($invitation->email);

        if (! $user) {
            $user = $this->userRepository->create([
                'name'     => explode('@', $invitation->email)[0],
                'email'    => $invitation->email,
                'password' => Hash::make(Str::random(32)),
                'color'    => $this->randomColor(),
            ]);
        }

        $this->userRepository->assignRole($user, 'student');

        foreach ($invitation->course_ids as $courseId) {
            $this->enrollmentRepository->enroll($user, $courseId);
        }

        $invitation->update(['accepted_at' => now()]);

        Auth::login($user);

        if (request()->hasSession()) {
            request()->session()->regenerate();
        }

        return $user;
    }

    private function randomColor(): string
    {
        $colors = ['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E'];
        return $colors[array_rand($colors)];
    }
}
