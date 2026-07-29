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
