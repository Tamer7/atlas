<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

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

test('a deactivated user with a valid token is rejected on the token auth path', function () {
    // createToken() is not usable as-is here, for two separate, pre-existing
    // reasons unrelated to the deactivation guard under test (grep confirms
    // it is never called outside this test, so this path has never been
    // exercised):
    //
    // 1. personal_access_tokens.id is a uuid primary key (see its
    //    migration), but Sanctum's stock PersonalAccessToken model never
    //    generates one before insert -- no HasUuids trait, no
    //    Sanctum::usePersonalAccessTokenModel() override anywhere in this
    //    app. Left alone, insert throws a NOT NULL violation on "id".
    //
    // 2. PersonalAccessToken also never overrides $incrementing (default
    //    true) or $keyType (default 'int'). Eloquent's getCasts() merges
    //    [$keyName => $keyType] into the cast list whenever $incrementing is
    //    true, so ->getKey()/->id silently runs the uuid through an (int)
    //    cast (e.g. "cba76b3a-..." -> 0). Worse, Sanctum's own
    //    Guard::isValidBearerToken() rejects an "id|token" bearer string
    //    outright whenever getKeyType() === 'int' and the id part isn't
    //    ctype_digit -- so no correctly-cased uuid id would ever be accepted
    //    in that format regardless of how it's produced.
    //
    // Work around both, without touching any production file, by supplying
    // the id ourselves (so insert succeeds) and using Sanctum's legacy
    // plain-token format (no "id|" prefix). PersonalAccessToken::findToken()
    // looks that up purely by the hashed "token" column
    // (`where('token', hash(...))`), never touching the primary key, so it
    // sidesteps the cast bug entirely while still exercising the real
    // Sanctum bearer-token guard/lookup code path end to end.
    PersonalAccessToken::creating(function (PersonalAccessToken $token) {
        $token->id ??= (string) Str::uuid();
    });

    $user = User::factory()->create();

    $token = Str::random(40);
    $user->tokens()->create([
        'name'      => 'test',
        'token'     => hash('sha256', $token),
        'abilities' => ['*'],
    ]);

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/auth/me')
        ->assertOk();

    // deactivated_at is deliberately excluded from #[Fillable]; forceFill
    // bypasses that guard for test setup only (see comment above).
    $user->forceFill(['deactivated_at' => now()])->save();

    // Both getJson() calls in this test share the same booted application,
    // so AuthManager would otherwise keep returning its already-resolved
    // 'sanctum' guard instance, which itself caches the user it resolved on
    // the first call. A real second HTTP request boots a fresh container and
    // does not have this problem; force re-resolution here so this second
    // call genuinely re-authenticates against current (deactivated) state
    // instead of reusing the guard's stale, pre-deactivation cache.
    Auth::forgetGuards();

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/auth/me')
        ->assertStatus(401);
});
