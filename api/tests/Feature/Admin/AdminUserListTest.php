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

function admin(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('guests cannot list users', function () {
    $this->getJson('/api/v1/admin/users')->assertStatus(401);
});

test('students cannot list users', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/v1/admin/users')
        ->assertStatus(403);
});

test('teachers cannot list users', function () {
    $this->actingAs(User::factory()->teacher()->create())
        ->getJson('/api/v1/admin/users')
        ->assertStatus(403);
});

test('an admin sees every user with role and status', function () {
    $admin = admin();
    User::factory()->teacher()->create(['name' => 'Tina Teacher', 'email' => 'tina@example.com']);
    User::factory()->create(['name' => 'Sam Student', 'email' => 'sam@example.com']);

    $response = $this->actingAs($admin)
        ->getJson('/api/v1/admin/users')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data'  => [['id', 'name', 'email', 'role', 'is_active', 'created_at']],
            'meta'  => ['current_page', 'last_page', 'total'],
        ]);

    // Locate rows by email rather than index — the list is ordered by name,
    // and index position would be an accident of alphabetical ordering.
    $users = collect($response->json('data'));

    $adminRow = $users->firstWhere('email', $admin->email);
    expect($adminRow['role'])->toBe('admin');
    expect($adminRow['is_active'])->toBeTrue();

    $teacherRow = $users->firstWhere('email', 'tina@example.com');
    expect($teacherRow['role'])->toBe('teacher');
    expect($teacherRow['is_active'])->toBeTrue();

    $studentRow = $users->firstWhere('email', 'sam@example.com');
    expect($studentRow['role'])->toBe('student');
    expect($studentRow['is_active'])->toBeTrue();
});

test('an admin can search by name or email', function () {
    $admin = admin();
    User::factory()->create(['name' => 'Findable Person', 'email' => 'findme@example.com']);
    User::factory()->create(['name' => 'Someone Else', 'email' => 'other@example.com']);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?search=findme')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Findable Person');
});

test('an admin can filter by role and by status', function () {
    $admin = admin();
    User::factory()->teacher()->create();
    User::factory()->create(['deactivated_at' => now()]);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?role=teacher')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.role', 'teacher');

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/users?status=inactive')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.is_active', false);
});
