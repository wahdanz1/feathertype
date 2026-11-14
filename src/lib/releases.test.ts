// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CACHE_TTL_MS,
  RELEASES_API_URL,
  loadReleases,
  pickLatest,
  toReleaseEntries,
  type GitHubRelease,
} from './releases';

const NOW = 1_800_000_000_000;

function release(overrides: Partial<GitHubRelease> = {}): GitHubRelease {
  return {
    tag_name: 'v1.1.0',
    published_at: '2026-10-01T12:00:00Z',
    draft: false,
    prerelease: false,
    body: 'tags: Feature\n- Added **DOCX** export',
    assets: [
      { name: 'FeatherType_1.1.0_x64-setup.exe', browser_download_url: 'https://example.test/setup.exe', size: 5_242_880 },
      { name: 'latest.json', browser_download_url: 'https://example.test/latest.json', size: 100 },
    ],
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('toReleaseEntries', () => {
  it('maps the .exe asset, tags and cleaned changes', () => {
    const [entry] = toReleaseEntries([release()]);
    expect(entry).toMatchObject({
      version: '1.1.0',
      prerelease: false,
      tags: ['Feature'],
      changes: ['Added DOCX export'],
      asset: { name: 'FeatherType_1.1.0_x64-setup.exe', downloadUrl: 'https://example.test/setup.exe', size: 5_242_880 },
    });
  });

  it('drops drafts and leaves asset null when no installer is attached', () => {
    const entries = toReleaseEntries([release({ draft: true, tag_name: 'v2.0.0' }), release({ assets: [] })]);
    expect(entries.map((e) => e.version)).toEqual(['1.1.0']);
    expect(entries[0].asset).toBeNull();
  });
});

describe('pickLatest', () => {
  it('skips prereleases', () => {
    const entries = toReleaseEntries([
      release({ tag_name: 'v1.2.0-beta.1', prerelease: true }),
      release({ tag_name: 'v1.1.0' }),
    ]);
    expect(pickLatest(entries)?.version).toBe('1.1.0');
  });

  it('returns null when there are no stable releases', () => {
    expect(pickLatest([])).toBeNull();
  });
});

describe('loadReleases', () => {
  beforeEach(() => sessionStorage.clear());

  it('fetches once and caches a 200 with releases', async () => {
    const fetchFn = vi.fn(async () => jsonResponse([release()]));
    const entries = await loadReleases({ fetchFn, now: NOW });
    expect(fetchFn).toHaveBeenCalledExactlyOnceWith(RELEASES_API_URL);
    expect(pickLatest(entries)?.asset?.downloadUrl).toBe('https://example.test/setup.exe');
  });

  it('returns an empty list for a 200 with no releases', async () => {
    const fetchFn = vi.fn(async () => jsonResponse([]));
    await expect(loadReleases({ fetchFn, now: NOW })).resolves.toEqual([]);
  });

  it('throws on a rate-limit 403 and does not cache it', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ message: 'API rate limit exceeded' }, 403));
    await expect(loadReleases({ fetchFn, now: NOW })).rejects.toThrow('403');
    await expect(loadReleases({ fetchFn, now: NOW })).rejects.toThrow('403');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('throws on a network error', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(loadReleases({ fetchFn, now: NOW })).rejects.toThrow('Failed to fetch');
  });

  it('serves a cache hit within the TTL without fetching', async () => {
    await loadReleases({ fetchFn: async () => jsonResponse([release()]), now: NOW });
    const fetchFn = vi.fn(async () => jsonResponse([]));
    const entries = await loadReleases({ fetchFn, now: NOW + CACHE_TTL_MS - 1 });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(entries[0].version).toBe('1.1.0');
  });

  it('refetches once the cache has expired', async () => {
    await loadReleases({ fetchFn: async () => jsonResponse([release()]), now: NOW });
    const fetchFn = vi.fn(async () => jsonResponse([]));
    await expect(loadReleases({ fetchFn, now: NOW + CACHE_TTL_MS + 1 })).resolves.toEqual([]);
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('still returns data when storage throws', async () => {
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    } as unknown as Storage;
    const entries = await loadReleases({ fetchFn: async () => jsonResponse([release()]), storage: broken, now: NOW });
    expect(entries).toHaveLength(1);
  });
});
