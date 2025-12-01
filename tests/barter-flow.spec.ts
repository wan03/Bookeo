import { test, expect } from '@playwright/test';

const INFLUENCER_PHONE = '8095550004';
const PASSWORD = 'password123';

test('Influencer can apply for a barter offer', async ({ page }) => {
    // 1. Login as Influencer
    await page.goto('/auth');
    await page.getByPlaceholder('809-555-5555').fill(INFLUENCER_PHONE);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Wait for redirect to influencer dashboard
    await page.waitForURL(/\/creador\/intercambios/);

    // 2. Verify Page Title
    await expect(page.getByRole('heading', { name: 'Club de Canjes' })).toBeVisible();

    // 3. Find an "Aplicar" button and click it
    // We'll click the first one we find
    const applyButton = page.getByRole('button', { name: 'Aplicar' }).first();
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    // 4. Verify Loading State (Optional, but good)
    // The button text changes to "Enviando..."
    await expect(page.getByRole('button', { name: 'Enviando...' })).toBeVisible();

    // 5. Verify Success Message
    // "✅ Solicitud enviada con éxito!"
    await expect(page.getByText('✅ Solicitud enviada con éxito!')).toBeVisible();
});
