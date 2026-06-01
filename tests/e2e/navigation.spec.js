const { test, expect } = require('@playwright/test')

async function login(page) {
  await page.goto('/login')
  await page.fill('[placeholder="admin@carepilot.fr"]', 'admin@carepilot.fr')
  await page.fill('[placeholder="••••••••"]', 'password123')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
}

test.describe('Navigation Dashboard', () => {
  test.beforeEach(login)

  test('la StatsBar affiche les compteurs', async ({ page }) => {
    await expect(page.getByText("Missions aujourd'hui")).toBeVisible()
    await expect(page.getByText('En cours')).toBeVisible()
    await expect(page.getByText("Véhicules dispo")).toBeVisible()
  })

  test('la TabBar contient les 15 onglets', async ({ page }) => {
    const tabs = ['Missions', 'Flotte', 'GPS', 'Carte', 'Pointeuse', 'Patients',
      'Établissements', 'Facturation', 'CA', 'Heures', 'Planning',
      'J+1', 'Impératifs', 'Alertes', 'Paramètres']
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab, 'i') })).toBeVisible()
    }
  })

  test('navigation vers Patients → affiche Dossiers Patients', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click()
    await expect(page.getByText('Dossiers Patients')).toBeVisible()
  })

  test('navigation vers Flotte → affiche la flotte', async ({ page }) => {
    await page.getByRole('button', { name: /Flotte/i }).click()
    await expect(page.getByText(/flotte|véhicule/i).first()).toBeVisible()
  })

  test('navigation vers Alertes → affiche Alertes Système', async ({ page }) => {
    await page.getByRole('button', { name: /Alertes/i }).click()
    await expect(page.getByText('Alertes Système')).toBeVisible()
  })

  test('navigation vers Impératifs → affiche Impératifs & Rappels', async ({ page }) => {
    await page.getByRole('button', { name: /Impératifs/i }).click()
    await expect(page.getByText('Impératifs & Rappels')).toBeVisible()
  })

  test('navigation vers Paramètres → affiche les onglets de config', async ({ page }) => {
    await page.getByRole('button', { name: /Paramètres/i }).click()
    await expect(page.getByText(/général|branding|paramètres/i).first()).toBeVisible()
  })

  test('navigation vers J+1 → affiche Planning J+1', async ({ page }) => {
    await page.getByRole('button', { name: /J\+1/i }).click()
    await expect(page.getByText('Planning J+1')).toBeVisible()
  })
})
