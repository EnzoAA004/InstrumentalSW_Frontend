export const SAXOPHONE_TYPES = ["soprano", "alto", "tenor", "baritone"] as const;
export const INPUT_MODES = ["solo", "mixture"] as const;

export type SaxophoneType = (typeof SAXOPHONE_TYPES)[number];
export type InputMode = (typeof INPUT_MODES)[number];

export interface TranscriptionJob {
  job_id: string;
  status: string;
  filename: string;
  size_bytes: number;
  audio_sha256: string;
  saxophone_type: SaxophoneType;
  input_mode: InputMode;
}

export interface SubmitTranscriptionInput {
  file: File;
  saxophoneType: SaxophoneType;
  inputMode: InputMode;
}

export type SubmitTranscription = (
  input: SubmitTranscriptionInput,
) => Promise<TranscriptionJob>;

interface PublicErrorPayload {
  code: string;
  message: string;
  field: string | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const LOCAL_BACKEND_URL = "http://localhost:8080";
const TRANSCRIPTIONS_PATH = "/api/v1/transcriptions";

export class TranscriptionApiError extends Error {
  readonly code: string;
  readonly field: string | null;
  readonly status: number | null;

  constructor(
    code: string,
    message: string,
    field: string | null,
    status: number | null,
  ) {
    super(message);
    this.name = "TranscriptionApiError";
    this.code = code;
    this.field = field;
    this.status = status;
  }
}

export async function submitTranscription({
  file,
  saxophoneType,
  inputMode,
}: SubmitTranscriptionInput): Promise<TranscriptionJob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("saxophone_type", saxophoneType);
  formData.append("input_mode", inputMode);

  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl()}${TRANSCRIPTIONS_PATH}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new TranscriptionApiError(
      "BACKEND_UNAVAILABLE",
      "The Saxo service is currently unavailable. Try again.",
      null,
      null,
    );
  }

  const payload = await readJson(response);
  if (response.status !== 202) {
    if (isPublicErrorPayload(payload)) {
      throw new TranscriptionApiError(
        payload.code,
        payload.message,
        payload.field,
        response.status,
      );
    }
    throw invalidResponse(response.status);
  }

  if (!isTranscriptionJob(payload)) {
    throw invalidResponse(response.status);
  }
  return payload;
}

function backendBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SAXO_API_BASE_URL?.trim();
  return (configured || LOCAL_BACKEND_URL).replace(/\/+$/, "");
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw invalidResponse(response.status);
  }
}

function invalidResponse(status: number | null): TranscriptionApiError {
  return new TranscriptionApiError(
    "INVALID_BACKEND_RESPONSE",
    "The Saxo service returned an invalid response.",
    null,
    status,
  );
}

function isPublicErrorPayload(value: unknown): value is PublicErrorPayload {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.code === "string" &&
    value.code.length > 0 &&
    typeof value.message === "string" &&
    value.message.length > 0 &&
    (value.field === null || typeof value.field === "string")
  );
}

function isTranscriptionJob(value: unknown): value is TranscriptionJob {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.job_id === "string" &&
    UUID_PATTERN.test(value.job_id) &&
    typeof value.status === "string" &&
    value.status.trim().length > 0 &&
    typeof value.filename === "string" &&
    value.filename.trim().length > 0 &&
    !/[\\/]/.test(value.filename) &&
    typeof value.size_bytes === "number" &&
    Number.isSafeInteger(value.size_bytes) &&
    value.size_bytes >= 0 &&
    typeof value.audio_sha256 === "string" &&
    SHA256_PATTERN.test(value.audio_sha256) &&
    typeof value.saxophone_type === "string" &&
    SAXOPHONE_TYPES.includes(value.saxophone_type as SaxophoneType) &&
    typeof value.input_mode === "string" &&
    INPUT_MODES.includes(value.input_mode as InputMode)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
