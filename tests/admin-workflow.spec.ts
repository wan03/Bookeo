import { test, expect, Page } from '@playwright/test'

const ADMIN_PHONE = '8095550005'
const OWNER_PHONE = '8095550002'
const PASSWORD = 'password123'

export async function loginAsAdmin(page: Page) {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/auth')
    await page.getByPlaceholder('809-555-5555').fill(ADMIN_PHONE)
    await page.getByLabel('Contraseña').fill(PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Wait for redirect to home page or business panel
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/negocio/panel', { timeout: 20000 })
    await page.waitForLoadState('domcontentloaded')
}

test.describe('Admin Workflow', () => {
    test.setTimeout(90000) // Increase timeout for admin operations

    test.describe('Authentication & Access Control', () => {
        test('Admin can login and access admin dashboard', async ({ page }) => {
            await loginAsAdmin(page)

            // Navigate to admin dashboard
            await page.goto('/admin')
            await expect(page).toHaveURL('/admin', { timeout: 10000 })

            // Verify admin layout elements
            await expect(page.getByText('Panel Administrativo')).toBeVisible()
            await expect(page.getByText('Control de Plataforma Bookeo')).toBeVisible()

            // Verify sidebar navigation
            await expect(page.getByRole('link', { name: 'Panel' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Usuarios' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Negocios' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Reservas' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Influenciadores' })).toBeVisible()
        })

        test('Non-admin users are blocked from admin routes', async ({ page }) => {
            // Login as business owner (not admin)
            await page.goto('/auth')
            await page.getByPlaceholder('809-555-5555').fill(OWNER_PHONE)
            await page.getByLabel('Contraseña').fill(PASSWORD)
            await page.getByRole('button', { name: 'Entrar' }).click()

            await page.waitForLoadState('networkidle')

            // Attempt to navigate to admin
            await page.goto('/admin')

            // Should be redirected away from /admin
            await expect(page).not.toHaveURL('/admin', { timeout: 10000 })
        })
    })

    test.describe('Dashboard Overview', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
            await page.goto('/admin')
            await page.waitForLoadState('networkidle')
        })

        test('Dashboard displays all KPI metrics', async ({ page }) => {
            // Verify stat card titles are present
            await expect(page.getByText('Ingresos Totales')).toBeVisible()
            await expect(page.getByText('Reservas Totales', { exact: true })).toBeVisible()
            await expect(page.getByText('Usuarios Activos')).toBeVisible()
            await expect(page.getByText('Verificaciones Pendientes')).toBeVisible()
            await expect(page.getByText('Negocios Totales')).toBeVisible()
            await expect(page.getByText('Reservas Completadas')).toBeVisible()
            await expect(page.getByText('Ofertas de Canje')).toBeVisible()
            await expect(page.getByText('Calificación Promedio')).toBeVisible()

            // Verify at least one stat card has a numeric value (not loading)
            const activeUsersCard = page.locator('text=Usuarios Activos').locator('..')
            await expect(activeUsersCard).toContainText(/\d+/)
        })

        test('Recent activity feed is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Actividad Reciente' })).toBeVisible()
            await expect(page.getByText('Últimos 7 días de eventos de la plataforma')).toBeVisible()
        })
    })

    test.describe('Business Verification Workflow', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
        })

        test('Admin can navigate to businesses page', async ({ page }) => {
            await page.goto('/admin')
            await page.getByRole('link', { name: 'Negocios' }).click()

            await expect(page).toHaveURL('/admin/negocios')
            await expect(page.getByText('Gestión de Negocios')).toBeVisible()
            await expect(page.getByText('Verificar y gestionar proveedores de servicios')).toBeVisible()
        })

        test('Admin can filter businesses by verification status', async ({ page }) => {
            await page.goto('/admin/negocios')

            // Test filter tabs
            await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Verificados', exact: true })).toBeVisible()
            await expect(page.getByRole('button', { name: 'No verificados' })).toBeVisible()

            // Click unverified filter
            await page.getByRole('button', { name: 'No verificados' }).click()
            await page.waitForLoadState('networkidle')

            // URL should update
            await expect(page).toHaveURL(/filter=unverified/)
        })

        test('Admin can view business details in table', async ({ page }) => {
            await page.goto('/admin/negocios')

            // Wait for table to load
            await page.waitForSelector('table', { timeout: 10000 })

            // Check if table headers are present
            await expect(page.locator('th').filter({ hasText: 'Negocio' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Dueño' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Categoría' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Estado' })).toBeVisible()
        })

        test('Admin can verify a business', async ({ page }) => {
            await page.goto('/admin/negocios?filter=unverified')
            await page.waitForLoadState('networkidle')

            // Look for a Verify button (Verificar)
            const verifyButton = page.getByRole('button', { name: 'Verificar' }).first()

            if (await verifyButton.isVisible()) {
                // Handle the alert dialog
                page.on('dialog', dialog => dialog.accept())

                await verifyButton.click()

                // Wait for the action to complete
                await page.waitForLoadState('networkidle')

                // The button should change to "Desverificar" or disappear
                await expect(verifyButton).not.toBeVisible({ timeout: 10000 })
            }
        })
    })

    test.describe('Navigation Between Pages', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
            await page.goto('/admin')
            await page.waitForLoadState('networkidle')
        })

        test('Admin can navigate between all sections', async ({ page }) => {
            // Dashboard
            await expect(page).toHaveURL('/admin')
            await expect(page.getByText('Resumen del Panel')).toBeVisible()

            // Users
            await page.getByRole('link', { name: 'Usuarios' }).click()
            await page.waitForURL('**/admin/usuarios')
            await expect(page).toHaveURL('/admin/usuarios')

            // Businesses
            await page.getByRole('link', { name: 'Negocios' }).click()
            await page.waitForURL('**/admin/negocios')
            await expect(page).toHaveURL('/admin/negocios')

            // Bookings
            await page.getByRole('link', { name: 'Reservas' }).click()
            await page.waitForURL('**/admin/reservas')
            await expect(page).toHaveURL('/admin/reservas')

            // Influencers
            await page.getByRole('link', { name: 'Influenciadores' }).click()
            await page.waitForURL('**/admin/influenciadores')
            await expect(page).toHaveURL('/admin/influenciadores')

            // Settings
            await page.getByRole('link', { name: 'Configuración' }).click()
            await page.waitForURL('**/admin/configuracion')
            await expect(page).toHaveURL('/admin/configuracion')

            // Back to Dashboard
            await page.getByRole('link', { name: 'Panel' }).click()
            await expect(page).toHaveURL('/admin')
        })

        test('Active navigation state is highlighted', async ({ page }) => {
            await page.goto('/admin')

            // Dashboard should be active (has gradient background)
            const dashboardLink = page.getByRole('link', { name: 'Panel' })
            await expect(dashboardLink).toHaveClass(/from-blue-600/)

            // Navigate to businesses
            await page.getByRole('link', { name: 'Negocios' }).click()

            // Businesses should now be active
            const businessesLink = page.getByRole('link', { name: 'Negocios' })
            await expect(businessesLink).toHaveClass(/from-blue-600/)
        })
    })

    test.describe('Performance & Data Loading', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
        })

        test('Dashboard loads within performance benchmark', async ({ page }) => {
            const startTime = Date.now()

            await page.goto('/admin')
            await page.waitForSelector('text=Resumen del Panel')

            const loadTime = Date.now() - startTime

            // Should load in less than 15 seconds (account for dev mode cold starts)
            expect(loadTime).toBeLessThan(15000)
        })

        test('No console errors on dashboard', async ({ page }) => {
            const consoleErrors: string[] = []

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text())
                }
            })

            await page.goto('/admin')
            await page.waitForLoadState('networkidle')

            // Filter out known non-critical errors (like hydration warnings in dev)
            const criticalErrors = consoleErrors.filter(
                error => !error.includes('Hydration') && !error.includes('sizes')
            )

            expect(criticalErrors).toHaveLength(0)
        })
    })

    test.describe('Booking Management Workflow', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
        })

        test('Admin can navigate to bookings page', async ({ page }) => {
            await page.goto('/admin')
            await page.getByRole('link', { name: 'Reservas' }).click()

            await expect(page).toHaveURL('/admin/reservas')
            await expect(page.getByText('Gestión de Reservas')).toBeVisible()
            await expect(page.getByText('Monitorear y gestionar citas de la plataforma')).toBeVisible()
        })

        test('Admin can filter bookings by status', async ({ page }) => {
            await page.goto('/admin/reservas')

            // Test filter tabs
            await expect(page.getByRole('button', { name: 'Todas' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Pendientes' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Confirmadas' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Canceladas' })).toBeVisible()

            // Click confirmed filter
            await page.getByRole('button', { name: 'Confirmadas' }).click()
            await page.waitForLoadState('networkidle')

            // URL should update
            await expect(page).toHaveURL(/filter=confirmed/)
        })

        test('Admin can view booking details in table', async ({ page }) => {
            await page.goto('/admin/reservas')

            // Wait for table to load
            await page.waitForSelector('table', { timeout: 10000 })

            // Check if table headers are present
            await expect(page.getByText('Detalles de Reserva')).toBeVisible()
            await expect(page.getByText('Cliente')).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Negocio' })).toBeVisible()
            await expect(page.getByText('Estado')).toBeVisible()
            await expect(page.getByText('Monto')).toBeVisible()
        })

        test('Admin can cancel a booking', async ({ page }) => {
            await page.goto('/admin/reservas?filter=pending')
            await page.waitForLoadState('networkidle')

            // Look for a Cancel button (Cancelar)
            const cancelButton = page.getByRole('button', { name: 'Cancelar', exact: true }).first()

            if (await cancelButton.isVisible()) {
                // Mock the prompt dialog
                page.on('dialog', async dialog => {
                    await dialog.accept('Test cancellation reason')
                })

                await cancelButton.click()

                // Wait for the action to complete
                await page.waitForLoadState('networkidle')

                // The button should disappear or row should be removed/updated
                // Since we filtered by pending, it should disappear from this view
                await expect(cancelButton).not.toBeVisible({ timeout: 10000 })
            }
        })
    })
})
