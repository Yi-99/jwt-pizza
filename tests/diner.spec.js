import { test, expect } from 'playwright-test-coverage';

test('purchase after register', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      const registerReq = { name: 'pizza diner', email: 'p@jwt.com', password: 'diner' };
      const registerRes = { user: { id: 3, name: 'pizza diner', email: 'p@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    } else if (route.request().method() === 'DELETE') {
      const logoutRes = { message: 'logout successful' };
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: logoutRes });
    } else if (route.request().method() === 'PUT') {
      const loginReq = { email: 'p@jwt.com', password: 'diner' };
      const loginRes = { user: { id: 3, name: "pizza diner", email: 'p@jwt.com', roles: [{ role: 'diner' }]}, token: 'abcdef' };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

  // register
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.locator('#navbar-dark')).toContainText('Register');
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('pizza diner');
  await page.getByPlaceholder('Full name').press('Tab');
  await page.getByPlaceholder('Email address').fill('p@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByText("How have you lived this long without having a pizza? Buy one now!")).toBeVisible();
})