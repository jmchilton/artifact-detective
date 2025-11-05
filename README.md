# Artifact Detective Documentation

Welcome to the artifact-detective documentation site. This is your comprehensive guide to detecting, validating, extracting, and normalizing CI artifacts.

## Quick Start

Get started in 5 minutes:

```bash
npm install artifact-detective

# Detect artifact type
artifact-detective detect results.json

# Validate an artifact
artifact-detective validate jest-json results.json

# Extract from CI logs
artifact-detective extract eslint-txt build.log

# Convert to JSON
artifact-detective normalize pytest-report.html
```

## What is artifact-detective?

artifact-detective is a TypeScript/Node.js tool for:

- **Detecting** artifact types from test frameworks and linters
- **Validating** artifacts against expected format
- **Extracting** artifacts from CI log output
- **Normalizing** artifacts to JSON format

Supports 40+ artifact types from tools like:
- **Test Frameworks**: Jest, Playwright, Pytest, JUnit, RSpec
- **Linters**: ESLint, TypeScript, Mypy, Flake8, Clippy
- **Formatters**: Rustfmt, Black, Isort, Gofmt

## Documentation Overview

- **[Getting Started](getting-started.md)** - Installation and first steps
- **[CLI Reference](cli/)** - Complete command documentation
- **[Artifact Types](artifact-types/)** - All supported artifact types
- **[API Documentation](api/)** - TypeScript/JavaScript API
- **[Fixtures](fixtures/)** - Example artifacts by language
- **[Guides](guides/)** - Common workflows and patterns

## Key Features

✨ **Auto-Detection** - Automatically identify artifact types
🔍 **Validation** - Ensure artifacts match expected format
📦 **Extraction** - Pull artifacts from CI logs
📄 **Normalization** - Convert to standardized JSON

## Use Cases

- 🧪 Store test results in a consistent format
- 📊 Aggregate results from multiple CI pipelines
- 🔄 Post-process CI artifacts for analysis
- 📈 Track metrics across test frameworks
- 🛠️ Integrate with CI/CD automation

## Support

- 📖 [Read the documentation](/)
- 🐛 [Report issues](https://github.com/jmchilton/artifact-detective/issues)
- 💬 [View discussions](https://github.com/jmchilton/artifact-detective/discussions)
