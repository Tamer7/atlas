<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    protected $signature = 'atlas:create-admin
                            {email : Email address of the administrator}
                            {--name= : Display name, used only when creating}
                            {--password= : Password, prompted for when omitted}';

    protected $description = 'Create an administrator, or promote an existing user to administrator';

    public function handle(AdminUserRepositoryInterface $users): int
    {
        $email = $this->argument('email');
        $user  = User::where('email', $email)->first();

        if ($user) {
            $this->promote($users, $user);
            $this->info("Promoted {$email} to administrator.");

            return self::SUCCESS;
        }

        $password = $this->option('password')
            ?: $this->secret('Password for the new administrator');

        if (! $password) {
            $this->error('A password is required when creating a new administrator.');

            return self::FAILURE;
        }

        $user = $users->create([
            'name'     => $this->option('name') ?: Str::before($email, '@'),
            'email'    => $email,
            'password' => Hash::make($password),
            'color'    => '#2747E0',
        ]);

        $this->promote($users, $user);
        $this->info("Created administrator {$email}.");

        return self::SUCCESS;
    }

    private function promote(AdminUserRepositoryInterface $users, User $user): void
    {
        // Exactly one role per user: setRole() replaces via sync(), never appends.
        $users->setRole($user, 'admin');

        // Re-running the command is the documented recovery path when the only
        // administrator has been locked out. setActive() uses forceFill()
        // internally because deactivated_at is deliberately excluded from
        // User's #[Fillable] — a plain update() would silently no-op here.
        if (! $user->isActive()) {
            $users->setActive($user, true);
        }
    }
}
