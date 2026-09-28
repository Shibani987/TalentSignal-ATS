import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const mongoBinaryDir = path.join(repoRoot, '.cache', 'mongodb-binaries');

await mkdir(mongoBinaryDir, { recursive: true });

const child = spawn(process.execPath, ['--test'], {
  cwd: path.join(repoRoot, 'server'),
  env: {
    ...process.env,
    MONGOMS_DOWNLOAD_DIR: mongoBinaryDir,
    MONGOMS_PREFER_GLOBAL_PATH: 'false'
  },
  stdio: 'inherit'
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
