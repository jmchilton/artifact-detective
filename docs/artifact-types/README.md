# Artifact Types Reference

Complete reference of all artifact types supported by artifact-detective, organized by category.

## Overview

This documentation covers:
- **Test Frameworks**: Jest, Playwright, Pytest, JUnit, Surefire, Go Test, RSpec
- **Linters**: ESLint, TypeScript Compiler, Mypy, Ruff, Flake8, Clippy, Golangci-lint, Rubocop, Brakeman
- **Formatters**: Rustfmt, Gofmt, Isort, Black, Checkstyle, SpotBugs

## Complete Artifact Types Table

| Category | Type | Description | Auto-Detect | Extract | Normalize | Format | Tool |
|----------|------|-------------|-------------|---------|-----------|--------|------|
| Test Frameworks | [`jest-json`](artifact-types/test-frameworks.md#jest-json) | Jest JavaScript test framework JSON output with test results and coverage metrics | ✓ | — | — | json | [Jest](https://jestjs.io/) |
| Test Frameworks | [`jest-html`](artifact-types/test-frameworks.md#jest-html) | Jest HTML test report with test results rendered in HTML format | ✓ | — | ✓ | html | [Jest](https://jestjs.io/) |
| Test Frameworks | [`playwright-json`](artifact-types/test-frameworks.md#playwright-json) | Playwright test framework JSON report with test execution results and metadata | ✓ | — | — | json | [Playwright](https://playwright.dev/) |
| Test Frameworks | [`pytest-json`](artifact-types/test-frameworks.md#pytest-json) | Pytest test framework JSON report with detailed test execution results and summaries | ✓ | — | — | json | [Pytest](https://docs.pytest.org/) |
| Test Frameworks | [`pytest-html`](artifact-types/test-frameworks.md#pytest-html) | Pytest HTML test report with test results displayed in HTML format with styling and summary | ✓ | — | ✓ | html | [Pytest](https://docs.pytest.org/) |
| Test Frameworks | [`junit-xml`](artifact-types/test-frameworks.md#junit-xml) | JUnit XML test report format with test suite and test case results | ✓ | — | — | xml | [JUnit](https://junit.org/) |
| Test Frameworks | [`surefire-html`](artifact-types/test-frameworks.md#surefire-html) | Maven Surefire HTML test report with JUnit test results rendered in HTML | ✓ | — | — | html | [Surefire](https://maven.apache.org/surefire/maven-surefire-plugin/) |
| Test Frameworks | [`go-test-ndjson`](artifact-types/test-frameworks.md#go-test-ndjson) | Go test runner JSON output in newline-delimited JSON format with test execution events | ✓ | — | — | json | [Go Test](https://golang.org/cmd/go/) |
| Test Frameworks | [`cargo-test-txt`](artifact-types/test-frameworks.md#cargo-test-txt) | Cargo test plain text output from Rust test runner with test results and summary | ✓ | — | — | txt | [Cargo](https://doc.rust-lang.org/cargo/) |
| Linters | [`eslint-txt`](artifact-types/linters.md#eslint-txt) | ESLint JavaScript linter plain text output with code quality violations and error messages | ✓ | ✓ | — | txt | [ESLint](https://eslint.org/) |
| Linters | [`eslint-json`](artifact-types/linters.md#eslint-json) | ESLint JavaScript linter JSON report with code quality violations and rule violations | ✓ | — | — | json | [ESLint](https://eslint.org/) |
| Linters | [`tsc-txt`](artifact-types/linters.md#tsc-txt) | TypeScript compiler (tsc) text output with type checking errors and diagnostics | ✓ | ✓ | — | txt | [TypeScript](https://www.typescriptlang.org/) |
| Linters | [`mypy-txt`](artifact-types/linters.md#mypy-txt) | Mypy Python type checker plain text output with type checking errors and diagnostics | ✓ | ✓ | ✓ | txt | [Mypy](https://www.mypy-lang.org/) |
| Linters | [`mypy-ndjson`](artifact-types/linters.md#mypy-ndjson) | Mypy Python type checker output in newline-delimited JSON format with type errors | ✓ | — | — | json | [Mypy](https://www.mypy-lang.org/) |
| Linters | [`ruff-txt`](artifact-types/linters.md#ruff-txt) | Ruff Python linter text output with fast linting results and code quality violations | ✓ | ✓ | — | txt | [Ruff](https://github.com/astral-sh/ruff) |
| Linters | [`flake8-txt`](artifact-types/linters.md#flake8-txt) | Flake8 Python linter text output with PEP 8 style violations and error codes | ✓ | ✓ | — | txt | [Flake8](https://flake8.pycqa.org/) |
| Linters | [`clippy-txt`](artifact-types/linters.md#clippy-txt) | Rust Clippy linter plain text output with code quality warnings and lint messages | ✓ | ✓ | ✓ | txt | [Clippy](https://github.com/rust-lang/rust-clippy) |
| Linters | [`clippy-ndjson`](artifact-types/linters.md#clippy-ndjson) | Rust Clippy linter output in newline-delimited JSON format with code quality warnings | ✓ | — | — | json | [Clippy](https://github.com/rust-lang/rust-clippy) |
| Linters | [`golangci-lint-json`](artifact-types/linters.md#golangci-lint-json) | Golangci-lint Go code linter JSON output with code quality violations and issues | ✓ | — | — | json | [Golangci-lint](https://golangci-lint.run/) |
| Linters | [`checkstyle-xml`](artifact-types/linters.md#checkstyle-xml) | Checkstyle XML code quality report with style violations and warnings | ✓ | — | ✓ | xml | [Checkstyle](https://checkstyle.sourceforge.io/) |
| Linters | [`checkstyle-sarif-json`](artifact-types/linters.md#checkstyle-sarif-json) | Checkstyle code quality violations in SARIF (Static Analysis Results Interchange Format) JSON | ✓ | — | ✓ | json | [Checkstyle](https://checkstyle.sourceforge.io/) |
| Linters | [`spotbugs-xml`](artifact-types/linters.md#spotbugs-xml) | SpotBugs (formerly FindBugs) XML Java code bug detection report | ✓ | — | — | xml | [SpotBugs](https://spotbugs.readthedocs.io/) |
| Formatters | [`rustfmt-txt`](artifact-types/formatters.md#rustfmt-txt) | Rustfmt Rust code formatter output showing formatting changes or status | ✓ | ✓ | — | txt | [Rustfmt](https://rust-lang.github.io/rustfmt/) |
| Formatters | [`gofmt-txt`](artifact-types/formatters.md#gofmt-txt) | Go gofmt code formatter output showing formatting check results | ✓ | ✓ | — | txt | [Gofmt](https://golang.org/cmd/gofmt/) |
| Formatters | [`isort-txt`](artifact-types/formatters.md#isort-txt) | Isort Python import sorter output showing import ordering violations and required changes | ✓ | ✓ | — | txt | [Isort](https://pycqa.github.io/isort/) |
| Formatters | [`black-txt`](artifact-types/formatters.md#black-txt) | Black Python code formatter output showing formatting check results or diff of formatting changes | ✓ | ✓ | — | txt | [Black](https://github.com/psf/black) |

## More Information

- See [API Functions Guide](../api/functions.md) for how to work with artifacts programmatically
- See [CLI Reference](../cli/) for command-line usage examples
- See [Guides](../guides/) for workflows and best practices
- Browse [Fixtures](../fixtures/) for real-world artifact examples
