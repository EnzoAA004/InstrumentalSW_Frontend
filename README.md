# InstrumentalSW Frontend

Accessible Next.js interface for InstrumentalSW (Saxo). SAX-040 creates transcription jobs, SAX-041 displays current server status, SAX-042 exposes a read-only note review, and SAX-043 adds explicit editing through immutable revisions.

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

The local Backend URL is the fallback. Do not configure a FastAPI URL in the browser.

## Quality

```bash
npm run test
npm run lint
npm run format:check
npm run typecheck
npm run build
npm run quality
```

`npm run quality` executes the full sequence. Vitest enforces at least 90% global coverage for statements, branches, functions, and lines. TypeScript runs in strict mode, and a production Next.js build is mandatory.

## Create a job

1. Select one `.mp3` or `.wav` file.
2. Choose `soprano`, `alto`, `tenor`, or `baritone`.
3. Choose `solo` or `mixture`.
4. Submit manually.
5. Next.js sends exact multipart fields to Spring Boot.
6. HTTP 202 displays all returned job fields.

The browser lets `fetch` create the multipart boundary. It does not upload automatically, read audio for playback, create an object URL, or show a waveform.

## View current job status

```text
/transcriptions/{job_id}
```

The UUID is in the URL, so reload requires no localStorage, sessionStorage, or cookies. The typed client calls only the Backend and validates the complete response identity.

Polling uses one request at a time, recursive `setTimeout`, `AbortController`, cleanup, and explicit pause/resume controls. No percentage, ETA, or invented stage is shown.

## View transcription notes

```text
/transcriptions/{job_id}/review
```

The read-only route sends one bodyless GET to Spring, validates the complete versioned payload, and displays all notes in an accessible timeline and semantic table. Confidence remains a model signal and is never presented as calibrated accuracy.

A successful empty review is distinct from a not-ready result. The view includes an `Edit notes` link to the SAX-043 editor.

## Edit transcription notes

```text
/transcriptions/{job_id}/review/edit
```

The editor loads revision history first and then loads the latest revision detail. It keeps three concerns separate:

```text
immutable server revision
local editable draft
validation and save state
```

Fetched responses are never mutated. Stable `event_id` values are used as identities and React keys.

The latest revision supports explicit:

- update of written MIDI, onset, and offset;
- addition of a human note with default velocity 64;
- deletion with confirmation;
- discard of local changes;
- save of one operation batch.

There is no autosave and no request per keystroke.

## Immediate validation

Before saving, the browser validates:

- unique non-empty event IDs;
- model or human origin;
- written MIDI as an integer in `0..127`;
- derived concert MIDI in `0..127` using the saxophone offset;
- finite non-negative onset;
- finite offset greater than onset;
- new-event velocity as an integer in `0..127`.

The browser never sends an independent concert pitch. Spring and FastAPI validate the command again and remain authoritative.

Invalid fields expose inline text, `aria-invalid`, and `aria-describedby`. The save action remains disabled while the draft is invalid or unchanged.

## Immutable history and conflicts

The `Revision history` selector exposes revision zero and every later revision. Only the latest revision is editable; historical revisions load their exact server detail in read-only mode.

A `409 REVISION_CONFLICT`:

- preserves the local draft;
- focuses a conflict alert;
- offers an explicit `Reload latest revision` action;
- never overwrites silently.

Reloading latest is a deliberate user action and replaces the draft only after the new server revision is obtained.

## Derived-artifact request boundary

A newly saved revision is marked stale. The editor can explicitly request regeneration through Spring and displays:

```text
Regeneration requested.
No processing worker is connected yet.
```

The UI does not claim completion, display progress, expose an ETA, receive artifact bytes, or offer a download.

Editing, validation and revision history are implemented.

A regeneration request is recorded explicitly.

Artifact execution remains pending.

## Accessibility and responsive layout

- one route `h1`;
- semantic tables and labeled controls;
- polite live regions for loading and status;
- `role="alert"` and programmatic focus for errors and conflicts;
- inline errors associated with their inputs;
- keyboard-operable history, links, delete confirmation, save, discard, and regeneration controls;
- visible focus;
- state communicated with text rather than color alone;
- horizontally scrollable tables;
- responsive action layout;
- no mandatory animation, emoji, or blue primary treatment.

## Boundaries

SAX-043 does not include direct FastAPI calls, autosave, review polling, WebSocket, SSE, real-time collaboration, mutation of historical revisions, confidence editing, playback, waveform, synchronization, generated MIDI/MusicXML/SVG bytes, downloads, worker, queue, BackgroundTasks, authentication, SAX-044, or later stories.

Documentation:

- [`docs/contracts/audio-upload-ui-v1.md`](docs/contracts/audio-upload-ui-v1.md)
- [`docs/contracts/job-progress-ui-v1.md`](docs/contracts/job-progress-ui-v1.md)
- [`docs/contracts/transcription-review-ui-v1.md`](docs/contracts/transcription-review-ui-v1.md)
- [`docs/contracts/transcription-revision-editor-v1.md`](docs/contracts/transcription-revision-editor-v1.md)
- [`docs/tdd/iteration-001.md`](docs/tdd/iteration-001.md)
- [`docs/tdd/iteration-002.md`](docs/tdd/iteration-002.md)
- [`docs/tdd/iteration-003.md`](docs/tdd/iteration-003.md)
- [`docs/tdd/iteration-004.md`](docs/tdd/iteration-004.md)
