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

    expect($existing->fresh()->hasRole('admin'))->toBeTrue()
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
