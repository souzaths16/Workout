import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4173', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4173/Workout/', reuseExistingServer: true, timeout: 60_000 },
  reporter: [['list']]
})
