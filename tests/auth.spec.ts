import { test, expect } from '@playwright/test';

const OWNER_PHONE = '8095550002';
const OWNER_EMAIL = '8095550002@phone.bookeo.com';
const PASSWORD = 'password123';

test.describe('Authentication Flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth');
    });

    test('Default view is Phone Login', async ({ page }) => {
        // Verify Phone tab is active/visible
        await expect(page.getByRole('button', { name: 'Teléfono' })).toHaveClass(/text-blue-600/);
        // Verify Phone input is visible
        await expect(page.getByPlaceholder('809-555-5555')).toBeVisible();
        // Verify Email input is NOT visible (initially)
        await expect(page.getByPlaceholder('tu@email.com')).not.toBeVisible();
    });

    test('Can switch to Email Login', async ({ page }) => {
        await page.getByRole('button', { name: 'Email' }).click();

        // Verify Email input is visible
        await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
        // Verify Phone input is NOT visible (in login mode)
        await expect(page.getByPlaceholder('809-555-5555')).not.toBeVisible();
    });

    test('Login with Phone Number', async ({ page }) => {
        await page.getByPlaceholder('809-555-5555').fill(OWNER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Wait for navigation to complete
        await page.waitForURL(/\/negocio\/panel/, { timeout: 10000 });
        // Should redirect to business dashboard for owner
        await expect(page).toHaveURL(/\/negocio\/panel/);
    });

    test('Login with Email', async ({ page }) => {
        await page.getByRole('button', { name: 'Email' }).click();
        await page.getByPlaceholder('tu@email.com').fill(OWNER_EMAIL);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Wait for navigation to complete
        await page.waitForURL(/\/negocio\/panel/, { timeout: 10000 });
        // Should redirect to business dashboard for owner
        await expect(page).toHaveURL(/\/negocio\/panel/);
    });

    test('Signup with Email requires Phone', async ({ page }) => {
        await page.getByRole('button', { name: 'Email' }).click();
        await page.getByRole('button', { name: 'Registrarse' }).click();

        // Verify Phone input appears and is required
        const phoneInput = page.getByPlaceholder('809-555-5555');
        await expect(phoneInput).toBeVisible();

        // Submit with invalid phone to trigger custom validation (bypass native required)
        await page.getByPlaceholder('tu@email.com').fill('newuser@test.com');
        await page.getByLabel('Contraseña').fill('password123');
        await page.getByPlaceholder('Juan Pérez').fill('New User');
        await page.getByPlaceholder('809-555-5555').fill('123'); // Invalid length

        // Click submit to trigger validation
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();

        // Should show error or validation (HTML5 validation or custom error)
        // Since we use custom error state:
        await expect(page.getByText('El número de teléfono es obligatorio')).toBeVisible();
    });
});
