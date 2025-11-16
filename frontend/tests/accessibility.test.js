const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Acessibilidade Tia Dora', () => {
  test('Página principal deve ser acessível', async ({ page }) => {
    await page.goto('http://localhost:3000/tia-dora.html');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
