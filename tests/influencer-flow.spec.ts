import { test, expect } from '@playwright/test';

const INFLUENCER_PHONE = '8095550004';
const CONSUMER_PHONE = '8095550001';
const BUSINESS_PHONE = '8095550002';
const PASSWORD = 'password123';

test.describe('Influencer Functionality', () => {
    test.slow(); // Mark tests as slow to increase timeout

    test('Consumer sees Universal offers but NOT Influencer-Only offers', async ({ page }) => {
        // 1. Login as Consumer
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(CONSUMER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Consumer goes to home page. Wait for it.
        await expect(page).toHaveURL(/localhost:3000\/?$/);

        // 2. Go to Barter Club
        await page.goto('/creador/intercambios');
        await page.waitForLoadState('networkidle');

        // 3. Verify "How it works" section exists
        await expect(page.getByText('¿Cómo funciona?')).toBeVisible();

        // 4. Verify CTA exists
        await expect(page.getByText('Verificarme como Influencer')).toBeVisible();

        // 5. Verify NO "Exclusive" badge offers
        // Note: We use .count() which returns immediately, so we might need to wait for offers to load first.
        // Let's wait for at least one offer or the "No offers" message.
        // But since we have data, we expect offers.
        await expect(page.locator('h3').first()).toBeVisible(); // Wait for any offer title
        const exclusiveBadges = await page.locator('text=EXCLUSIVO').count();
        expect(exclusiveBadges).toBe(0);
    });

    test('Influencer sees Exclusive offers and can apply', async ({ page }) => {
        // 1. Login as Influencer
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(INFLUENCER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Influencer goes to barter page
        await expect(page).toHaveURL(/.*\/creador\/intercambios/);

        // 2. Wait for page to load
        await page.waitForLoadState('networkidle');

        // 3. Verify Exclusive badge is visible
        await expect(page.locator('text=EXCLUSIVO').first()).toBeVisible({ timeout: 10000 });

        // 4. Apply to an offer
        const applyButtons = await page.getByRole('button', { name: 'Aplicar' }).count();
        if (applyButtons > 0) {
            await page.getByRole('button', { name: 'Aplicar' }).first().click();
            await expect(page.getByText('Solicitud enviada con éxito!')).toBeVisible();
        }
    });

    test('Influencer Verification Flow', async ({ page }) => {
        // 1. Login as Consumer (who wants to be influencer)
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(CONSUMER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Consumer goes to home
        await expect(page).toHaveURL(/localhost:3000\/?$/);

        // 2. Go to Verification Page
        await page.goto('/creador/perfil/verificacion');

        // 3. Fill Step 1
        await page.getByPlaceholder('@tu_usuario').fill('@test_wannabe');
        await page.getByRole('button', { name: 'Continuar' }).click();

        // 4. Fill Step 2 (Mock Upload)
        await page.getByText('Toca para subir imagen').click();
        await page.getByRole('button', { name: 'Enviar Solicitud' }).click();

        // 5. Verify Success
        await expect(page.getByText('¡Solicitud Enviada!')).toBeVisible();
    });

    test('Business can create Influencer-Only offer', async ({ page }) => {
        // 1. Login as Business
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(BUSINESS_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Business goes to dashboard
        await expect(page).toHaveURL(/.*\/negocio\/panel/);

        // 2. Go to Barter Management
        await page.goto('/negocio/intercambios');

        // 3. Open Create Modal
        await page.getByRole('button', { name: 'Crear Oferta' }).click();

        // 4. Fill Form
        const uniqueName = `Test Exclusive Offer ${Date.now()}`;
        await page.getByPlaceholder('Ej. Corte VIP').fill(uniqueName);
        await page.getByPlaceholder('1500').fill('2000');
        await page.locator('textarea[name="description"]').fill('Exclusive for top influencers');

        // 5. Select "Solo Influencers"
        await page.getByLabel('Solo Influencers').check();

        // 6. Submit
        await page.getByRole('button', { name: 'Publicar Oferta' }).click();

        // 7. Verify modal closed and item appears
        await expect(page.getByRole('dialog')).not.toBeVisible();
        await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
    });

});
