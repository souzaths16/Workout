import { test, expect } from '@playwright/test'

const MONDAY = new Date('2026-09-21T08:00:00')

test('log a session, persist across reload, chart it, export, reset and import', async ({ page }) => {
  await page.clock.install({ time: MONDAY })
  await page.goto('/Workout/')
  await expect(page.getByRole('heading', { name: 'Braços A' })).toBeVisible()
  await page.screenshot({ path: 'test-results/01-hoje-preview.png', fullPage: true })

  await page.getByRole('button', { name: 'Começar treino' }).click()
  const done = page.getByRole('button', { name: 'concluir série' })
  await expect(done.first()).toBeVisible()
  const n = await done.count()
  expect(n).toBe(9) // week 1: 3 sets × 3 exercises
  for (let i = 0; i < n; i++) await done.nth(i).click()
  await page.screenshot({ path: 'test-results/02-hoje-session.png', fullPage: true })
  await page.getByRole('button', { name: 'Concluir treino' }).click()
  await expect(page.getByText('Treino concluído')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Treino concluído')).toBeVisible()

  await page.getByRole('button', { name: 'Semana', exact: true }).click()
  await expect(page.getByText('feito').first()).toBeVisible()
  await page.screenshot({ path: 'test-results/03-semana.png', fullPage: true })

  await page.getByRole('button', { name: 'Progresso' }).click()
  await expect(page.getByText('Melhor:')).toBeVisible()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/04-progresso.png', fullPage: true })

  await page.getByRole('button', { name: 'Ajustes' }).click()
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar JSON' }).click()])
  const file = await dl.path()
  expect(file).toBeTruthy()
  page.on('dialog', d => d.accept())
  await page.getByRole('button', { name: 'Apagar tudo' }).click()
  await page.getByRole('button', { name: 'Hoje', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Começar treino' })).toBeVisible()

  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.locator('input[type=file]').setInputFiles(file!)
  await page.getByRole('button', { name: 'Hoje', exact: true }).click()
  await expect(page.getByText('Treino concluído')).toBeVisible()
  await page.screenshot({ path: 'test-results/05-ajustes.png', fullPage: true })
})

test('"Estou dolorida" swaps the day and marks the week', async ({ page }) => {
  await page.clock.install({ time: MONDAY })
  await page.goto('/Workout/')
  await page.getByRole('button', { name: 'Estou dolorida' }).click()
  await page.getByRole('button', { name: 'Bíceps' }).click()
  await page.getByRole('button', { name: 'Trocar o treino de hoje' }).click()
  await expect(page.getByRole('heading', { name: 'Pernas A' })).toBeVisible()
  await page.getByRole('button', { name: 'Semana', exact: true }).click()
  await expect(page.getByText('trocado').first()).toBeVisible()
  await page.screenshot({ path: 'test-results/06-semana-swap.png', fullPage: true })
  await page.getByRole('button', { name: 'Barra fixa' }).click()
  await page.screenshot({ path: 'test-results/07-barra.png', fullPage: true })
})
