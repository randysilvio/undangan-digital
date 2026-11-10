// Menerapkan migrasi di supabase/migrations ke database Supabase (tanpa Docker).
import { spawnSync } from 'node:child_process'
import { requireEnv } from './lib.mjs'

requireEnv('SUPABASE_DB_URL')
const result = spawnSync('npx', ['--yes', 'supabase@latest', 'db', 'push', '--db-url', process.env.SUPABASE_DB_URL, '--yes'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
