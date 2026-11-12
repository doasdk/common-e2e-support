# OneCX common E2E support

Shared Playwright page objects, fixtures, accessibility utilities, and helpers.
Application tests and platform/container orchestration belong to consumers, not
this package. The package does not read environment variables, credentials, or
application configuration files.

## Fixtures

Import `test` and `expect` from `onecx-common-e2e`. Configure the `authentication`
option with runtime-only `loginUrl`, `username`, and `password` values using
`test.use()` or by extending `test`.

- `page` is unauthenticated by default, for login and public-page tests.
- `loginPage` constructs the shared Keycloak page object without signing in.
- `authenticatedPage` signs in before exposing the same test-scoped `page`.
- `navigationHeaderBar` wraps that page; it does not trigger authentication.
- `makeAxeBuilder` creates axe builders with the shared WCAG tags.

Extend `test` with application page objects that depend on `authenticatedPage`.
Keep application navigation and data preparation in the application's fixtures
or hooks. Requesting multiple fixtures does not create multiple browser pages.
Each test receives a fresh browser context and performs its own login, including
on retries. Authentication failures fail the test before app assertions run.
This intentionally does not reuse stored sessions across tests, users, browsers,
or platform matrix combinations.

The shared fixtures run through Playwright, not a Docker entrypoint, so they also
work when an orchestrator overrides the container entrypoint. A separate login
container or login-specific base image is not required.

## Development and packaging

Run `npm test` with Playwright browsers installed. Run `npm run typecheck` to
check the library. `npm pack` builds the package and creates a versioned archive;
only `dist` and package documentation/metadata are shipped. Consumers must use a
Playwright version compatible with the peer dependency and the browsers in their
runtime image.

## Reports for package development

`npm test -- --workers=1` enables line, Playwright HTML, and Allure reporters.
Do not pass `--reporter=line`: that overrides the configured reporters and
disables the Allure runtime required by shared page-object steps/attachments.
Raw package-test results are written to this repository's `allure-results`.
These are development checks of the library, not application matrix results.
Allure appends results; remove previous development results before a new report
if you do not want to combine test runs.

With Java installed, generate and serve the development report:

```shell
npm run report:generate
npm run report:open
```

`allure-playwright` and `allure-commandline` are development dependencies only.
Neither the test configuration nor these development reports are shipped in
the package. The intentional authentication-failure scenarios retain their
separate JSON reporter so the Node harness can assert expected fixture failures;
they are not included as failures in the development Allure report.

When an app imports the package, shared Allure steps and attachments use the
app's active reporter. Workspace owns its reporter output directory, version
metadata, collection, and merged matrix report; this package does not create a
second reporter or change those paths. Do not copy library development results
into Workspace's matrix results.

Version 0.0.2 adds fixtures without changing the existing page-object/helper
exports. Publish it to npm or vendor its archive in consuming repositories;
do not use a dependency path to a developer's checkout for CI.
