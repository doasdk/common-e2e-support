import { expect, Locator } from '@playwright/test'
import * as allure from 'allure-js-commons'

/**
 * Enters a secret value into a given input locator.
 * The secret value is redacted in the Allure report.
 *
 * @param locator - The Playwright Locator for the input element.
 * @param secret - The secret value to enter.
 */
export async function enterSecret(locator: Locator, secret: string) {
  await allure.step('Enter secret [REDACTED]', async () => {
    await expect(locator).toBeEditable()

    await locator.evaluate((element, value) => {
      if (!(element instanceof HTMLInputElement)) {
        throw new Error('Expected a secret input')
      }

      element.value = value
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }, secret)
  })
}
