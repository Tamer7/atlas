<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\Console\Exception\MissingInputException;

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
            $this->info($this->promote($users, $user));

            return self::SUCCESS;
        }

        $password = $this->option('password');

        // This command's primary real-world invocation is an ops script or
        // `docker exec <container> php artisan atlas:create-admin ...`
        // without a TTY attached. Symfony only flips isInteractive() to
        // false when `--no-interaction`/`-n` is passed explicitly — it does
        // not detect a missing TTY — so a bare non-interactive exec still
        // has isInteractive() === true and will try to read real stdin.
        // With no TTY behind it that read hits EOF immediately and
        // QuestionHelper throws MissingInputException. The isInteractive()
        // check short-circuits the common "ops script passed
        // --no-interaction" case without ever touching stdin; the catch
        // handles the "no TTY, no explicit flag" case that isInteractive()
        // alone cannot see.
        if (! $password && ! $this->input->isInteractive()) {
            return $this->failMissingPassword();
        }

        if (! $password) {
            try {
                $password = $this->secret('Password for the new administrator');
            } catch (MissingInputException) {
                $password = null;
            }
        }

        if (! $password) {
            return $this->failMissingPassword();
        }

        $user = $users->create([
            'name'     => $this->option('name') ?: Str::before($email, '@'),
            'email'    => $email,
            'password' => Hash::make($password),
            'color'    => '#2747E0',
        ]);

        $users->setRole($user, 'admin');
        $this->info("Created administrator {$email}.");

        return self::SUCCESS;
    }

    private function failMissingPassword(): int
    {
        $this->error('A password is required when creating a new administrator.');

        return self::FAILURE;
    }

    /**
     * Promotes an existing user to admin and reports exactly what changed,
     * so an operator scanning output can tell a harmless re-run apart from
     * silently escalating a typo'd, non-admin account (e.g. a student's).
     */
    private function promote(AdminUserRepositoryInterface $users, User $user): string
    {
        $priorRoles = $user->roles->pluck('name')->all();
        $wasAdmin   = in_array('admin', $priorRoles, true);
        $wasActive  = $user->isActive();

        // Exactly one role per user: setRole() replaces via sync(), never appends.
        $users->setRole($user, 'admin');

        // Re-running the command is the documented recovery path when the only
        // administrator has been locked out. setActive() uses forceFill()
        // internally because deactivated_at is deliberately excluded from
        // User's #[Fillable] — a plain update() would silently no-op here.
        if (! $wasActive) {
            $users->setActive($user, true);
        }

        $priorRoleLabel = $priorRoles === [] ? 'no role' : implode(', ', $priorRoles);

        return match (true) {
            ! $wasAdmin && ! $wasActive => "Escalated {$user->email} to administrator and reactivated the account (was: {$priorRoleLabel}, deactivated).",
            ! $wasAdmin => "Escalated {$user->email} to administrator (was: {$priorRoleLabel}).",
            ! $wasActive => "Reactivated deactivated administrator {$user->email}.",
            default => "{$user->email} is already an active administrator; no change made.",
        };
    }
}
