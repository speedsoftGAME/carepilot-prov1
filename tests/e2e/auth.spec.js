const { test, expect } = require('@playwright/test')

test.describe('Authentification', () => {
  test('landing page affiche le titre et les CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('CarePilot Pro').first()).toBeVisible()
    await expect(page.getByText(/régulation ambulancière/i).first()).toBeVisible()
    await expect(page.getByText('Essai gratuit').first()).toBeVisible()
  })

  test('page de login est accessible depuis la landing', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Connexion').first().click()
    await expect(page).toHaveURL('/login')
  })

  test('login avec mauvais mot de passe affiche une erreur', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[placeholder="admin@carepilot.fr"]', 'mauvais@email.fr')
    await page.fill('[placeholder="••••••••"]', 'mauvaismdp')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByText(/incorrect|erreur/i).first()).toBeVisible()
  })

  test('login avec les bons identifiants redirige vers le dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[placeholder="admin@carepilot.fr"]', 'admin@carepilot.fr')
    await page.fill('[placeholder="••••••••"]', 'password123')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('lien "Mot de passe oublié" mène à la page correspondante', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('Mot de passe oublié ?').click()
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.getByText('Mot de passe oublié ?').first()).toBeVisible()
  })

  test('page forgot-password accepte un email et affiche la confirmation', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.fill('[type="email"]', 'quelquun@example.fr')
    await page.getByRole('button', { name: 'Envoyer le lien' }).click()
    await expect(page.getByText(/email envoyé|lien a été envoyé/i)).toBeVisible({ timeout: 8000 })
  })

  test('route protégée redirige vers login si non connecté', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('déconnexion fonctionne', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[placeholder="admin@carepilot.fr"]', 'admin@carepilot.fr')
    await page.fill('[placeholder="••••••••"]', 'password123')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
    // Déconnexion via bouton header
    await page.getByTitle('Déconnexion').click()
    await expect(page).toHaveURL(/login/)
  })
})
