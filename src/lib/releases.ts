const GITHUB_REPO = 'wahdanz1/feathertype';
export const RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
export const RELEASES_PAGE_URL = `https://github.com/${GITHUB_REPO}/releases`;

const CACHE_KEY = 'feathertype:releases';
// Unauthenticated GitHub API calls are capped at 60/hour per IP; a short TTL keeps navigation free.
export const CACHE_TTL_MS = 10 * 60 * 1000;

export type ReleaseTag = 'Stable' | 'Beta' | 'Feature' | 'Bug Fix' | 'Improvement';

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface ReleaseEntry {
  version: string;
  date: string;
  prerelease: boolean;
  tags: ReleaseTag[];
  changes: string[];
  asset: ReleaseAsset | null;
}

export interface GitHubRelease {
  tag_name: string;
  published_at: string;
  draft?: boolean;
  prerelease: boolean;
  body: string | null;
  assets?: { name: string; browser_download_url: string; size: number }[];
}

interface CachedReleases {
  at: number;
  releases: ReleaseEntry[];
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/([*_])(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1');
}

const VALID_TAGS: Record<string, ReleaseTag> = {
  'stable': 'Stable',
  'beta': 'Beta',
  'feature': 'Feature',
  'bug fix': 'Bug Fix',
  'improvement': 'Improvement',
};

function parseTags(body: string, prerelease: boolean): { tags: ReleaseTag[]; cleanBody: string } {
  const tagsMatch = body.match(/^tags:\s*(.+)$/m);

  if (tagsMatch) {
    const tags = tagsMatch[1]
      .split(',')
      .map((t) => VALID_TAGS[t.trim().toLowerCase()])
      .filter(Boolean);
    const cleanBody = body.replace(/^tags:\s*.+\n?/m, '');
    return { tags: tags.length > 0 ? tags : [prerelease ? 'Beta' : 'Stable'], cleanBody };
  }

  return { tags: [prerelease ? 'Beta' : 'Stable'], cleanBody: body };
}

function parseChanges(body: string): string[] {
  return body
    .split('\n')
    .map((line) => stripInlineMarkdown(line.replace(/^[-*]\s+/, '').trim()))
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('tags:'));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

export function toReleaseEntries(data: GitHubRelease[]): ReleaseEntry[] {
  return data
    .filter((rel) => !rel.draft)
    .map((rel) => {
      const exe = rel.assets?.find((a) => a.name.endsWith('.exe'));
      const { tags, cleanBody } = parseTags(rel.body || '', rel.prerelease);
      return {
        version: rel.tag_name.replace(/^v/, ''),
        date: formatDate(rel.published_at),
        prerelease: rel.prerelease,
        tags,
        changes: parseChanges(cleanBody),
        asset: exe ? { name: exe.name, downloadUrl: exe.browser_download_url, size: exe.size } : null,
      };
    });
}

// GitHub lists releases newest first, so the first stable entry matches what /releases/latest returns.
export function pickLatest(releases: ReleaseEntry[]): ReleaseEntry | null {
  return releases.find((rel) => !rel.prerelease) ?? null;
}

function readCache(storage: Storage | undefined, now: number): ReleaseEntry[] | null {
  try {
    const raw = storage?.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedReleases;
    if (!Array.isArray(cached.releases) || now - cached.at > CACHE_TTL_MS) return null;
    return cached.releases;
  } catch {
    return null;
  }
}

function writeCache(storage: Storage | undefined, now: number, releases: ReleaseEntry[]) {
  try {
    storage?.setItem(CACHE_KEY, JSON.stringify({ at: now, releases } satisfies CachedReleases));
  } catch {
    // Storage full or blocked: the fetched list is still returned, only the cache is skipped.
  }
}

function sessionStore(): Storage | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

interface LoadOptions {
  fetchFn?: typeof fetch;
  storage?: Storage;
  now?: number;
}

/** Throws on any non-2xx (including rate-limit 403/429) or network failure; failures are never cached. */
export async function loadReleases({
  fetchFn = globalThis.fetch,
  storage = sessionStore(),
  now = Date.now(),
}: LoadOptions = {}): Promise<ReleaseEntry[]> {
  const cached = readCache(storage, now);
  if (cached) return cached;

  const res = await fetchFn(RELEASES_API_URL);
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

  const releases = toReleaseEntries((await res.json()) as GitHubRelease[]);
  writeCache(storage, now, releases);
  return releases;
}
