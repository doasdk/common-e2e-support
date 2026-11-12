import { test as base, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { KeycloakLoginPage, NavigationHeaderBar } from './page-objects'

export type OnecxAuthentication = {
  loginUrl: string
  username: string
  password: string
}

export type OnecxOptions = {
  authentication: OnecxAuthentication
}

export type OnecxFixtures = {
  loginPage: KeycloakLoginPage
  authenticatedPage: Page
  navigationHeaderBar: NavigationHeaderBar
  makeAxeBuilder: () => AxeBuilder
}

export const test = base.extend<OnecxOptions & OnecxFixtures>({
  authentication: [{ loginUrl: '', username: '', password: '' }, { option: true }],

  loginPage: async ({ page, authentication }, use) => {
    if (!authentication.loginUrl) {
      throw new Error('Configure authentication.loginUrl before requesting loginPage or authenticatedPage.')
    }
    await use(new KeycloakLoginPage(page, authentication.loginUrl))
  },

  authenticatedPage: async ({ page, loginPage, authentication }, use) => {
    if (!authentication.username || !authentication.password) {
      throw new Error('Configure authentication.username and authentication.password before requesting authenticatedPage.')
    }
    await loginPage.navigateAndLogin(authentication.username, authentication.password)
    await use(page)
  },

  navigationHeaderBar: async ({ page }, use) => {
    await use(new NavigationHeaderBar(page))
  },

  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']))
  }
})

export { expect } from '@playwright/test'
