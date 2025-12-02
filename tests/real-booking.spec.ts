import { test, expect } from '@playwright/test';

const CONSUMER_PHONE = '8095550001';
const PASSWORD = 'password123';

test.describe('Enhanced Booking Flow', () => {
    test.setTimeout(90000); // Increased timeout
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
        // 1. Navigate to a business
        // We'll click the first "Reservar Ahora" button on home
        const bookButton = page.getByRole('link', { name: 'Reservar Ahora' }).first();
        await expect(bookButton).toBeVisible({ timeout: 10000 });

        // Click and wait for navigation
        await bookButton.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

        // 2. Select Service - wait for service cards to appear
        const serviceCard = page.locator('div').filter({ hasText: 'Test Haircut' }).filter({ hasText: 'RD$' }).first();
        await expect(serviceCard).toBeVisible({ timeout: 20000 });
        await serviceCard.click();

        // 3. Select Date & Time
        await expect(page.getByText('Selecciona Fecha')).toBeVisible({ timeout: 15000 });

        // Select a time slot
        const timeSlot = page.getByRole('button', { name: /^\d{1,2}:\d{2} (AM|PM)$/ }).first();
        await expect(timeSlot).toBeVisible({ timeout: 15000 });
        await timeSlot.click();

        // 4. Confirm
        await expect(page.getByText('Resumen de Cita')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Confirmar y Pagar en Local' }).click();

        // 5. SMS Verification
        await expect(page.getByText('Verifica tu Celular')).toBeVisible({ timeout: 10000 });
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
