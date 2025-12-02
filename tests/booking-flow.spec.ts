import { test, expect } from '@playwright/test';

test('User can complete a booking flow', async ({ page }) => {
    test.setTimeout(90000); // Increased timeout
    // Mock time to Nov 1, 2025 10:00:00 (Saturday)
    await page.clock.install({ time: new Date('2025-11-01T10:00:00') });

    // 1. Navigate to Home
    await page.goto('/');
    await expect(page).toHaveTitle(/Bookeo/);

    // 2. Find a "Reservar" button and click it.
    // The video feed has "Reservar Ahora" buttons.
    // We'll click the first one.
    const bookButton = page.getByRole('link', { name: 'Reservar Ahora' }).first();

    // Verify it's the correct link
    await expect(bookButton).toBeVisible({ timeout: 10000 });
    const href = await bookButton.getAttribute('href');
    await expect(bookButton).toHaveAttribute('href', /\/reservar\/[\w-]+/);

    // Click and wait for navigation
    await bookButton.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // 3. Verify we are on the booking page
    await page.waitForURL(/\/reservar\//, { timeout: 20000 });

    // Wait for the page to be ready
    await expect(page.getByRole('heading', { name: 'Test Barbershop' })).toBeVisible({ timeout: 15000 });

    // 4. Select a Service
    // Wait for service cards to appear directly
    const serviceCard = page.locator('div').filter({ hasText: 'Test Haircut' }).filter({ hasText: 'RD$' }).first();
    await expect(serviceCard).toBeVisible({ timeout: 20000 });
    await serviceCard.click();

    // 5. Verify we are on the Date step (with increased timeout for step transition)
    await expect(page.getByText('Selecciona Fecha')).toBeVisible({ timeout: 15000 });

    // The DayPicker should have today (Nov 1, 2025) selected by default
    // Slots should already be loading for that date
    // We'll proceed directly to slot selection

    // 6. Select a Time Slot
    // Select the first available slot dynamically (slots are in format like "10:00 AM")
    const slotButton = page.getByRole('button', { name: /\d{1,2}:\d{2} (AM|PM)/ }).first();
    await expect(slotButton).toBeVisible({ timeout: 15000 });
    const slotTime = await slotButton.textContent();
    // console.log(`[Test] Selected slot: ${slotTime}`);
    await slotButton.click();

    // 7. Verify we are on the Confirmation step
    await expect(page.getByText('Resumen de Cita')).toBeVisible({ timeout: 15000 });
    // Use regex to match service name, case insensitive or partial
    await expect(page.getByText(/Test Haircut/i)).toBeVisible();
    if (slotTime) {
        await expect(page.getByText(slotTime)).toBeVisible();
    }

    // 8. Fill in Phone Number (Optional for mock, but good practice)
    await page.getByPlaceholder('809-000-0000').fill('8095555555');

    // 9. Confirm Booking
    await page.getByRole('button', { name: 'Confirmar y Pagar en Local' }).click();

    // 10. SMS Verification
    await expect(page.getByText('Verifica tu Celular')).toBeVisible({ timeout: 15000 });
    // Fill 4-digit code
    await page.locator('input[type="text"]').nth(0).fill('1');
    await page.locator('input[type="text"]').nth(1).fill('2');
    await page.locator('input[type="text"]').nth(2).fill('3');
    await page.locator('input[type="text"]').nth(3).fill('4');

    await page.getByRole('button', { name: 'Verificar y Finalizar' }).click();

    // 11. Verify Success Message
    // The processing animation is brief (2s), so we skip checking for it and go straight to success
    await expect(page.getByText('¡Reserva Confirmada!')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Te hemos enviado los detalles por WhatsApp.')).toBeVisible();
});
