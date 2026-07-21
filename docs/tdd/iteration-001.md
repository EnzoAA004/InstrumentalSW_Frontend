# TDD iteration 001 — SAX-040 accessible audio upload flow

## Scope

SAX-040 implements one responsive Next.js screen that creates an `UPLOADED` transcription job through the Spring Boot product API.

```text
priority:   P1
estimate:   5 points
epic:       E4 — Product and human review
```

The iteration ends after HTTP 202 is displayed. SAX-041 and later stories are not started.

## Empty repository bootstrap

The repository initially had no commits and reported `size: 0`. The authorized direct root commit contained documentation only:

```text
aa82eb6091e6214a5ae7559780e3fc02b0844655
chore: bootstrap InstrumentalSW Frontend repository
```

The connector cannot create a parentless multi-file commit, so `.gitignore`, `.editorconfig`, tooling, tests, workflows, and product source were added only after `feature/SAX-040-audio-upload` existed.

## Harness before RED

```text
86552208df9a1c9717d6ed31f9a6767da65f3d2f
build(SAX-040): establish frontend test harness
```

The harness fixed Next.js 16.2.11, React 19.2.8, TypeScript 5.8.3 strict mode, Vitest 4.1.10, Testing Library, user-event, jsdom, ESLint, Prettier, and the normal Node 24.18.0 workflow. The page contained only a placeholder and no SAX-040 form or HTTP client.

The normal workflow generated the npm lockfile once with npm 11.6.2:

```text
58de9cccdccc93e1d9025bb0d06db0b87f4d0b2e
build(SAX-040): lock frontend dependencies
```

The workflow was then restored to read-only `npm ci`.

## RED

Tests-only commits preceded production:

```text
44afc4b3c16dc61c7136039ced48ed805303cf70
  test(SAX-040): define typed multipart submission contract

dc880b4158bdf497425be6effc718ab4bef9aace
  test(SAX-040): define accessible upload success and error states
```

The draft PR opened before these modules existed:

```text
src/lib/transcription-api.ts
src/components/audio-upload-form.tsx
```

The normal workflow successfully installed Node, pinned npm, the lockfile, and all dependencies. `npm run quality` then failed because the tested client and form modules were absent. Installation failure was not used as RED evidence.

```text
Quality #1
run: 29858998366
job: 88730579834
result: failure in Run quality gate
```

## GREEN

Production followed the test contracts:

```text
typed union values and response contract
TranscriptionApiError
submitTranscription FormData client
accessible AudioUploadForm
explicit five-state UI model
complete success result
warm responsive styling
App Router page composition
```

The client appends exactly `file`, `saxophone_type`, and `input_mode`, sends POST only to the configured product Backend, accepts only HTTP 202, and validates all returned fields.

The form validates extension and zero-byte content before API contact, does not upload automatically, preserves a valid selection after failure, prevents double submission, and has no polling or automatic retry.

## REFACTOR and diagnostics

The first completed GREEN test run produced:

```text
25 passed
2 failed
```

Both failures exposed one overly narrow client assumption: a syntactically valid UUID was incorrectly required to contain RFC version and variant nibbles. The Backend uses Java `UUID.fromString`, so the frontend was aligned to the same syntactic shape without imposing an additional version contract.

The next run produced:

```text
27 passed
coverage above 90%
ESLint passed
Prettier identified four files
```

The pinned Prettier formatter was applied once to those files and the workflow was restored to read-only operation. Formatting did not change functional expectations.

## Test coverage

The suite covers:

- visible labels and role-based queries;
- exact instrument and mode option values;
- file required validation;
- lowercase and uppercase WAV/MP3;
- unsupported and zero-byte files;
- filename and size display;
- replacement without automatic upload;
- exact POST URL and FormData field names/content;
- absence of manual `Content-Type`;
- HTTP 202 parsing and every displayed field;
- button disabling and synchronous double-submit protection;
- local validation without fetch;
- public 400, 413, 415, 422, and 502 envelopes;
- rejected network requests;
- malformed JSON and incompatible UUID, SHA, size, enums, and status;
- selection preservation and explicit retry;
- error focus, `role="alert"`, `aria-live`, keyboard traversal, and safe unknown errors;
- explicit reset for another upload.

The GREEN evidence before final documentation was:

```text
27 tests passed
92.43% statements
91.76% branches
100% functions
92.43% lines
ESLint passed
```

Exact final format, typecheck, build, CI, and unchanged-head evidence is recorded in the draft PR body after the final quality run.

## Contract coherence

Frontend FormData tests demonstrate the same names and values enforced in Backend multipart tests and present in the existing AI route:

```text
file
saxophone_type
input_mode

soprano | alto | tenor | baritone
solo | mixture
```

No shared package or alternative API contract is introduced.

## Boundaries

The frontend does not know the FastAPI URL, persist audio, create object URLs, play audio, start polling, open WebSocket/SSE, navigate to progress, show a timeline or score, implement editing or downloads, authenticate, or begin SAX-041.
