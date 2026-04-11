import { useState, useEffect } from 'react';

const GITHUB_REPO = 'wahdanz1/feathertype';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface LatestRelease {
  version: string;
  asset: ReleaseAsset | null;
}

interface UseLatestReleaseResult {
  release: LatestRelease | null;
  loading: boolean;
  error: boolean;
}

export function useLatestRelease(): UseLatestReleaseResult {
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRelease() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          // 404 = no releases yet, not a real error
          if (res.status === 404) {
            setRelease(null);
            return;
          }
          throw new Error(`GitHub API returned ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        const exe = data.assets?.find(
          (a: { name: string }) => a.name.endsWith('.exe')
        );

        setRelease({
          version: (data.tag_name as string).replace(/^v/, ''),
          asset: exe
            ? {
                name: exe.name,
                downloadUrl: exe.browser_download_url,
                size: exe.size,
              }
            : null,
        });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRelease();
    return () => { cancelled = true; };
  }, []);

  return { release, loading, error };
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}
