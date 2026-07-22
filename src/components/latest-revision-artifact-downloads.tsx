"use client";

import { useEffect, useRef, useState } from "react";

import { getTranscriptionRevisionHistory } from "@/lib/transcription-revisions";
import { RevisionArtifactDownloads } from "./revision-artifact-downloads";

export function LatestRevisionArtifactDownloads({ jobId }: { jobId: string }) {
  const [revisionNumber, setRevisionNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      void getTranscriptionRevisionHistory(jobId, controller.signal)
        .then((history) => {
          if (active) setRevisionNumber(history.latest_revision_number);
        })
        .catch(() => {
          if (active && !controller.signal.aborted) {
            setError("The latest revision could not be loaded for downloads.");
          }
        });
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [jobId]);

  useEffect(() => {
    if (error !== null) alertRef.current?.focus();
  }, [error]);

  if (error !== null) {
    return (
      <div className="error-summary" role="alert" tabIndex={-1} ref={alertRef}>
        {error}
      </div>
    );
  }
  if (revisionNumber === null) {
    return <p aria-live="polite">Loading latest revision for downloads…</p>;
  }
  return <RevisionArtifactDownloads jobId={jobId} revisionNumber={revisionNumber} />;
}
