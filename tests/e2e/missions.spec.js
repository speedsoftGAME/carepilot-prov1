const { test, expect } = require('@playwright/test')

async function login(page) {
  await page.goto('/login')
  await page.fill('[placeholder="admin@carepilot.fr"]', 'admin@carepilot.fr')
  await page.fill('[placeholder="••••••••"]', 'password123')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
}

test.describe('Missions', () => {
  test.beforeEach(login)

  test('affiche le panneau missions par défaut', async ({ page }) => {
    await expect(page.getByText(/missions/i).first()).toBeVisible()
  })

  test('affiche les missions du seed (au moins 1)', async ({ page }) => {
    // Attendre le chargement
    await page.waitForTimeout(1000)
    const missions = page.locator('[data-testid="mission-card"], .mission-row, tr').first()
    await expect(missions).toBeVisible()
  })

  test('ouvre la modale de nouvelle mission via le bouton +', async ({ page }) => {
    const btn = page.getByRole('button', { name: /nouvelle mission|\+ mission/i })
    await expect(btn).toBeVisible()
    await btn.click()
    // La modale doit apparaître avec un champ patient
    await expect(page.getByText(/patient/i).first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Patients', () => {
  test.beforeEach(login)

  test('navigue vers patients et affiche la liste', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click()
    await expect(page.getByText('Dossiers Patients')).toBeVisible()
    // Attendre le chargement de la liste
    await page.waitForTimeout(1000)
  })

  test('ouvre le formulaire de création de patient', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click()
    await page.getByRole('button', { name: /nouveau patient/i }).click()
    await expect(page.getByText('Nouveau patient')).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Établissements', () => {
  test.beforeEach(login)

  test('affiche les établissements du seed', async ({ page }) => {
    await page.getByRole('button', { name: /Établissements/i }).click()
    await expect(page.getByText('Établissements')).toBeVisible()
    await page.waitForTimeout(1000)
    // CHU Grenoble devrait être présent (seed data)
    await expect(page.getByText('CHU Grenoble')).toBeVisible({ timeout: 5000 })
  })
})
