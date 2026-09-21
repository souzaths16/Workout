import { test, expect } from '@playwright/test'

// Training weeks are anchored to the program's start weekday, not to the calendar Monday.
const START = new Date('2026-09-20T09:00:00') // Sunday: program start, day 0 -> Braços A
const REST_DAY = new Date('2026-09-26T09:00:00') // day 6 of that same week -> default rest/row day

test('on a rest/row day, "Treinar hoje" lets you pull a lift day forward', async ({ page }) => {
  await page.clock.install({ time: START })
  await page.goto('/Workout/') // first load sets settings.startDate to today (Sunday)
  await expect(page.getByRole('heading', { name: 'Braços A' })).toBeVisible()

  await page.clock.setFixedTime(REST_DAY)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Remo leve', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Treinar hoje' }).click()
  await expect(page.getByText('Qual treino você quer fazer hoje?')).toBeVisible()
  await page.getByRole('button', { name: /Braços A/ }).click()

  await expect(page.getByRole('heading', { name: 'Braços A' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Começar treino' })).toBeVisible()

  await page.getByRole('button', { name: 'Semana', exact: true }).click()
  await expect(page.getByText('trocado').first()).toBeVisible()
  const sab = page.locator('text=Sáb').locator('..')
  await expect(sab.getByText('Braços A')).toBeVisible()
})
