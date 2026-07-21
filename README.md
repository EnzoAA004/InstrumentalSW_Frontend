# InstrumentalSW Frontend

Accessible Next.js interface for InstrumentalSW (Saxo). SAX-040 allows a musician to select an MP3/WAV file, choose saxophone type and audio mode, create a transcription job through the Spring Boot product API, and display the returned HTTP 202 job.

```text
Browser / Next.js :3000
  → Spring Boot product API :8080
    → internal FastAPI AI service :8000
```

The frontend never calls or knows the FastAPI URL.

## Requirements

- Node.js 24.18.0 LTS
- npm 11.6.2

Pinned application stack:

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

## Install

```bash
npm ci
```

## Run

```bash
npm run dev
```

The local page is available at:

```text
http://localhost:3000
```

Start the product Backend separately at `http://localhost:8080`. The Backend then contacts FastAPI on port 8000.

## Configuration

```text
NEXT_PUBLIC_SAXO_API_BASE_URL=http://localhost:8080
```

When the variable is absent, the documented local Backend URL is used. The client always appends `/api/v1/transcriptions`.

Do not configure the FastAPI port or URL in the browser.

## Quality commands

```bash
npm run test
npm run lint
npm run format:check
npm run typecheck
npm run build
npm run quality
```

`npm run quality` runs the full sequence. Vitest enforces at least 90% global coverage for statements, branches, functions, and lines over new component and client logic.

## Upload flow

1. Select one `.mp3` or `.wav` file.
2. Choose `soprano`, `alto`, `tenor`, or `baritone`.
3. Choose `solo` or `mixture`.
4. Submit manually.
5. Next.js sends exact multipart fields to Spring Boot.
6. HTTP 202 displays the complete created job.

The file input does not upload automatically, read audio for playback, create an object URL, or show a waveform.

The `mixture` value is accepted because the existing contract records user intent. Source separation is not implemented in SAX-040.

## Public request

```text
file
saxophone_type
input_mode
```

The browser lets `fetch` generate the multipart boundary and does not set `Content-Type` manually.

Successful results retain:

```text
job_id
status
filename
size_bytes
audio_sha256
saxophone_type
input_mode
```

## Accessibility

- visible labels for every control;
- error summary with `role="alert"` and programmatic focus;
- `aria-describedby` associations;
- textual `aria-live` submitting state;
- keyboard-operable controls and visible focus;
- no state communicated only through color;
- responsive desktop and mobile layout.

## Visual concept

The page uses a warm light background, neutral surfaces, charcoal text, green primary actions, amber focus, visible borders, and readable typography. It uses no blue primary treatment, emoji, component library, or decorative animation.

## Boundaries

SAX-040 implements only initial job creation. It does not implement polling, real progress, WebSocket, SSE, progress navigation, audio preview, playback, waveform, dashboard, timeline, score viewer, editing, downloads, authentication, persistence, analytics, SAX-041, or later stories.

See [`docs/contracts/audio-upload-ui-v1.md`](docs/contracts/audio-upload-ui-v1.md) and [`docs/tdd/iteration-001.md`](docs/tdd/iteration-001.md).
