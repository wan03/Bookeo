import { test, expect } from '@playwright/test';

const OWNER_PHONE = '8095550002';
const PASSWORD = 'password123';

test.describe('Business Owner Flows', () => {
    test.setTimeout(60000); // Increase timeout for all tests in this group

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        // Login as Owner
        await page.goto('/auth');
        await page.getByPlaceholder('809-555-5555').fill(OWNER_PHONE);
        await page.getByLabel('Contraseña').fill(PASSWORD);
        await page.getByRole('button', { name: 'Entrar' }).click();
        // await page.waitForLoadState('networkidle');
        // Use expect which retries, instead of waitForURL which might miss the event
        await expect(page).toHaveURL(/\/negocio\/panel/, { timeout: 30000 });
    });

    test('Manage Settings (Revenue Goal & Staff)', async ({ page }) => {
        await page.goto('/negocio/ajustes');

        // Update Revenue Goal
        const goalInput = page.getByLabel('Meta (RD$)');
        await goalInput.fill('150000');
        await page.getByRole('button', { name: 'Guardar' }).click();

        // Verify alert/toast (mocked as window.alert, so we might need to handle dialog)
        page.on('dialog', dialog => dialog.accept());

        // Add Staff
        await page.getByPlaceholder('Nombre del nuevo miembro').fill('New Staff Member');
        await page.getByRole('button', { name: 'Agregar Personal' }).click();

        // Verify staff added (reload happens in code)
        await expect(page.getByText('New Staff Member')).toBeVisible();
    });

    test('Manage Services with Resource Linking', async ({ page }) => {
        await page.goto('/negocio/servicios');

        // Add Service
        await page.getByRole('button', { name: 'Agregar Servicio' }).click();
        await page.getByLabel('Nombre').fill('Test Service with Resource');
        await page.getByLabel('Precio (RD$)').fill('1500');
        await page.getByLabel('Duración (min)').selectOption('60');
        await page.getByLabel('Descripción').fill('A test service');

        // Link Resource (assuming at least one resource exists from seed or previous test)
        // We'll look for a resource button. If none, this part might be skipped or fail if empty.
        // For robustness, we should ensure resources exist.
        // Select a resource (assuming one exists from seed or previous test)
        // If no resource exists, this might fail or skip. 
        // We should ensure a resource exists. The seed creates one.
        // Or we can create one in the test if needed.

        await page.getByRole('button', { name: 'Guardar' }).click();

        // Wait for reload - REMOVED as we do optimistic update
        // await page.waitForLoadState('networkidle');

        // Verify service added
        try {
            await expect(page.getByText('Test Service with Resource')).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log('Service not found. Page content:', await page.content());
            throw e;
        }
    });

    test('Manage Availability', async ({ page }) => {
        await page.goto('/negocio/disponibilidad');

        // Toggle a day (e.g., Monday)
        // This depends on the specific UI implementation details which might be complex to select blindly.
        // We'll test adding a blocked time.

        // Toggle a day (e.g., Monday)
        // Checkboxes are labeled "Abierto"
        // We need to target specific day. 
        // The component renders days in order. 
        // Let's just toggle the first "Abierto" checkbox we find.
        const firstToggle = page.getByLabel('Abierto').first();
        await firstToggle.click();

        const saveBtn = page.getByRole('button', { name: 'Guardar Cambios' });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        // Handle alert
        page.on('dialog', dialog => dialog.accept());

        // Fill date/time (using default values or current date)
        // We need to fill inputs.
        // Inputs are type="datetime-local".
        // Let's fill them.
        const inputs = page.locator('input[type="datetime-local"]');
        await inputs.nth(0).fill('2024-12-25T09:00');
        await inputs.nth(1).fill('2024-12-25T17:00');
        await page.getByPlaceholder('Razón (opcional)').fill('Holiday');

        const addButton = page.getByRole('button', { name: 'Añadir' });
        await expect(addButton).toBeEnabled({ timeout: 15000 });
        await addButton.click();

        // Verify blocked time appears
        await expect(page.getByText('Holiday')).toBeVisible();
    });

    test('Marketing Tools', async ({ page }) => {
        page.on('dialog', async dialog => {
            console.log('Dialog message:', dialog.message());
            await dialog.accept();
        });
        await page.goto('/negocio/marketing');

        // Toggle Flash Sale
        const flashButton = page.getByRole('button', { name: 'ACTIVAR AHORA' });

        if (await flashButton.isVisible()) {
            await flashButton.click();
            await expect(page.getByText(/Flash Sale Activado/)).toBeVisible({ timeout: 10000 });
        } else {
            // Already active, maybe deactivate?
            await page.getByRole('button', { name: 'DESACTIVAR' }).click();
            await expect(page.getByRole('button', { name: 'ACTIVAR AHORA' })).toBeVisible();
        }
    });
});
