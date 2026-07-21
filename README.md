# InstrumentalSW Frontend

Accessible Next.js interface for InstrumentalSW (Saxo). SAX-040 creates transcription jobs from MP3/WAV files; SAX-041 adds a dedicated read-only route that repeatedly retrieves the current job state through the Spring Boot product API.

```text
Browser / Next.js :3000
  → Spring Boot product API :8080
    → internal FastAPI AI service :8000
```

The browser never calls or configures FastAPI directly.

## Requirements

- Node.js 24.18.0 LTS
- npm 11.6.2

Pinned stack:

```text
Next.js:              16.2.11
React / React DOM:    19.2.8
TypeScript:           5.8.3
Vitest:               4.1.10
Testing Library:      16.3.2
user-event:           14.6.1
ESLint:               9.39.2
Prettier:             3.9.6
jsdom:                29.1.1
```

## Install and run

```bash
npm ci
npm run dev
```

The page runs at `http://localhost:3000`. Start Spring separately at `http://localhost:8080`; Spring contacts FastAPI on port 8000.

## Configuration

```text
NEXT_PUBLIC_SAXO_API_BASE_URL=http://localhost:8080
```

The local Backend URL is the fallback. Both POST and GET append `/api/v1/transcriptions`. Do not configure a FastAPI URL in the browser.

## Quality

```bash
npm run test
npm run lint
npm run format:check
npm run typecheck
npm run build
npm run quality
```

`npm run quality` executes the full sequence. Vitest enforces at least 90% global coverage for statements, branches, functions, and lines.

## Create a job

1. Select one `.mp3` or `.wav` file.
2. Choose `soprano`, `alto`, `tenor`, or `baritone`.
3. Choose `solo` or `mixture`.
4. Submit manually.
5. Next.js sends exact multipart fields to Spring Boot.
6. HTTP 202 displays all returned job fields.

Exact multipart fields:

```text
file
saxophone_type
input_mode
```

The browser lets `fetch` create the multipart boundary. It does not upload automatically, read audio for playback, create an object URL, or show a waveform.

The creation result offers both:

```text
View job progress
Upload another audio file
```

## View current job status

Dynamic route:

```text
/transcriptions/{job_id}
```

The identifier is held in the URL, so the route works after browser reload without localStorage, sessionStorage, or cookies.

The typed client calls only:

```http
GET ${NEXT_PUBLIC_SAXO_API_BASE_URL}/api/v1/transcriptions/{job_id}
```

It validates the UUID before `fetch`, accepts only HTTP 200, verifies the complete seven-field job and response identity, and performs no internal retry.

The page displays:

```text
Job ID
Current status
Filename
Saxophone
Audio mode
File size
Audio SHA-256
automatic update state
```

## Polling policy

```text
first GET: immediate after mount
interval: 3000 ms after the previous request completes
maximum concurrent requests: 1
```

Recursive `setTimeout` prevents overlap. `AbortController`, timer cleanup, and request sequence numbers protect unmount and stale-response cases.

Controls:

```text
Refresh now
Pause automatic updates
Resume automatic updates
Try again
Back to upload
```

The current AI contract defines only:

```text
UPLOADED → active automatic updates
FAILED   → terminal, automatic updates stopped
```

Any other status is displayed exactly, marked as outside the known contract, and pauses automatic updates. Errors also pause polling and require explicit retry. The last valid job remains visible after a transient failure.

## No false progress

The page reports server state only. It does not display a percentage, elapsed-time animation, ETA, simulated model stage, or unsupported status such as PROCESSING or COMPLETED.

## Accessibility and responsive layout

- visible labels and one route title;
- `aria-live="polite"` for current status and polling text;
- `role="alert"` and programmatic focus for errors;
- explicit keyboard-operable controls and visible focus;
- state represented textually, never only through color;
- long UUID and SHA-256 values wrap;
- no mandatory animation;
- metadata and actions collapse into a single-column mobile layout.

The existing warm light background, neutral surfaces, charcoal text, green actions, amber focus, and visible borders are preserved without a blue primary treatment, emoji, or component library.

## Boundaries

SAX-041 does not implement notes, confidence markers, timeline, score viewing, audio/MIDI playback, editing, downloads, persistence, service workers, background sync, WebSocket, SSE, long polling, authentication, analytics, SAX-042, or later stories.

Documentation:

- [`docs/contracts/audio-upload-ui-v1.md`](docs/contracts/audio-upload-ui-v1.md)
- [`docs/contracts/job-progress-ui-v1.md`](docs/contracts/job-progress-ui-v1.md)
- [`docs/tdd/iteration-001.md`](docs/tdd/iteration-001.md)
- [`docs/tdd/iteration-002.md`](docs/tdd/iteration-002.md)
