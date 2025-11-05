# Fixtures Documentation

Sample project fixtures for testing artifact-detective with real-world artifact examples.

## Available Fixtures

**Officially Maintained:**
- [JavaScript](fixtures/javascript.md) - Jest, Playwright, ESLint, TypeScript fixtures
- [Python](fixtures/python.md) - Pytest, Mypy, Ruff, Isort, Black fixtures

**Community Fixtures:**
- [Rust](fixtures/rust.md) - Cargo, Clippy, Rustfmt fixtures
- [Go](fixtures/go.md) - Go test, Golangci-lint, Gofmt fixtures
- [Java](fixtures/java.md) - JUnit, Checkstyle, SpotBugs, Surefire fixtures
- [Ruby](fixtures/ruby.md) - RSpec fixtures

## Using Fixtures

Each fixture directory contains:
1. **manifest.yml** - Metadata about the project and generated artifacts
2. **Artifact files** - Real output from various tools

These fixtures are used for:
- Testing artifact detection accuracy
- Validating parsers against real-world output
- Demonstrating CLI usage
- Verifying extraction and normalization capabilities
