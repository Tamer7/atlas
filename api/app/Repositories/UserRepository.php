<?php

namespace App\Repositories;

use App\Models\MagicLinkToken;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Str;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function createMagicLinkToken(string $email): string
    {
        MagicLinkToken::where('email', $email)->delete();

        $token = Str::random(64);

        MagicLinkToken::create([
            'email' => $email,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addMinutes(15),
        ]);

        return $token;
    }

    public function findByMagicLinkToken(string $token): ?User
    {
        $record = MagicLinkToken::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereNull('used_at')
            ->first();

        if (!$record) {
            return null;
        }

        $record->update(['used_at' => now()]);

        return User::where('email', $record->email)->first();
    }
}
