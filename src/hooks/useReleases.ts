import { useState, useEffect } from 'react';

const GITHUB_REPO = 'wahdanz1/feathertype';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases`;

export interface ReleaseEntry {
  version: string;
  date: string;
  type: 'Stable' | 'Beta';
  changes: string[];
}

interface UseReleasesResult {
  releases: ReleaseEntry[];
  loading: boolean;
  error: boolean;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/([*_])(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1');
}

function parseChanges(body: string): string[] {
  return body
    .split('\n')
    .map((line) => stripInlineMarkdown(line.replace(/^[-*]\s+/, '').trim()))
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function useReleases(): UseReleasesResult {
  const [releases, setReleases] = useState<ReleaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReleases() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          if (res.status === 404) {
            setReleases([]);
            return;
          }
          throw new Error(`GitHub API returned ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        const entries: ReleaseEntry[] = data.map(
          (rel: { tag_name: string; published_at: string; prerelease: boolean; body: string }) => ({
            version: rel.tag_name.replace(/^v/, ''),
            date: formatDate(rel.published_at),
            type: rel.prerelease ? 'Beta' : 'Stable',
            changes: parseChanges(rel.body || ''),
          })
        );

        setReleases(entries);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReleases();
    return () => {
      cancelled = true;
    };
  }, []);

  return { releases, loading, error };
}
