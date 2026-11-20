import { execSync } from 'node:child_process';

// CI/Docker builds have no .git: skip installing the git hooks there.
if (process.env.SKIP_PREPARE === 'true') {
  console.log('Skipping prepare');
  process.exit(0);
}

execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
