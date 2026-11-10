import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['tests/db/**/*.test.ts'],
    env: loadEnv('local', process.cwd(), ''),
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
