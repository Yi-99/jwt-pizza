import { test, expect } from 'playwright-test-coverage';

test('purchase after register', async ({ page }) => {
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
    if (route.request().method() === 'POST') {
      const registerReq = { name: 'Yirang Lim', email: 'yl@example.com', password: 'a' };
      const registerRes = { user: { id: 3, name: 'Yirang Lim', email: 'yl@example.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    } else if (route.request().method() === 'DELETE') {
      const logoutRes = { message: 'logout successful' };
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: logoutRes });
    } else if (route.request().method() === 'PUT') {
      const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
      const loginRes = { user: { id: 3, name: "pizza franchisee", email: 'f@jwt.com', roles: [{ role: 'franchisee' }]}, token: 'abcdef' };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      const createFranReq = { admins: [{ email: "yl@example.com" }], name: "Lehi's pizza" };
      const createFranRes = { name: "Lehi's pizza", admins: [{ email: 'yl@example.com', id: 3, name: 'Yirang Lim' }], id: 1 };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(createFranReq);
      await route.fulfill({ json: createFranRes });
    }
  })
  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'GET' && getFranchiseRequests === 1) {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
      getFranchiseRequests++;
    } else if (route.request().method() === 'GET' && getFranchiseRequests === 2) {
      const getAllFranRes = [{ name: "Lehi's pizza", stores: [{ id: 1, name: "Lehi" }], id: 1 }]
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ status: 200, contentType: 'application/json', json: getAllFranRes });
    }
  })

  await page.route('*/**/api/franchise/*', async (route) => {
    if (getUserFranchiseRequests === 1) {
      const userId = route.request().url().split('/').pop();
      const getFranRes = [{ name: "Lehi's pizza", id: 1, admins: [{ id: 3, email: 'f@jwt.com', name: "pizza franchisee" }], stores: []}];
      getUserFranchiseRequests++;
      await route.fulfill({ json: getFranRes });
    } else if (getUserFranchiseRequests === 2) {
      const userId = route.request().url().split('/').pop();
      const getFranRes = [{ name: "Lehi's pizza", id: 1, admins: [{ id: 3, email: 'f@jwt.com', name: "pizza franchisee" }], stores: [{ id: 1, name: "Lehi's pizza", totalRevenue: 0 }]}];
      getUserFranchiseRequests++;
      await route.fulfill({ json: getFranRes });
    } else if (getUserFranchiseRequests === 3) {
      const userId = route.request().url().split('/').pop();
      const getFranRes = [{ name: "Lehi's pizza", id: 1, admins: [{ id: 3, email: 'f@jwt.com', name: "pizza franchisee" }], stores: []}];
      getUserFranchiseRequests++;
      await route.fulfill({ json: getFranRes });
    }
  })

  await page.route('*/**/api/franchise/*/store/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      const franchiseId = 1;
      const storeId = 1;
      const deleteStoreRes = { message: 'store deleted' };
      await route.fulfill({ json: deleteStoreRes });
    }
  })

  await page.route('*/**/api/franchise/*/store', async (route) => {
    if (route.request().method() === 'POST') {
      const createStoreReq = { franchiseId: 1, name: "Lehi's pizza" };
      const createStoreRes = { id: 1, franchiseId: 1, name: "Lehi's pizza" };
      await route.fulfill({ json: createStoreRes });
    }
  })

  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'POST') {
      const createOrderReq = { franchiseId: 1, storeId: 1, items: [{ menuId: 1, description: "Veggie", price: 0.0038 }, { menuId: 2, description: "Pepperoni", price: 0.0042 }] }
      const createOrderRes = { 
        order: { 
          franchiseId: 1, 
          storeId: 1,
          items: [
            { menuId: 1, description: "Veggie", price: 0.0038 }, 
            { menuId: 2, desciprtion: "Pepperoni", price: 0.0042 }
          ], 
          id: 1 
        }, 
        jwt: 'abcdef' 
      }
      // expect(route.request().postDataJSON()).toMatchObject(createOrderReq);
      await route.fulfill({ json: createOrderRes });
    }
  })

  // register
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.locator('#navbar-dark')).toContainText('Register');
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('Yirang Lim');
  await page.getByPlaceholder('Full name').press('Tab');
  await page.getByPlaceholder('Email address').fill('yl@example.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill("Lehi's pizza");
  await page.getByPlaceholder('franchisee admin email').fill("yl@example.com");
  await page.getByRole('button', { name: 'Create' }).click();

  await page.getByRole('link', { name: 'Logout' }).click();

  // login in as franchisee
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('f@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.locator('a:has-text("Franchise")').first().click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByPlaceholder('store name').click();
  await page.getByPlaceholder('store name').fill("Lehi's pizza");
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText("Sorry to see you go")).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  // await page.getByRole('link', { name: 'Order' }).click();
  // await page.getByRole('combobox').selectOption("Lehi")
  // await page.getByRole('link', { name: 'Image Description Veggie' }).click();
  // await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  // await page.getByRole('button', { name: 'Checkout' }).click();
  // await expect(page.getByText('Send me those 2 pizzas right')).toBeVisible();
  // await page.getByRole('button', { name: 'Pay now' }).click();
  
  // await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  // await expect(page.getByText('pie count: 2')).toBeVisible();
  // await page.getByRole('button', { name: 'Order more' }).click();

  // await page.getByRole('link', { name: 'YL' }).click();
  // await expect(page.getByText('Your pizza kitchen')).toBeVisible();
  // await expect(page.getByText('Yirang Lim')).toBeVisible();
  // await expect(page.getByText('yl@example.com')).toBeVisible();
  // await expect(page.getByText("How have you lived this long without having a pizza? Buy one now!")).toBeVisible();
  // await page.getByRole('link', { name: 'Logout' }).click();
});