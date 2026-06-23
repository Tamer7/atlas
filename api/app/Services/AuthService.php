<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function login(array $credentials): User
    {
        if (!Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            throw new AuthenticationException('Invalid credentials.');
        }

        request()->session()->regenerate();

        return Auth::user();
    }

    public function register(array $data): User
    {
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'roles' => ['student'],
            'color' => $this->randomColor(),
        ]);

        Auth::login($user);
        request()->session()->regenerate();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    public function sendMagicLink(string $email): void
    {
        $token = $this->userRepository->createMagicLinkToken($email);
        // Phase 1: log only — email job queued in phase 2
        logger()->info("Magic link for {$email}: " . url("/auth/magic?token={$token}"));
    }

    public function verifyMagicLink(string $token): User
    {
        $user = $this->userRepository->findByMagicLinkToken($token);

        if (!$user) {
            throw new \InvalidArgumentException('Invalid or expired sign-in link.');
        }

        Auth::login($user);
        request()->session()->regenerate();

        return $user;
    }

    private function randomColor(): string
    {
        return fake()->randomElement(['#2747E0', '#1F7A47', '#D97757', '#B47A00', '#5C3A1E']);
    }
}
