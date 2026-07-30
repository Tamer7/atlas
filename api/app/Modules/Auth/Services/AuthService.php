<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use App\Modules\Auth\Mail\MagicLinkMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function login(array $credentials): User
    {
        if (! Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            throw new AuthenticationException('Invalid credentials.');
        }

        $user = Auth::user();

        if (! $user->isActive()) {
            Auth::guard('web')->logout();

            throw new AuthenticationException('Invalid credentials.');
        }

        $this->regenerateSessionIfAvailable(request());

        return $user;
    }

    public function register(array $data): User
    {
        $user = $this->userRepository->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'color'    => $this->randomColor(),
        ]);

        $this->userRepository->assignRole($user, 'student');

        Auth::login($user);
        $this->regenerateSessionIfAvailable(request());

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    public function sendMagicLink(string $email): void
    {
        $token = $this->userRepository->createMagicLinkToken($email);
        Mail::to($email)->send(new MagicLinkMail($email, $token));
    }

    public function verifyMagicLink(string $token): User
    {
        $user = $this->userRepository->findByMagicLinkToken($token);

        // Same generic exception + message for "no such token" and "token
        // valid but the account is deactivated", mirroring login()'s
        // deliberate reuse of one message for both its failure branches:
        // distinguishing the two here would leak account-existence/status
        // to whoever holds (or guesses) a token, and the session must never
        // be established for a deactivated account in the first place.
        if (! $user || ! $user->isActive()) {
            throw new \InvalidArgumentException('Invalid or expired sign-in link.');
        }

        Auth::login($user);
        $this->regenerateSessionIfAvailable(request());

        return $user;
    }

    private function regenerateSessionIfAvailable(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }

    private function randomColor(): string
    {
        $colors = ['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E'];
        return $colors[array_rand($colors)];
    }
}
