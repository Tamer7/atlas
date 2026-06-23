# Atlas — Live Classroom Architecture (REALTIME.md)

## Overview

The live classroom is a **fully custom-branded UI** that sits on top of a WebRTC media layer. We do not build our own media server — we use **LiveKit** as the real-time transport. This gives Atlas:

- Custom video tile layouts, whiteboard, controls, recording — all ours
- No iframe embed, no third-party UI showing through
- Self-hostable (LiveKit OSS) or managed (LiveKit Cloud) — your choice
- 100% control over recording pipeline + storage

---

## Why LiveKit

| Requirement | LiveKit approach |
|---|---|
| Scalable WebRTC SFU | Built-in, handles 1→500 participants |
| Recording | LiveKit Egress → composite or per-track MP4 → S3 |
| Screen share | Participant publishes a screen-share track, we render it |
| Custom UI | Their JS SDK (`livekit-client`) gives raw track objects — we render them ourselves |
| Self-hostable | LiveKit Server is a single Go binary + Docker image |
| Collaborative whiteboard | Separate — we use **Liveblocks** or a lightweight **Yjs + WebSocket** layer (see below) |

Alternatives considered: **Daily.co** (similar, slightly easier but less flexible), **Agora** (strong in Asia), **100ms**. LiveKit is recommended for full control + open source.

---

## Integration Architecture

```
Browser (Next.js)          Backend (Laravel)           Infrastructure
─────────────────          ─────────────────           ──────────────
LiveRoom component         LiveSessionController        LiveKit Server (self-hosted / cloud)
  │                          │                            │
  ├─ POST /api/v1/            ├─ Creates LK room           ├─ SFU routes media
  │  live-sessions/{id}/start │  via LiveKit Server SDK     │
  │                          │                            │
  ├─ GET token ◄─────────────┤─ Generates participant     │
  │  (JWT, per-user,         │  token (Server SDK)        │
  │   per-room, with perms)  │  • teacher: publish+admin  │
  │                          │  • student: subscribe       │
  │                          │    (+ publish if permitted)│
  │                          │                            │
  └─ livekit-client SDK       │                           │
     connects to LK Server ──┼───────────────────────────►
     publishes/subscribes     │                           │
     to audio/video tracks    │                           │
                              │                           │
                              │  Recording (Egress):      │
                              │  POST /livekit/egress/    │
                              │  composite → S3 →         │
                              │  ProcessRecordingJob      │
```

---

## Next.js — LiveRoom component

Install:
```bash
npm install @livekit/components-react @livekit/components-styles livekit-client
```

**Key pattern — we use the low-level SDK, NOT `@livekit/components-react` pre-built UI:**

```tsx
// app/(app)/live/room/[sessionId]/page.tsx
"use client";
import { Room, RoomEvent, Track, Participant } from "livekit-client";

export default function LiveRoomPage({ params }) {
  const room = useRef(new Room());

  useEffect(() => {
    room.current.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token, {
      autoSubscribe: true,
    });

    room.current.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      // Attach track to our custom <Tile> component
      updateParticipants();
    });

    return () => { room.current.disconnect(); };
  }, [token]);

  return <LiveRoom room={room.current} role={userRole} />;
}
```

Each `Tile` component receives a `RemoteParticipant` and attaches the video/audio track to a `<video>` element via `track.attach(videoEl)`.

---

## Whiteboard — Collaborative Drawing

The whiteboard needs **multi-user real-time sync** (not just local canvas). Two options:

### Option A — Liveblocks (recommended for speed)
```bash
npm install @liveblocks/client @liveblocks/react
```
- Liveblocks provides a CRDT-backed shared state room
- Each stroke is a `{ tool, color, points[] }` object pushed to shared storage
- All participants subscribe and redraw on update
- Handles conflict resolution, cursor presence, undo/redo

```tsx
const { useStorage, useMutation } = createRoomContext(client);
// strokes: LiveList of stroke objects
// mutations: addStroke(stroke), undoLast(), clear()
```

### Option B — Yjs + WebSocket (self-hosted, cheaper)
```bash
npm install yjs y-websocket
# Backend: run y-websocket server alongside Laravel (Node.js process)
```
- `Y.Array` of stroke objects, synced via WebSocket
- Awareness protocol for remote cursors

### Whiteboard → Recording
When auto-record is ON, at session end:
1. The teacher's browser captures the canvas every 250ms via `canvas.toBlob()`
2. Blobs are uploaded to S3 in a `whiteboard-frames/` prefix
3. `ProcessRecordingJob` uses FFmpeg to stitch frames into an MP4 overlay on the video recording

---

## Laravel — LiveKit Server SDK

```bash
composer require agence104/livekit-server-sdk
```

**Token generation** (in `LiveKitService`):

