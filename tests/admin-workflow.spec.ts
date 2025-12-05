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
            await expect(page.getByText('Admin Dashboard')).toBeVisible()
            await expect(page.getByText('Bookeo Platform Control')).toBeVisible()

            // Verify sidebar navigation
            await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Users' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Businesses' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Bookings' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Influencers' })).toBeVisible()
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
            await expect(page.getByText('Total Revenue')).toBeVisible()
            await expect(page.getByText('Total Bookings')).toBeVisible()
            await expect(page.getByText('Active Users')).toBeVisible()
            await expect(page.getByText('Pending Verifications')).toBeVisible()
            await expect(page.getByText('Total Businesses')).toBeVisible()
            await expect(page.getByText('Completed Bookings')).toBeVisible()
            await expect(page.getByText('Barter Offers')).toBeVisible()
            await expect(page.getByText('Average Rating')).toBeVisible()

            // Verify at least one stat card has a numeric value (not loading)
            const activeUsersCard = page.locator('text=Active Users').locator('..')
            await expect(activeUsersCard).toContainText(/\d+/)
        })

        test('Recent activity feed is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible()
            await expect(page.getByText('Last 7 days of platform events')).toBeVisible()
        })
    })

    test.describe('Business Verification Workflow', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsAdmin(page)
        })

        test('Admin can navigate to businesses page', async ({ page }) => {
            await page.goto('/admin')
            await page.getByRole('link', { name: 'Businesses' }).click()

            await expect(page).toHaveURL('/admin/businesses')
            await expect(page.getByText('Business Management')).toBeVisible()
            await expect(page.getByText('Verify and manage service providers')).toBeVisible()
        })

        test('Admin can filter businesses by verification status', async ({ page }) => {
            await page.goto('/admin/businesses')

            // Test filter tabs
            await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Verified', exact: true })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Unverified' })).toBeVisible()

            // Click unverified filter
            await page.getByRole('button', { name: 'Unverified' }).click()
            await page.waitForLoadState('networkidle')

            // URL should update
            await expect(page).toHaveURL(/filter=unverified/)
        })

        test('Admin can view business details in table', async ({ page }) => {
            await page.goto('/admin/businesses')

            // Wait for table to load
            await page.waitForSelector('table', { timeout: 10000 })

            // Check if table headers are present
            await expect(page.locator('th').filter({ hasText: 'Business' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Owner' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Category' })).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Status' })).toBeVisible()
        })

        test('Admin can verify a business', async ({ page }) => {
            await page.goto('/admin/businesses?filter=unverified')
            await page.waitForLoadState('networkidle')

            // Look for a Verify button
            const verifyButton = page.getByRole('button', { name: 'Verify' }).first()

            if (await verifyButton.isVisible()) {
                // Handle the alert dialog
                page.on('dialog', dialog => dialog.accept())

                await verifyButton.click()

                // Wait for the action to complete
                await page.waitForLoadState('networkidle')

                // The button should change to "Unverify" or disappear
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
            await expect(page.getByText('Dashboard Overview')).toBeVisible()

            // Users
            await page.getByRole('link', { name: 'Users' }).click()
            await page.waitForURL('**/admin/users')
            await expect(page).toHaveURL('/admin/users')

            // Businesses
            await page.getByRole('link', { name: 'Businesses' }).click()
            await page.waitForURL('**/admin/businesses')
            await expect(page).toHaveURL('/admin/businesses')

            // Bookings
            await page.getByRole('link', { name: 'Bookings' }).click()
            await page.waitForURL('**/admin/bookings')
            await expect(page).toHaveURL('/admin/bookings')

            // Influencers
            await page.getByRole('link', { name: 'Influencers' }).click()
            await page.waitForURL('**/admin/influencers')
            await expect(page).toHaveURL('/admin/influencers')

            // Settings
            await page.getByRole('link', { name: 'Settings' }).click()
            await page.waitForURL('**/admin/settings')
            await expect(page).toHaveURL('/admin/settings')

            // Back to Dashboard
            await page.getByRole('link', { name: 'Dashboard' }).click()
            await expect(page).toHaveURL('/admin')
        })

        test('Active navigation state is highlighted', async ({ page }) => {
            await page.goto('/admin')

            // Dashboard should be active (has gradient background)
            const dashboardLink = page.getByRole('link', { name: 'Dashboard' })
            await expect(dashboardLink).toHaveClass(/from-blue-600/)

            // Navigate to businesses
            await page.getByRole('link', { name: 'Businesses' }).click()

            // Businesses should now be active
            const businessesLink = page.getByRole('link', { name: 'Businesses' })
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
            await page.waitForSelector('text=Dashboard Overview')

            const loadTime = Date.now() - startTime

            // Should load in less than 3 seconds
            expect(loadTime).toBeLessThan(3000)
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
            await page.getByRole('link', { name: 'Bookings' }).click()

            await expect(page).toHaveURL('/admin/bookings')
            await expect(page.getByText('Booking Management')).toBeVisible()
            await expect(page.getByText('Monitor and manage platform appointments')).toBeVisible()
        })

        test('Admin can filter bookings by status', async ({ page }) => {
            await page.goto('/admin/bookings')

            // Test filter tabs
            await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Confirmed' })).toBeVisible()
            await expect(page.getByRole('button', { name: 'Cancelled' })).toBeVisible()

            // Click confirmed filter
            await page.getByRole('button', { name: 'Confirmed' }).click()
            await page.waitForLoadState('networkidle')

            // URL should update
            await expect(page).toHaveURL(/filter=confirmed/)
        })

        test('Admin can view booking details in table', async ({ page }) => {
            await page.goto('/admin/bookings')

            // Wait for table to load
            await page.waitForSelector('table', { timeout: 10000 })

            // Check if table headers are present
            await expect(page.getByText('Booking Details')).toBeVisible()
            await expect(page.getByText('Customer')).toBeVisible()
            await expect(page.locator('th').filter({ hasText: 'Business' })).toBeVisible()
            await expect(page.getByText('Status')).toBeVisible()
            await expect(page.getByText('Amount')).toBeVisible()
        })

        test('Admin can cancel a booking', async ({ page }) => {
            await page.goto('/admin/bookings?filter=pending')
            await page.waitForLoadState('networkidle')

            // Look for a Cancel button
            const cancelButton = page.getByRole('button', { name: 'Cancel', exact: true }).first()

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
