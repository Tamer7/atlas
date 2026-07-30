<?php

use App\Modules\Live\Services\LiveService;

// Regression guard for a live production failure:
//   LiveKit egress start failed {"error":"failed to send request:
//    The scheme 'wss' is not supported."}
//
// services.livekit.url holds the client-facing WebSocket URL, which the
// browser SDK needs. The Egress API is REST (Twirp) over HTTPS and the HTTP
// client rejects a wss:// scheme outright, so every recording silently failed
// (the error is caught and logged, and startEgress returns null).

test('egress host converts a websocket url to its http equivalent', function () {
    $service = app(LiveService::class);

    config(['services.livekit.url' => 'wss://atlas-40nqcmte.livekit.cloud']);
    expect($service->egressHost())->toBe('https://atlas-40nqcmte.livekit.cloud');

    config(['services.livekit.url' => 'ws://localhost:7880']);
    expect($service->egressHost())->toBe('http://localhost:7880');
});

test('egress host leaves an already-http url untouched', function () {
    $service = app(LiveService::class);

    config(['services.livekit.url' => 'https://atlas-40nqcmte.livekit.cloud']);
    expect($service->egressHost())->toBe('https://atlas-40nqcmte.livekit.cloud');
});

test('egress host is null when livekit is unconfigured', function () {
    $service = app(LiveService::class);

    // Both branches callers guard on: recording must no-op rather than
    // constructing a client against an empty host.
    config(['services.livekit.url' => null]);
    expect($service->egressHost())->toBeNull();

    config(['services.livekit.url' => '']);
    expect($service->egressHost())->toBeNull();
});
