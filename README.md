# artifact-detective

[![CI](https://github.com/jmchilton/artifact-detective/workflows/Test/badge.svg)](https://github.com/jmchilton/artifact-detective/actions)
[![npm version](https://badge.fury.io/js/artifact-detective.svg)](https://www.npmjs.com/package/artifact-detective)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/artifact-detective.svg)](https://nodejs.org)

Detect and parse CI artifact types for test frameworks and linters.

## Overview

`artifact-detective` is a library for identifying and parsing CI artifacts from various test frameworks, linters, and type checkers. It reads HTML, JSON, XML, and text outputs, detects the tool that generated them, and extracts structured data for analysis.

## Features

- **Automatic type detection** by content inspection
- **HTML to JSON conversion** for pytest-html and Playwright HTML reports
- **Linter output extraction** from CI logs
- **Zero dependencies** (except cheerio for HTML parsing)
- **TypeScript** with full type definitions

## Installation

```bash
npm install artifact-detective
```

## Usage

### Detect Artifact Type

```typescript
import { detectArtifactType } from 'artifact-detective';

const result = detectArtifactType('./test-results/report.html');
console.log(result);
// {
//   detectedType: 'pytest-html',
//   originalFormat: 'html',
//   isBinary: false
// }
```

### Parse HTML Reports

```typescript
import { extractPytestJSON } from 'artifact-detective';

// pytest-html → structured JSON
const pytestReport = extractPytestJSON('./pytest-report.html');
console.log(pytestReport.tests);

### Extract Linter Output

```typescript
import { detectLinterType, extractLinterOutput } from 'artifact-detective';

const logContent = readFileSync('./ci-log.txt', 'utf-8');

const linterType = detectLinterType('lint', logContent);
// 'eslint' | 'ruff' | 'mypy' | ...

if (linterType) {
  const output = extractLinterOutput(linterType, logContent);
  console.log(output); // Extracted linter-specific output
}
```

## Supported Formats

| Type | Description | Extract | JSON | Example Fixture |
|------|-------------|---------|------|-----------------|
| jest-json | Jest JSON reporter: 5 pass, 2 fail, 1 skip | — | already is | `fixtures/generated/javascript/jest-results.json` |
| playwright-json | Playwright JSON: 3 pass, 1 fail | — | already is | `fixtures/generated/javascript/playwright-results.json` |
| pytest-json | Pytest JSON: 5 pass, 2 fail, 1 skip | — | already is | `fixtures/generated/python/pytest-results.json` |
| mypy-json | Mypy JSON: type checking errors in JSON format | — | already is | `fixtures/generated/python/mypy-results.json` |
| eslint-json | ESLint JSON: reports linting violations | — | already is | `fixtures/generated/javascript/eslint-results.json` |
| clippy-json | Clippy JSON output with 5+ warnings | — | already is | `fixtures/generated/rust/clippy-output.json` |
| go-test-json | Go test NDJSON: 7 pass, 1 skip | — | can convert | `fixtures/generated/go/go-test.json` |
| golangci-lint-json | golangci-lint JSON: linting violations | — | already is | `fixtures/generated/go/golangci-lint.json` |
| checkstyle-sarif-json | Checkstyle SARIF violations | — | already is | `fixtures/generated/java/checkstyle-result.sarif` |
| pytest-html | Pytest HTML report with test details | — | can convert | `fixtures/generated/python/pytest-report.html` |
| jest-html | Jest HTML report with test details | — | can convert | `fixtures/generated/javascript/jest-report.html` |
| surefire-html | Maven Surefire HTML test report | — | todo | `fixtures/generated/java/surefire-report.html` |
| junit-xml | JUnit test results: 6 passed, 1 failed, 1 skipped | — | todo | `fixtures/generated/java/TEST-com.example.CalculatorTest.xml` |
| checkstyle-xml | Checkstyle violations | — | todo | `fixtures/generated/java/checkstyle-result.xml` |
| spotbugs-xml | SpotBugs analysis | — | todo | `fixtures/generated/java/spotbugsXml.xml` |
| eslint-txt | ESLint output with violations | ✓ | todo | `fixtures/generated/javascript/eslint-output.txt` |
| tsc-txt | TypeScript compiler errors | ✓ | todo | `fixtures/generated/javascript/tsc-output.txt` |
| mypy-txt | Mypy type checker errors | ✓ | todo | `fixtures/generated/python/mypy-output.txt` |
| ruff-txt | Ruff linter output with violations | ✓ | todo | `fixtures/generated/python/ruff-output.txt` |
| clippy-txt | Clippy text output with warnings | ✓ | todo | `fixtures/generated/rust/clippy-output.txt` |
| flake8-txt | flake8 linter output | ✓ | todo | — |
| cargo-test-txt | Cargo test text output: 4 pass, 1 panic, 1 ignored | — | todo | `fixtures/generated/rust/cargo-test-output.txt` |
| rustfmt-txt | Rustfmt check output | — | todo | `fixtures/generated/rust/rustfmt-output.txt` |

## Usage

See the `gh-ci-artifacts` for how this package should be used - the
API is rapidly changing but once the upstream project stabilizes it will
make sense to harden and document the interface here.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Type check
npm run lint
```

## Future Work

See [FIXTURE_PLAN.md](./FIXTURE_PLAN.md) for the planned fixture generation framework to create reproducible test artifacts from real tools.

## License

MIT
