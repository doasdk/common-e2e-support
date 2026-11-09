import { expect, Locator, Page } from '@playwright/test'
import * as allure from 'allure-js-commons'
import { enterSecret } from '../../helpers/commonMethods'

export class KeycloakLoginPage {
  readonly page: Page

  readonly header: Locator
  readonly headerWrapper: Locator

  readonly loginForm: Locator
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly showPasswordButton: Locator

  readonly usernameLabel: Locator
  readonly passwordLabel: Locator

  readonly usernameErrorContainer: Locator
  readonly passwordErrorContainer: Locator

  readonly pageTitle: Locator

  readonly LOGIN_URL: string;

  /**
   * Creates a page object for the Keycloak login page.
   *
   * @param page - Playwright page used to interact with the login flow.
   * @param LOGIN_URL - URL of the login page.
   */
  constructor(page: Page, LOGIN_URL: string) {
    this.page = page
    this.LOGIN_URL = LOGIN_URL

    this.header = page.locator('#kc-header')
    this.headerWrapper = page.locator('#kc-header-wrapper')

    this.loginForm = page.locator('#kc-form-login')
    this.usernameInput = page.locator('#username')
    this.passwordInput = page.locator('#password')
    this.signInButton = page.locator('#kc-login')
    this.showPasswordButton = page.locator('[data-password-toggle]')

    this.usernameLabel = page.locator('label[for="username"]')
    this.passwordLabel = page.locator('label[for="password"]')

    this.usernameErrorContainer = page.locator('#input-error-container-username')
    this.passwordErrorContainer = page.locator('#input-error-container-password')

    this.pageTitle = page.locator('#kc-page-title')
  }

  /**
   * Opens the login page and signs in with the supplied credentials.
   *
   * @param username - Account name to submit.
   * @param password - Account password; entered through the redacted secret helper.
   */
  async navigateAndLogin(username: string, password: string): Promise<void> {
    await this.navigateToLoginPage();
    await this.loginToKeycloak(username, password);
  }


  /** Navigates to the login page and waits for its header to load. */
  async navigateToLoginPage(): Promise<void> {
    await allure.step('Navigate to OneCX portal', async () => {
      await this.navigateTo()
      await this.verifyPageLoaded()
    })
  }

  /**
   * Enters the supplied credentials and verifies that the login form is dismissed.
   *
   * @param username - Account name to submit.
   * @param password - Account password.
   */
  async loginToKeycloak(username: string, password: string): Promise<void> {
    await allure.step('Login to OneCX via Keycloak', async () => {
      await this.enterUsername(username)
      await enterSecret(this.passwordInput, password)
      await this.clickSignInButton()

      await this.verifyLoginSuccessful()
    })
  }

  /** Opens the configured Keycloak login URL and records the requested and final URLs. */
  async navigateTo() {
    await allure.step(`Navigate to Keycloak login page: ${this.LOGIN_URL}`, async () => {
      await this.page.goto(this.LOGIN_URL)
      await allure.attachment(
        'Navigation URLs',
        [
          `Requested: ${this.LOGIN_URL}`,
          `Final: ${this.page.url()}`
        ].join('\n'),
        'text/plain'
      )
    })
  }

  /** Waits for the document and login page header to become visible. */
  async verifyPageLoaded() {
    await allure.step('Verify Keycloak login page loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded')
      await this.headerWrapper.waitFor({ state: 'visible', timeout: 20000 })
      await expect(this.headerWrapper).toBeVisible()
    })
  }

  /**
   * Fills the username field.
   *
   * @param username - Account name to enter.
   */
  async enterUsername(username: string) {
    await allure.step('Enter username', async () => {
      await this.usernameInput.fill(username)
    })
  }

  /** Clicks the login form's sign-in button. */
  async clickSignInButton() {
    await allure.step('Click Sign In button', async () => {
      await this.signInButton.click()
    })
  }

  /** Verifies that login has navigated away from the configured login URL. */
  async verifyLoginSuccessful(): Promise<void> {
    await allure.step('Verify login successful', async () => {
      await this.page.waitForLoadState('domcontentloaded')
      await this.verifyLoginFormNotVisible()
      await expect(this.page).not.toHaveURL(this.LOGIN_URL)
    })
  }

  /** Asserts that the login form is no longer visible. */
  async verifyLoginFormNotVisible(): Promise<void> {
    await allure.step('Check if login form is not visible', async () => {
      await expect(this.loginForm).not.toBeVisible({ timeout: 10000 })
    })
  }

  /** Waits until the login form is visible and ready for interaction. */
  async waitForPage(): Promise<void> {
    await allure.step('Wait for Keycloak login page to be visible', async () => {
      await this.page.waitForLoadState('domcontentloaded')
      await this.loginForm.waitFor({ state: 'visible', timeout: 30000 })
    })
  }

  /** Returns the text displayed in the login page header wrapper. */
  async getRealmName(): Promise<string> {
    return this.headerWrapper.innerText()
  }

  /** Returns the login page title text. */
  async getPageTitle(): Promise<string> {
    return this.pageTitle.innerText()
  }

  /** Returns whether the username field currently has a non-empty error message. */
  async hasUsernameError(): Promise<boolean> {
    const content = await this.usernameErrorContainer.textContent()
    return content !== null && content.trim().length > 0
  }

  /** Returns whether the password field currently has a non-empty error message. */
  async hasPasswordError(): Promise<boolean> {
    const content = await this.passwordErrorContainer.textContent()
    return content !== null && content.trim().length > 0
  }

  /** Clicks the control that toggles password visibility. */
  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordButton.click()
  }

  /** Returns whether the password input is currently displayed as plain text. */
  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type')
    return type === 'text'
  }
}
