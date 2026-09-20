import { test, expect } from '@playwright/test'

const SUNDAY = new Date('2026-09-20T09:00:00') // Sunday: default rest/row day

test('on a rest/row day, "Treinar hoje" lets you pull a lift day forward', async ({ page }) => {
  await page.clock.install({ time: SUNDAY })
  await page.goto('/Workout/')
  await expect(page.getByRole('heading', { name: 'Remo leve', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Treinar hoje' }).click()
  await expect(page.getByText('Qual treino você quer fazer hoje?')).toBeVisible()
  await page.getByRole('button', { name: /Braços A/ }).click()

  await expect(page.getByRole('heading', { name: 'Braços A' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Começar treino' })).toBeVisible()

  await page.getByRole('button', { name: 'Semana', exact: true }).click()
  await expect(page.getByText('trocado').first()).toBeVisible()
  const dom = page.locator('text=Dom').locator('..')
  await expect(dom.getByText('Braços A')).toBeVisible()
})
