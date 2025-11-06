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
| Test Frameworks | [`jest-json`](#jest-json) | Jest JavaScript test framework JSON output with test results and coverage metrics | ✓ | — | — | json | [Jest](https://jestjs.io/) |
| Test Frameworks | [`jest-html`](#jest-html) | Jest HTML test report with test results rendered in HTML format | ✓ | — | ✓ | html | [Jest](https://jestjs.io/) |
| Test Frameworks | [`playwright-json`](#playwright-json) | Playwright test framework JSON report with test execution results and metadata | ✓ | — | — | json | [Playwright](https://playwright.dev/) |
| Test Frameworks | [`pytest-json`](#pytest-json) | Pytest test framework JSON report with detailed test execution results and summaries | ✓ | — | — | json | [Pytest](https://docs.pytest.org/) |
| Test Frameworks | [`pytest-html`](#pytest-html) | Pytest HTML test report with test results displayed in HTML format with styling and summary | ✓ | — | ✓ | html | [Pytest](https://docs.pytest.org/) |
| Test Frameworks | [`junit-xml`](#junit-xml) | JUnit XML test report format with test suite and test case results | ✓ | — | — | xml | [JUnit](https://junit.org/) |
| Test Frameworks | [`surefire-html`](#surefire-html) | Maven Surefire HTML test report with JUnit test results rendered in HTML | ✓ | — | — | html | [Surefire](https://maven.apache.org/surefire/maven-surefire-plugin/) |
| Test Frameworks | [`go-test-ndjson`](#go-test-ndjson) | Go test runner JSON output in newline-delimited JSON format with test execution events | ✓ | — | — | json | [Go Test](https://golang.org/cmd/go/) |
| Test Frameworks | [`cargo-test-txt`](#cargo-test-txt) | Cargo test plain text output from Rust test runner with test results and summary | ✓ | — | — | txt | [Cargo](https://doc.rust-lang.org/cargo/) |
| Linters | [`eslint-txt`](#eslint-txt) | ESLint JavaScript linter plain text output with code quality violations and error messages | ✓ | ✓ | — | txt | [ESLint](https://eslint.org/) |
| Linters | [`eslint-json`](#eslint-json) | ESLint JavaScript linter JSON report with code quality violations and rule violations | ✓ | — | — | json | [ESLint](https://eslint.org/) |
| Linters | [`tsc-txt`](#tsc-txt) | TypeScript compiler (tsc) text output with type checking errors and diagnostics | ✓ | ✓ | — | txt | [TypeScript](https://www.typescriptlang.org/) |
| Linters | [`mypy-txt`](#mypy-txt) | Mypy Python type checker plain text output with type checking errors and diagnostics | ✓ | ✓ | ✓ | txt | [Mypy](https://www.mypy-lang.org/) |
| Linters | [`mypy-ndjson`](#mypy-ndjson) | Mypy Python type checker output in newline-delimited JSON format with type errors | ✓ | — | — | json | [Mypy](https://www.mypy-lang.org/) |
| Linters | [`ruff-txt`](#ruff-txt) | Ruff Python linter text output with fast linting results and code quality violations | ✓ | ✓ | — | txt | [Ruff](https://github.com/astral-sh/ruff) |
| Linters | [`flake8-txt`](#flake8-txt) | Flake8 Python linter text output with PEP 8 style violations and error codes | ✓ | ✓ | — | txt | [Flake8](https://flake8.pycqa.org/) |
| Linters | [`clippy-txt`](#clippy-txt) | Rust Clippy linter plain text output with code quality warnings and lint messages | ✓ | ✓ | ✓ | txt | [Clippy](https://github.com/rust-lang/rust-clippy) |
| Linters | [`clippy-ndjson`](#clippy-ndjson) | Rust Clippy linter output in newline-delimited JSON format with code quality warnings | ✓ | — | — | json | [Clippy](https://github.com/rust-lang/rust-clippy) |
| Linters | [`golangci-lint-json`](#golangci-lint-json) | Golangci-lint Go code linter JSON output with code quality violations and issues | ✓ | — | — | json | [Golangci-lint](https://golangci-lint.run/) |
| Linters | [`checkstyle-xml`](#checkstyle-xml) | Checkstyle XML code quality report with style violations and warnings | ✓ | — | ✓ | xml | [Checkstyle](https://checkstyle.sourceforge.io/) |
| Linters | [`checkstyle-sarif-json`](#checkstyle-sarif-json) | Checkstyle code quality violations in SARIF (Static Analysis Results Interchange Format) JSON | ✓ | — | ✓ | json | [Checkstyle](https://checkstyle.sourceforge.io/) |
| Linters | [`spotbugs-xml`](#spotbugs-xml) | SpotBugs (formerly FindBugs) XML Java code bug detection report | ✓ | — | — | xml | [SpotBugs](https://spotbugs.readthedocs.io/) |
| Formatters | [`rustfmt-txt`](#rustfmt-txt) | Rustfmt Rust code formatter output showing formatting changes or status | ✓ | ✓ | — | txt | [Rustfmt](https://rust-lang.github.io/rustfmt/) |
| Formatters | [`gofmt-txt`](#gofmt-txt) | Go gofmt code formatter output showing formatting check results | ✓ | ✓ | — | txt | [Gofmt](https://golang.org/cmd/gofmt/) |
| Formatters | [`isort-txt`](#isort-txt) | Isort Python import sorter output showing import ordering violations and required changes | ✓ | ✓ | — | txt | [Isort](https://pycqa.github.io/isort/) |
| Formatters | [`black-txt`](#black-txt) | Black Python code formatter output showing formatting check results or diff of formatting changes | ✓ | ✓ | — | txt | [Black](https://github.com/psf/black) |

## Detailed Type Documentation

For detailed information on each artifact type, including parsing guides and examples, see the [specific category pages](artifact-types/test-frameworks.md).
