<?php

use App\Models\Role;
use App\Models\User;
use App\Modules\Admin\Exceptions\AdminActionDenied;
use App\Modules\Admin\Services\AdminUserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'student']);
    Role::firstOrCreate(['name' => 'teacher']);
    Role::firstOrCreate(['name' => 'admin']);
});

function makeAdmin(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::where('name', 'admin')->first()->id]);

    return $user->fresh();
}

test('an admin can rename a user and change their email', function () {
    $target = User::factory()->create();

    $this->actingAs(makeAdmin())
        ->patchJson("/api/v1/admin/users/{$target->id}", [
            'name'  => 'Corrected Name',
            'email' => 'corrected@example.com',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Corrected Name');
});

test('changing a role replaces it rather than adding one', function () {
    $target = User::factory()->create();

    $this->actingAs(makeAdmin())
        ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => 'teacher'])
        ->assertOk()
        ->assertJsonPath('data.role', 'teacher');

    expect($target->fresh()->roles)->toHaveCount(1);
});

test('an admin can deactivate and reactivate a user', function () {
    $admin  = makeAdmin();
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/deactivate")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/reactivate")
        ->assertOk()
        ->assertJsonPath('data.is_active', true);
});

test('an admin cannot deactivate themselves', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$admin->id}/deactivate")
        ->assertStatus(422);

    expect($admin->fresh()->isActive())->toBeTrue();
});

test('an admin cannot demote themselves', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => 'teacher'])
        ->assertStatus(422);

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

// The last-admin rules are tested against the service rather than over HTTP.
// Over HTTP they are unreachable: the caller must be an active admin, so
// whenever the target is a *different* active admin there are at least two,
// and whenever the target is the last one it is the caller — which the
// self-action rule rejects first. The rules are defence in depth for callers
// that are not the HTTP layer (artisan commands, future endpoints), so they
// are exercised where they can actually fire.

test('the service refuses to deactivate the last active admin', function () {
    $victim = makeAdmin();
    $actor  = makeAdmin();

    // deactivated_at is deliberately excluded from #[Fillable] on User (so
    // it can't be set via a mass-assignable, user-supplied endpoint) —
    // $actor->update([...]) would silently no-op here. forceFill bypasses
    // that guard for test setup only, same as DeactivationTest.php.
    $actor->forceFill(['deactivated_at' => now()])->save(); // leaves $victim as the only active admin

    expect(fn () => app(AdminUserService::class)->deactivate($actor, $victim->id))
        ->toThrow(AdminActionDenied::class);

    expect($victim->fresh()->isActive())->toBeTrue();
});

test('the service refuses to demote the last active admin', function () {
    $victim = makeAdmin();
    $actor  = makeAdmin();
    $actor->forceFill(['deactivated_at' => now()])->save(); // see comment above

    expect(fn () => app(AdminUserService::class)->update($actor, $victim->id, ['role' => 'student']))
        ->toThrow(AdminActionDenied::class);

    expect($victim->fresh()->hasRole('admin'))->toBeTrue();
});

// A genuine concurrent race (two requests interleaving between the count
// read and the write) can't be asserted deterministically in this
// single-threaded Pest run without a flaky, timing-dependent test. What can
// be proven here, deterministically: whenever the guard's count check is on
// the path at all (target is an active admin), it goes through the locking
// query — i.e. the emitted SQL actually carries "for update" — rather than
// the old plain count(). That's the mechanism the fix depends on; the
// non-concurrent behaviour around it is already covered by the seven tests
// above, all of which still pass against this transactional implementation.

test('deactivating an active admin runs the guard count under a row lock', function () {
    $actor  = makeAdmin();
    $target = makeAdmin(); // a second active admin, so the guard's count check executes and passes

    DB::enableQueryLog();

    $this->actingAs($actor)
        ->postJson("/api/v1/admin/users/{$target->id}/deactivate")
        ->assertOk();

    $queries = collect(DB::getQueryLog())->pluck('query');
    DB::flushQueryLog();

    expect($queries->contains(fn ($sql) => str_contains(strtolower($sql), 'for update')))->toBeTrue();
});

test('demoting an active admin runs the guard count under a row lock', function () {
    $actor  = makeAdmin();
    $target = makeAdmin(); // a second active admin, so the guard's count check executes and passes

    DB::enableQueryLog();

    $this->actingAs($actor)
        ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => 'teacher'])
        ->assertOk();

    $queries = collect(DB::getQueryLog())->pluck('query');
    DB::flushQueryLog();

    expect($queries->contains(fn ($sql) => str_contains(strtolower($sql), 'for update')))->toBeTrue();
});
