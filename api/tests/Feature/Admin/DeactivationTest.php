<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

test('a user is active by default', function () {
    expect(User::factory()->create()->isActive())->toBeTrue();
});

test('a user with deactivated_at set is not active', function () {
    $user = User::factory()->create(['deactivated_at' => now()]);

    expect($user->isActive())->toBeFalse();
});

test('a deactivated user cannot log in', function () {
    User::factory()->create([
        'email'          => 'gone@example.com',
        'password'       => bcrypt('password'),
        'deactivated_at' => now(),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email'    => 'gone@example.com',
        'password' => 'password',
    ])->assertStatus(401);
});

test('an active session stops working once the user is deactivated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertOk();

    // deactivated_at is deliberately excluded from #[Fillable] so users can't
    // self-reactivate through a mass-assignable endpoint. update() would
    // silently no-op here; forceFill bypasses that guard for test setup only.
    $user->forceFill(['deactivated_at' => now()])->save();

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertStatus(401);
});
