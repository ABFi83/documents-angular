import { defineConfig } from 'vitest/config';

// One jsdom worker per core exhausts the memory Windows lets the processes commit (OOM at start-up on a
// 22-core machine): a few workers are enough for this suite.
export default defineConfig({ test: { maxWorkers: 4 } });
