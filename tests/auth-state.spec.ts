import { test, expect, Page } from '@playwright/test'

const PHONE = '8095550001'
const PASSWORD = 'password123'

test.describe('Authentication State Verification', () => {
    test('Header updates correctly after login', async ({ page }) => {
        // Go to home page, verify initial state
        await page.goto('/')
        await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).toBeVisible()

        // Login
        await page.goto('/auth')
        await page.getByPlaceholder('809-555-5555').fill(PHONE)
        await page.getByLabel('Contraseña').fill(PASSWORD)
        await page.getByRole('button', { name: 'Entrar' }).click()

        // Wait for potential redirects to settle
        // Force navigation to home page to ensure we see the header
        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')

        // Verify "Iniciar Sesión" is GONE and user icon/link is present
        await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).not.toBeVisible()
        await expect(page.locator('a[href="/perfil"]')).toBeVisible()

        // Reload page to verify persistence
        await page.reload()
        await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).not.toBeVisible()
        await expect(page.getByRole('link', { name: '' }).filter({ has: page.locator('svg.lucide-user') })).toBeVisible()
    })
})
