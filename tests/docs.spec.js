import { test, expect } from 'playwright-test-coverage';

test("about page", async ({ page }) => {
    await page.goto('http://localhost:5173/docs');
})