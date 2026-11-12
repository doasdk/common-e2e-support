import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './scenarios',
  workers: 1,
  retries: 0,
  reporter: 'json',
  use: { browserName: 'chromium' }
})
