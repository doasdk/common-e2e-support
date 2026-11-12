import { test, KeycloakLoginPage } from '../../dist'

const authentication = {
  loginUrl: 'https://onecx.test/login',
  username: 'fixture-user',
  password: 'fixture-password'
}

test('missing login URL', async ({ loginPage }) => {
  throw new Error(`Unexpected test body execution with ${loginPage.constructor.name}`)
})

test.describe('missing username', () => {
  test.use({ authentication: { ...authentication, username: '' } })

  test('missing username', async ({ authenticatedPage }) => {
    throw new Error(`Unexpected test body execution at ${authenticatedPage.url()}`)
  })
})

test.describe('missing password', () => {
  test.use({ authentication: { ...authentication, password: '' } })

  test('missing password', async ({ authenticatedPage }) => {
    throw new Error(`Unexpected test body execution at ${authenticatedPage.url()}`)
  })
})

const failingLoginTest = test.extend({
  authentication,
  loginPage: async ({ page }, use) => {
    const loginPage = new KeycloakLoginPage(page, authentication.loginUrl)
    loginPage.navigateAndLogin = async () => {
      throw new Error('Simulated login failure')
    }
    await use(loginPage)
  }
})

failingLoginTest('login failure', async ({ authenticatedPage }) => {
  throw new Error(`Unexpected test body execution at ${authenticatedPage.url()}`)
})
