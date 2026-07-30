<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Tester\CommandTester;

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

test('a real closed stdin (no --no-interaction, no TTY) exits cleanly instead of crashing', function () {
    // $this->artisan() cannot exercise a real stdin EOF at all: it mocks
    // OutputStyle::askQuestion() itself (PendingCommand::mockConsoleOutput()),
    // so any call to secret()/ask() without an expectsQuestion() expectation
    // throws Mockery's NoMatchingExpectationException before Symfony's real
    // QuestionHelper ever runs. Symfony's CommandTester drives the real
    // QuestionHelper against a real input stream instead, so it can
    // reproduce a genuine EOF. The command is resolved via Artisan::all()
    // rather than `new CreateAdminCommand(...)` because
    // Illuminate\Console\Command::run() needs setLaravel() to have been
    // called (it does `$this->laravel->make(OutputStyle::class, ...)`),
    // which only happens when a command is added to the Artisan application.
    //
    // IMPORTANT — what this test does NOT prove: it does not prove the
    // `catch (MissingInputException)` block in the command is reached. A
    // verified negative control (temporarily deleting that catch, rerunning,
    // restoring it — see task-9-report.md "Fix round 2") showed this test
    // keeps passing either way. Root cause, confirmed with a standalone
    // probe directly against Symfony\Component\Console\Helper\QuestionHelper:
    // Command::secret() calls Question::setHiddenFallback(true) (its
    // default), and with that flag on, QuestionHelper's own hidden-question
    // handling swallows MissingInputException internally and returns null
    // instead of ever throwing out of secret() — verified by asking the same
    // empty stream with setHiddenFallback(false), which DID let
    // MissingInputException propagate. So for this command's specific
    // `$this->secret(...)` call, that catch is currently unreachable dead
    // code; what's actually proved below is the end-to-end outcome (clean
    // exit 1 + the friendly message, not a stack trace) for a real EOF,
    // which is what matters operationally, regardless of which layer
    // prevents the crash.
    $command = Artisan::all()['atlas:create-admin'];
    $tester  = new CommandTester($command);

    // setInputs([]) backs the command's input stream with an in-memory
    // stream containing zero bytes, i.e. already at EOF — the same
    // condition QuestionHelper hits reading from a closed/absent TTY.
    // Interactivity is deliberately left unset so it keeps Symfony's
    // ArrayInput default of true, matching a real invocation with no
    // --no-interaction flag (configureIO() only flips it on that explicit
    // flag, never on a missing TTY).
    $tester->setInputs([]);

    $exitCode = $tester->execute(['email' => 'eof@example.com']);

    expect($exitCode)->toBe(1)
        ->and($tester->getDisplay())->toContain('A password is required when creating a new administrator.');

    expect(User::where('email', 'eof@example.com')->exists())->toBeFalse();
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
