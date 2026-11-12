import { test as sharedTest, expect } from '../dist'

const authentication = {
  loginUrl: 'https://onecx.test/login',
  username: 'fixture-user',
  password: 'fixture-password'
}

const test = sharedTest.extend<{ loginRoutes: void }>({
  loginRoutes: [
    async ({ page }, use) => {
      await page.route('https://onecx.test/**', async (route) => {
        const isLogin = new URL(route.request().url()).pathname === '/login'
        await route.fulfill({
          contentType: 'text/html',
          body: isLogin
            ? `<div id="kc-header-wrapper">OneCX</div>
               <form id="kc-form-login" action="/portal" method="post">
                 <input id="username" name="username">
                 <input id="password" name="password" type="password">
                 <button id="kc-login" type="submit">Sign in</button>
               </form>`
            : '<html lang="en"><title>OneCX</title><nav id="ocx_header" aria-label="Main">Portal</nav></html>'
        })
      })
      await use()
    },
    { auto: true }
  ]
})

test.describe('authenticated fixtures', () => {
  test.use({ authentication })

  test('should complete login before exposing the authenticated page when configured', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveURL('https://onecx.test/portal')
  })

  test('should expose the test page when authentication completes', async ({ authenticatedPage, page }) => {
    expect(authenticatedPage).toBe(page)
  })

  test('should configure the login page without signing in when only loginPage is requested', async ({ loginPage }) => {
    expect(loginPage.LOGIN_URL).toBe(authentication.loginUrl)
    expect(loginPage.page.url()).toBe('about:blank')
  })

  for (const iteration of [1, 2]) {
    test(`should use a fresh context when authenticated test ${iteration} starts`, async ({ authenticatedPage }) => {
      expect(await authenticatedPage.evaluate(() => localStorage.getItem('previous-test'))).toBeNull()
      await authenticatedPage.evaluate(() => localStorage.setItem('previous-test', 'present'))
    })
  }

  test('should wrap the authenticated test page when navigation is requested', async ({
    authenticatedPage,
    navigationHeaderBar
  }) => {
    expect(navigationHeaderBar.page).toBe(authenticatedPage)
  })

  test('should use the shared WCAG tags when an axe builder is requested', async ({
    authenticatedPage,
    makeAxeBuilder
  }) => {
    await expect(authenticatedPage.locator('#ocx_header')).toBeVisible()
    const results = await makeAxeBuilder().analyze()
    expect(results.toolOptions.runOnly).toEqual({
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
    })
  })
})

test('should leave the page unauthenticated when no authentication fixture is requested', async ({ page }) => {
  expect(page.url()).toBe('about:blank')
})

test('should provide navigation without authentication when only the header fixture is requested', async ({
  navigationHeaderBar,
  page
}) => {
  expect(navigationHeaderBar.page).toBe(page)
})
