import { readFileSync, writeFileSync, statSync } from 'fs';
import { execSync } from 'child_process';

const version = process.argv[2];

if (!version) {
  console.log('Usage: pnpm release <version>');
  console.log('Example: pnpm release 1.2.0');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Error: Version must be semver (e.g., 1.2.0)');
  process.exit(1);
}

// Untracked files count too: the release commit must match what CI builds from the tag.
const status = execSync('git status --porcelain', { encoding: 'utf-8' });
if (status.trim()) {
  console.error('Error: Working tree is not clean. Commit, stash or remove changes first.');
  console.error(status);
  process.exit(1);
}

// Check RELEASE_NOTES.md exists and isn't empty
try {
  const stat = statSync('RELEASE_NOTES.md');
  if (stat.size === 0) throw new Error();
} catch {
  console.error('Error: RELEASE_NOTES.md is empty or missing. Write your release notes first.');
  process.exit(1);
}

console.log(`Releasing v${version}...`);

function replaceInFile(path, search, replacement) {
  const content = readFileSync(path, 'utf-8');
  if (!search.test(content)) {
    console.error(`Error: version pattern not found in ${path}`);
    process.exit(1);
  }
  writeFileSync(path, content.replace(search, replacement));
}

const bumps = [
  ['package.json', /"version": "[^"]*"/, `"version": "${version}"`],
  ['src-tauri/tauri.conf.json', /"version": "[^"]*"/, `"version": "${version}"`],
  ['src-tauri/Cargo.toml', /^version = "[^"]*"/m, `version = "${version}"`],
  ['src-tauri/Cargo.lock', /(name = "feathertype"\r?\nversion = )"[^"]*"/, `$1"${version}"`],
  ['src/config.ts', /APP_VERSION = '[^']*'/, `APP_VERSION = '${version}'`],
];

for (const [path, search, replacement] of bumps) replaceInFile(path, search, replacement);

console.log(`Version bumped to ${version} in:`);
for (const [path] of bumps) console.log(`  - ${path}`);

// Commit, tag, push
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run(`git add -- ${bumps.map(([path]) => path).join(' ')}`);

// Only commit if there are staged changes (version may already match)
try {
  execSync('git diff --cached --quiet', { stdio: 'pipe' });
  console.log('Version already up to date, skipping commit.');
} catch {
  run(`git commit -m "release: v${version}"`);
}

run(`git tag -a "v${version}" -m "v${version}"`);
run('git push');
run('git push --tags');

console.log('');
console.log(`Done! v${version} tagged and pushed.`);
console.log('GitHub Actions will now build and publish the release.');