```php
use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\VideoGrant;

public function generateToken(User $user, LiveSession $session): string
{
    $grant = new VideoGrant();
    $grant->setRoomJoin(true);
    $grant->setRoomName($session->livekit_room);

    if ($user->isTeacher() && $session->instructor_id === $user->id) {
        $grant->setCanPublish(true);
        $grant->setCanPublishData(true);
        $grant->setRoomAdmin(true);
        $grant->setRoomRecord(true);
    } else {
        $grant->setCanPublish($session->features['student_screen_share'] ?? false);
        $grant->setCanPublishData(true); // for whiteboard/chat data messages
        $grant->setCanSubscribe(true);
    }

    $token = new AccessToken(
        config('livekit.api_key'),
        config('livekit.api_secret')
    );
    $token->setIdentity((string) $user->id);
    $token->setName($user->name);
    $token->addGrant($grant);
    $token->setTtl(7200); // 2 hours

    return $token->toJwt();
}
```

**Starting a recording** (Egress):

```php
use Agence104\LiveKit\EgressServiceClient;

$egress = new EgressServiceClient(
    config('livekit.host'),
    config('livekit.api_key'),
    config('livekit.api_secret')
);

$egress->startRoomCompositeEgress(
    roomName: $session->livekit_room,
    output: [
        's3' => [
            'access_key' => config('filesystems.disks.s3.key'),
            'secret'     => config('filesystems.disks.s3.secret'),
            'region'     => config('filesystems.disks.s3.region'),
            'bucket'     => config('filesystems.disks.s3.bucket'),
            'filepath'   => "recordings/{$session->id}/recording.mp4",
        ],
    ],
    layout: 'speaker-dark', // or 'grid' — or custom HTML layout
);
```

**Environment variables (.env)**:
```
LIVEKIT_HOST=wss://your-livekit-server.com
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxx
```

---

## Permissions Matrix

| Action | Teacher/Host | Student (default) | Student (if permitted) |
|---|---|---|---|
| Publish video/audio | ✅ | ❌ | ✅ |
| Subscribe to tracks | ✅ | ✅ | ✅ |
| Screen share | ✅ | ❌ | ✅ (if feature enabled) |
| Send data messages (whiteboard/chat) | ✅ | ✅ | ✅ |
| Mute other participants | ✅ | ❌ | ❌ |
| Start/stop recording | ✅ | ❌ | ❌ |
| Kick participants | ✅ | ❌ | ❌ |
| Room admin | ✅ | ❌ | ❌ |

---

## Chat & Raise Hand

Both are implemented as **LiveKit Data Messages** (not a separate WebSocket):

```ts
// Send a chat message
await room.localParticipant.publishData(
  encoder.encode(JSON.stringify({ type: "chat", text: "..." })),
  DataPacket_Kind.RELIABLE
);

// Raise hand
await room.localParticipant.publishData(
  encoder.encode(JSON.stringify({ type: "raise_hand", raised: true })),
  DataPacket_Kind.RELIABLE
);

// Receive
room.on(RoomEvent.DataReceived, (payload, participant) => {
  const msg = JSON.parse(decoder.decode(payload));
  if (msg.type === "chat") addChatMessage(msg);
  if (msg.type === "raise_hand") updateHandState(participant.identity, msg.raised);
});
```

---

## Recording → Course Pipeline

```
LiveKit Egress completes
         │
         ▼
S3: recordings/{sessionId}/recording.mp4
         │
         ▼ (webhook from LiveKit or S3 event → Laravel queue)
ProcessRecordingJob
  1. Download mp4 temporarily
  2. Run FFmpeg to extract chapters (from whiteboard snapshot timestamps)
  3. Generate poster thumbnail
  4. Upload final assets back to S3
  5. Create `recordings` DB record → { course_id, session_id, video_path, duration }
  6. Set recording `published_at` → appears in /recordings for enrolled students
  7. Send notification: "Your {session.title} recording is ready"
```

---

## LiveKit Deployment

### Option A — LiveKit Cloud (fastest to start)
Sign up at livekit.io/cloud. No infrastructure. ~$0.006/participant-minute. Good for early-stage.

### Option B — Self-hosted (production at scale)
```yaml
# docker-compose.yml
services:
  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit/config.yaml
    ports:
      - "7880:7880"   # HTTP API
      - "7881:7881"   # TURN/TLS
      - "50100-50200:50100-50200/udp"  # WebRTC UDP
    volumes:
      - ./livekit.yaml:/etc/livekit/config.yaml
  redis:
    image: redis:7
```

```yaml
# livekit.yaml
port: 7880
rtc:
  tcp_port: 7881
  udp_port: 7882
  use_external_ip: true
redis:
  address: redis:6379
keys:
  APIxxxxxx: your_api_secret
```

Place behind an nginx reverse proxy with SSL.

---

## Frontend Dependencies Summary

```json
{
  "livekit-client": "^2.x",
  "@liveblocks/client": "^2.x",
  "@liveblocks/react": "^2.x"
}
```

Or for Yjs whiteboard:
```json
{
  "yjs": "^13.x",
  "y-websocket": "^1.x"
}
```
