const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { test, before, after } = require('node:test')

const output = mkdtempSync(path.join(tmpdir(), 'onecx-fixture-errors-'))
let results

before(() => {
  const command = spawnSync(
    process.execPath,
    [require.resolve('@playwright/test/cli'), 'test', '--config=verification/error-cases.config.ts', `--output=${output}`],
    {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, FORCE_COLOR: '0' },
      encoding: 'utf8',
      timeout: 60000
    }
  )
  if (command.error) throw command.error
  assert.equal(command.status, 1, command.stderr || command.stdout)
  const report = JSON.parse(command.stdout)
  assert.deepEqual(report.errors, [])
  const specs = (suites) => suites.flatMap((suite) => [...suite.specs, ...specs(suite.suites || [])])
  results = new Map(specs(report.suites).map((spec) => [spec.title, spec.tests[0].results[0]]))
  assert.equal(results.size, 4)
})

after(() => rmSync(output, { recursive: true, force: true }))

for (const [title, error] of [
  ['missing login URL', 'Configure authentication.loginUrl'],
  ['missing username', 'Configure authentication.username'],
  ['missing password', 'Configure authentication.username'],
  ['login failure', 'Simulated login failure']
]) {
  test(`should fail fixture setup when ${title} occurs`, () => {
    const result = results.get(title)
    assert.equal(result.status, 'failed')
    assert.ok(result.errors.some(({ message }) => message.includes(error)), JSON.stringify(result.errors))
  })
}
