# InstrumentalSW Frontend

Accessible Next.js interface for InstrumentalSW (Saxo). SAX-040 creates transcription jobs, SAX-041 displays current server status with controlled polling, and SAX-042 adds a read-only note timeline and semantic confidence review through the Spring Boot product API.

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

`npm run quality` executes the full sequence. Vitest enforces at least 90% global coverage for statements, branches, functions, and lines.

## Create a job

1. Select one `.mp3` or `.wav` file.
2. Choose `soprano`, `alto`, `tenor`, or `baritone`.
3. Choose `solo` or `mixture`.
4. Submit manually.
5. Next.js sends exact multipart fields to Spring Boot.
6. HTTP 202 displays all returned job fields.

The browser lets `fetch` create the multipart boundary. It does not upload automatically, read audio for playback, create an object URL, or show a waveform.

The creation result offers `View job progress` and `Upload another audio file`.

## View current job status

```text
/transcriptions/{job_id}
```

The UUID is in the URL, so reload requires no localStorage, sessionStorage, or cookies. The typed client calls only the Backend, validates the complete job and response identity, and performs no internal retry.

Polling policy:

```text
first GET: immediate after mount
interval: 3000 ms after the previous request completes
maximum concurrent requests: 1
```

Recursive `setTimeout`, `AbortController`, cleanup, and request sequence numbers prevent overlap and stale updates. The page retains `Refresh now`, `Pause/Resume automatic updates`, `Try again`, and `Back to upload`, and adds `View notes`.

The AI contract currently defines only `UPLOADED` and `FAILED`; unknown values are displayed exactly and pause polling. No percentage, ETA, or invented stage is shown.

## View transcription notes

```text
/transcriptions/{job_id}/review
```

The route works after reload without browser storage. It sends one bodyless request to:

```http
GET ${NEXT_PUBLIC_SAXO_API_BASE_URL}/api/v1/transcriptions/{job_id}/review
```

The review client validates UUID before fetch, accepts only HTTP 200, verifies all versions, identity, instrument, threshold, confidence metadata, summary counts, event order/indices, MIDI values, timing, velocity, confidence, and low-confidence markers. It performs no retry and no review polling.

Explicit review states:

```text
loading
ready
empty
not_ready
not_found
error
```

A successful empty review shows `No note events were produced.` A 409 shows `Transcription notes are not available yet.` No synthetic timeline is displayed for not-ready work.

## Timeline and table

The HTML/CSS timeline starts at zero, uses the maximum offset as visual duration, derives width from onset/offset, preserves contract order, supports overlapping events, and scrolls horizontally. It does not represent audio, playback, measures, or quantization.

Every event is also present in a semantic table with index, written/concert MIDI, onset, offset, derived duration, velocity, confidence, and confidence status.

Low-confidence events remain visible and use text, dashed borders, a pattern, and accessible description. The page states:

```text
Confidence is a model signal, not calibrated accuracy.
```

Confidence is not converted to a percentage.

## Accessibility and responsive layout

- one route `h1`;
- polite live text for loading and summaries;
- `role="alert"` plus programmatic focus for errors;
- keyboard-operable links and controls with visible focus;
- state never represented only by color;
- wrapping for UUID and technical values;
- horizontal overflow for timeline/table;
- responsive navigation and metadata;
- no mandatory animation, emoji, or blue primary treatment.

## Boundaries

SAX-042 does not implement synthetic notes, inference, direct FastAPI calls, review polling, editing, deletion, regeneration, history, audio/MIDI playback, waveform, synchronization, SVG/PDF, downloads, persistence, service workers, authentication, analytics, SAX-043, or later stories.

Documentation:

- [`docs/contracts/audio-upload-ui-v1.md`](docs/contracts/audio-upload-ui-v1.md)
- [`docs/contracts/job-progress-ui-v1.md`](docs/contracts/job-progress-ui-v1.md)
- [`docs/contracts/transcription-review-ui-v1.md`](docs/contracts/transcription-review-ui-v1.md)
- [`docs/tdd/iteration-001.md`](docs/tdd/iteration-001.md)
- [`docs/tdd/iteration-002.md`](docs/tdd/iteration-002.md)
- [`docs/tdd/iteration-003.md`](docs/tdd/iteration-003.md)
