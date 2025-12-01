import { test, expect } from '@playwright/test';

const TEST_USERS = [
    { phone: '8095550001', password: 'password123', name: 'Test Consumer', role: 'consumer' },
    { phone: '8095550002', password: 'password123', name: 'Test Owner', role: 'business_owner' },
    { phone: '8095550003', password: 'password123', name: 'Test Staff', role: 'staff' },
    { phone: '8095550004', password: 'password123', name: 'Test Influencer', role: 'influencer' },
];

test.describe.serial('Setup Test Users', () => {
    for (const user of TEST_USERS) {
        test(`Create ${user.role} user`, async ({ page }) => {
            await page.goto('/auth');

            // Make sure we're on Phone tab (default)
            await expect(page.getByRole('button', { name: 'Teléfono' })).toBeVisible();

            // Switch to Signup
            await page.getByRole('button', { name: 'Registrarse' }).click();

            // Fill form
            await page.getByPlaceholder('Juan Pérez').fill(user.name);
            await page.getByPlaceholder('809-555-5555').fill(user.phone);
            await page.getByLabel('Contraseña').fill(user.password);

            // Select role
            const roleMap: Record<string, string> = {
                'consumer': 'Cliente',
                'business_owner': 'Negocio',
                'influencer': 'Creador',
                'staff': 'Cliente' // Staff will be manually assigned later
            };
            await page.getByRole('button', { name: roleMap[user.role] }).click();

            // Submit
            await page.getByRole('button', { name: 'Crear Cuenta' }).click();

            // Wait for redirect (should go to appropriate page based on role)
            await page.waitForURL(/\/(negocio|creador)?.*/, { timeout: 10000 });

            console.log(`✅ Created ${user.role}: ${user.phone}`);
        });
    }
});
