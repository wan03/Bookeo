import { test, expect } from '@playwright/test';

const CONSUMER_PHONE = '8095550001';
const PASSWORD = 'password123';

test.describe('Enhanced Booking Flow', () => {
    test.setTimeout(60000);
    test.beforeEach(async ({ page }) => {
        // Mock time to Nov 1, 2025 10:00:00 (Saturday) to avoid month boundary issues
        await page.clock.install({ time: new Date('2025-11-01T10:00:00') });

        // Login as Consumer
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(CONSUMER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();
        await page.waitForURL('/', { timeout: 10000 });
        await expect(page).toHaveURL('/');
    });

    test('Book a service with real availability', async ({ page }) => {
        // 1. Navigate to a business (assuming ID 1 or similar from seed, or find via UI)
        // 1. Navigate to a business
        // We'll click the first "Reservar Ahora" button on home
        const bookButton = page.getByRole('link', { name: 'Reservar Ahora' }).first();
        const href = await bookButton.getAttribute('href');
        if (href) {
            await page.goto(href);
            await page.waitForLoadState('networkidle');
        } else {
            await bookButton.click();
        }

        // 2. Select Service
        // Wait for services to load - check for the tab button
        await expect(page.getByRole('button', { name: 'Servicios' })).toBeVisible({ timeout: 10000 });

        // Click on the service card (div containing service name and price)
        const serviceCard = page.locator('div').filter({ hasText: 'Test Haircut' }).filter({ hasText: 'RD$' }).first();
        await serviceCard.click();

        // 3. Select Date & Time (with increased timeout for step transition)
        await expect(page.getByText('Selecciona Fecha')).toBeVisible({ timeout: 10000 });

        // The DayPicker should have today (Nov 1, 2025) selected by default
        // Proceed directly to slot selection

        // Select a time slot (ensure at least one is visible)
        const timeSlot = page.getByRole('button', { name: /^\d{1,2}:\d{2} (AM|PM)$/ }).first();
        await expect(timeSlot).toBeVisible();
        await timeSlot.click();

        // 4. Confirm
        await expect(page.getByText('Resumen de Cita')).toBeVisible();
        await page.getByRole('button', { name: 'Confirmar y Pagar en Local' }).click();

        // 5. SMS Verification
        await expect(page.getByText('Verifica tu Celular')).toBeVisible();
        // Fill 4-digit code
        await page.locator('input[type="text"]').nth(0).fill('1');
        await page.locator('input[type="text"]').nth(1).fill('2');
        await page.locator('input[type="text"]').nth(2).fill('3');
        await page.locator('input[type="text"]').nth(3).fill('4');

        await page.getByRole('button', { name: 'Verificar y Finalizar' }).click();

        // 6. Success
        await expect(page.getByText('¡Reserva Confirmada!')).toBeVisible({ timeout: 15000 });
    });
});
