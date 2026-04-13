# Releasing FeatherType

## Quick version

1. Edit `RELEASE_NOTES.md`
2. Commit
3. Run `pnpm release <version>`

## Step by step

### 1. Write release notes

Edit `RELEASE_NOTES.md`. The first line sets the badges shown on the download page:

```
tags: Feature, Stable

- Added dark mode toggle
- New keyboard shortcut for save
```

**Available tags:**

| Tag           | Badge color | Use when                          |
|---------------|-------------|-----------------------------------|
| `Stable`      | Green       | Production-ready release          |
| `Feature`     | Blue        | New functionality added           |
| `Bug Fix`     | Amber       | Fixes for reported issues         |
| `Improvement` | Gray        | Performance, UX, or code quality  |
| `Beta`        | Gray        | Pre-release / testing             |

You can combine tags: `tags: Feature, Bug Fix`

If you omit the `tags:` line, it defaults to `Stable`.

### 2. Commit

The release script requires a clean working tree, so commit your notes first:

```bash
git add RELEASE_NOTES.md
git commit -m "prep: release notes for vX.Y.Z"
git push
```

### 3. Run the release

```bash
pnpm release 1.1.0
```

This will:
- Bump the version in `package.json`, `tauri.conf.json`, `Cargo.toml`, and `src/config.ts`
- Commit the version bump (skipped if version already matches)
- Create an annotated git tag `v1.1.0`
- Push the commit and tag to GitHub

### 4. Wait for the build

The tag push triggers `.github/workflows/release.yml` which:
- Creates a GitHub Release with your notes as the body
- Builds installers for Windows, macOS (ARM + Intel), and Linux
- Uploads the installers to the release

Monitor progress at: https://github.com/wahdanz1/feathertype/actions

### 5. Verify

- Check the [releases page](https://github.com/wahdanz1/feathertype/releases)
- Check [feathertype.vercel.app/download](https://feathertype.vercel.app/download) — it auto-updates from the GitHub API

## Version numbering

Follow semver: `MAJOR.MINOR.PATCH`

- **Patch** (1.0.1): Bug fixes only
- **Minor** (1.1.0): New features, backwards compatible
- **Major** (2.0.0): Breaking changes

## Files touched by a release

| File | What changes |
|------|-------------|
| `package.json` | `version` field |
| `src-tauri/tauri.conf.json` | `version` field |
| `src-tauri/Cargo.toml` | `version` field |
| `src/config.ts` | `APP_VERSION` constant |
