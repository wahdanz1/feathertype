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

// Check for clean working tree
try {
  execSync('git diff --quiet && git diff --cached --quiet', { stdio: 'pipe' });
} catch {
  console.error('Error: Working tree is not clean. Commit or stash changes first.');
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

// Bump version in all four places
function replaceInFile(path, search, replacement) {
  const content = readFileSync(path, 'utf-8');
  const updated = content.replace(search, replacement);
  writeFileSync(path, updated);
}

replaceInFile('package.json', /"version": "[^"]*"/, `"version": "${version}"`);
replaceInFile('src-tauri/tauri.conf.json', /"version": "[^"]*"/, `"version": "${version}"`);
replaceInFile('src-tauri/Cargo.toml', /^version = "[^"]*"/m, `version = "${version}"`);
replaceInFile('src/config.ts', /APP_VERSION = '[^']*'/, `APP_VERSION = '${version}'`);

console.log(`Version bumped to ${version} in:`);
console.log('  - package.json');
console.log('  - src-tauri/tauri.conf.json');
console.log('  - src-tauri/Cargo.toml');
console.log('  - src/config.ts');

// Commit, tag, push
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('git add -A');
run(`git commit -m "release: v${version}"`);
run(`git tag -a "v${version}" -m "v${version}"`);
run('git push');
run('git push --tags');

console.log('');
console.log(`Done! v${version} tagged and pushed.`);
console.log('GitHub Actions will now build and publish the release.');
