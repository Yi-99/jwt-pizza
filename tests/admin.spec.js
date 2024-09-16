import { test, expect } from 'playwright-test-coverage';

test("create and delete franchise after logging in as admin", async ({ page }) => {
  let getFranchiseRequests = 1;
  let getUserFranchiseRequests = 1;

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      const loginReq = { email: 'a@jwt.com', password: 'admin' };
      const loginRes = { user: { id: 3, name: "常用名字", email: 'a@jwt.com', roles: [{ role: 'admin' }]}, token: 'abcdef' };
      // expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (route.request().method() === 'POST') {
      const registerReq = { name: 'pizza franchisee', email: 'f@jwt.com', password: 'franchisee' };
      const registerRes = { user: { id: 3, name: 'Yirang Lim', email: 'f@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    } else if (route.request().method() === 'DELETE') {
      const logoutRes = { message: 'logout successful' };
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: logoutRes });
    }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'GET' && getFranchiseRequests === 1) {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
      getFranchiseRequests++;
    } else if (route.request().method() === 'GET' && getFranchiseRequests === 2) {
      const getAllFranRes = [{ name: "pizza", stores: [], id: 1, admins: [{ id: 3, name: "常用名字", email: "a@jwt.com" }] }]
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ status: 200, contentType: 'application/json', json: getAllFranRes });
    } else if (route.request().method() === 'POST') {
      const createFranReq = { admins: [{ email: "a@jwt.com" }], name: "pizza", stores: [] };
      const createFranRes = { name: "pizza", admins: [{ email: 'a@jwt.com', id: 3, name: 'pizza franchisee' }], id: 1, stores: [] };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(createFranReq);
      await route.fulfill({ json: createFranRes });
    }
  })

  await page.route('*/**/api/franchise/*', async (route) => {
    if (route.request().method() === 'GET') {
      const userId = route.request().url().split('/').pop();
      const getFranRes = [];
      getUserFranchiseRequests++;
      await route.fulfill({ json: getFranRes });
    }
  })

  await page.route('*/**/api/franchise/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      const franchiseId = route.request().url().split('/').pop();
      const deleteFranRes = { message: 'franchise deleted' };
      await route.fulfill({ json: deleteFranRes });
    }
  })

  await page.goto('http://localhost:5173/');

  // register f@jwt.com as franchisee
  await expect(page.locator('#navbar-dark')).toContainText('Register');
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('pizza franchisee');
  await page.getByPlaceholder('Full name').press('Tab');
  await page.getByPlaceholder('Email address').fill('f@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('franchisee');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: "Logout" }).click();

  // login in as an admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder("franchise name").click();
  await page.getByPlaceholder("franchise name").fill("pizza");
  await page.getByPlaceholder("franchise name").press("Tab");
  await page.getByPlaceholder("franchisee admin email").fill("a@jwt.com");
  await page.getByRole('button', { name: "Create" }).click();
  await page.getByRole('button', { name: "Close" }).click();
  await expect(page.getByText("Sorry to see you go")).toBeVisible();
  await page.getByRole('button', { name: "Close" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
})