import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Pixel 7'],
    viewport: { width: 360, height: 740 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
