const { test, expect } = require('@playwright/test');

test.describe('Public Booking Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to a known barber shop slug (using test-slug as placeholder)
        await page.goto('/test-barberia');
    });

    test('should navigate through the booking steps', async ({ page }) => {
        // Step 1: Services
        await expect(page.locator('h2')).toContainText(/Elección/i);
        const firstService = page.locator('section[key="step1"] div.grid div').first();
        await expect(firstService).toBeVisible();
        await firstService.click();

        // Step 2: Barbero
        await expect(page.locator('h2')).toContainText(/Maestro/i);
        const firstBarber = page.locator('section[key="step2"] button').first();
        await expect(firstBarber).toBeVisible();
        await firstBarber.click();

        // Step 3: Date & Time
        await expect(page.locator('h2')).toContainText(/Momentum/i);
        // Select first available date (if any)
        const firstDate = page.locator('button[aria-label^="Seleccionar"]').first();
        if (await firstDate.isVisible()) {
            await firstDate.click();
        }

        // Step 4: Confirm (Final Step)
        await expect(page.locator('h2')).toContainText(/Culminación/i);

        // Check validation
        const confirmButton = page.locator('button:has-text("Confirmar Cita")');
        await expect(confirmButton).toBeDisabled();

        // Fill details
        await page.placeholder('Nombre Completo').fill('Test User');
        await page.placeholder('Email').fill('test@example.com');

        // Button should be enabled now
        await expect(confirmButton).toBeEnabled();
    });

    test('should show empty states when no services are available', async ({ page }) => {
        // This would require mocking API responses or visiting a specific "empty" shop
        // For now, we skip or just document how to test it.
    });
});
