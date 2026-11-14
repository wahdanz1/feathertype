import { useState, useEffect } from 'react';
import { loadReleases, pickLatest, type ReleaseEntry } from '../lib/releases';

export type ReleasesStatus = 'loading' | 'ready' | 'error';

interface UseReleasesResult {
  releases: ReleaseEntry[];
  latest: ReleaseEntry | null;
  status: ReleasesStatus;
}

// StrictMode runs effects twice in dev; sharing the pending promise keeps that to one request.
let pending: Promise<ReleaseEntry[]> | null = null;

function loadOnce(): Promise<ReleaseEntry[]> {
  pending ??= loadReleases().finally(() => {
    pending = null;
  });
  return pending;
}

export function useReleases(): UseReleasesResult {
  const [releases, setReleases] = useState<ReleaseEntry[]>([]);
  const [status, setStatus] = useState<ReleasesStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    loadOnce().then(
      (entries) => {
        if (cancelled) return;
        setReleases(entries);
        setStatus('ready');
      },
      () => {
        if (!cancelled) setStatus('error');
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { releases, latest: pickLatest(releases), status };
}
