<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'admin']);
});

test('it creates a new admin', function () {
    $this->artisan('atlas:create-admin', [
        'email'      => 'boss@example.com',
        '--name'     => 'The Boss',
        '--password' => 'secret-password',
    ])->assertExitCode(0);

    $user = User::where('email', 'boss@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('admin'))->toBeTrue()
        ->and($user->isActive())->toBeTrue();
});

test('it promotes an existing user and is idempotent', function () {
    $existing = User::factory()->create(['email' => 'promote@example.com']);

    $this->artisan('atlas:create-admin', ['email' => 'promote@example.com'])
        ->assertExitCode(0);
    $this->artisan('atlas:create-admin', ['email' => 'promote@example.com'])
        ->assertExitCode(0);

    $fresh = $existing->fresh();

    expect($fresh->hasRole('admin'))->toBeTrue()
        // Regression guard: setRole() must replace via sync(), not merely
        // attach()/syncWithoutDetaching(). The user started with 'student'
        // (assigned by UserFactory); if a future change stopped replacing
        // roles, this would still see hasRole('admin') === true but the
        // stale 'student' role would linger too.
        ->and($fresh->roles->pluck('name')->all())->toBe(['admin'])
        ->and(User::where('email', 'promote@example.com')->count())->toBe(1);
});

test('it reactivates a deactivated admin', function () {
    User::factory()->create([
        'email'          => 'locked@example.com',
        'deactivated_at' => now(),
    ]);

    $this->artisan('atlas:create-admin', ['email' => 'locked@example.com'])
        ->assertExitCode(0);

    expect(User::where('email', 'locked@example.com')->first()->isActive())->toBeTrue();
});

test('a non-interactive run with no password fails cleanly instead of crashing', function () {
    // Laravel's testing artisan() helper mocks the question-asking method
    // itself (OutputStyle::askQuestion), so any attempt to prompt without
    // an expectsQuestion() expectation would blow up the test with
    // "Unexpected question was asked" rather than exercising the code path
    // a real non-TTY invocation takes. Passing --no-interaction here makes
    // Command::$input->isInteractive() false before handle() runs, so the
    // command must short-circuit to the clean failure branch without ever
    // calling secret()/askQuestion — proving that branch is reachable and
    // exits non-zero with the intended message, not an uncaught exception.
    $this->artisan('atlas:create-admin', [
        'email'            => 'nopass@example.com',
        '--no-interaction' => true,
    ])
        ->assertExitCode(1)
        ->expectsOutputToContain('A password is required when creating a new administrator.');

    expect(User::where('email', 'nopass@example.com')->exists())->toBeFalse();
});

test('promoting a non-admin existing user reports the escalation explicitly', function () {
    User::factory()->create(['email' => 'student@example.com']);

    $this->artisan('atlas:create-admin', ['email' => 'student@example.com'])
        ->assertExitCode(0)
        ->expectsOutputToContain('Escalated student@example.com to administrator (was: student).');
});

test('re-running on an already active admin reports no change', function () {
    $this->artisan('atlas:create-admin', [
        'email'      => 'idempotent@example.com',
        '--password' => 'secret-password',
    ])->assertExitCode(0);

    $this->artisan('atlas:create-admin', ['email' => 'idempotent@example.com'])
        ->assertExitCode(0)
        ->expectsOutputToContain('idempotent@example.com is already an active administrator; no change made.');
});

test('reactivating a deactivated admin reports the reactivation explicitly', function () {
    $admin = User::factory()->create(['email' => 'locked-admin@example.com']);
    $admin->roles()->sync([Role::firstOrCreate(['name' => 'admin'])->id]);
    $admin->forceFill(['deactivated_at' => now()])->save();

    $this->artisan('atlas:create-admin', ['email' => 'locked-admin@example.com'])
        ->assertExitCode(0)
        ->expectsOutputToContain('Reactivated deactivated administrator locked-admin@example.com.');
});
