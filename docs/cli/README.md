# CLI Reference

Complete reference for artifact-detective command-line interface.

## Available Commands

- [`detect`](cli/detect.md) - Detect artifact type from file
- [`validate`](cli/validate.md) - Validate artifact matches expected type
- [`extract`](cli/extract.md) - Extract artifact from CI log
- [`normalize`](cli/normalize.md) - Convert artifact to JSON format

## Global Options

- **-v, --version** - Show version number
- **-h, --help** - Show help message

## Quick Start

```bash
# Detect artifact type
artifact-detective detect results.json

# Validate artifact
artifact-detective validate jest-json results.json

# Extract from CI log
artifact-detective extract eslint-txt build.log

# Convert to JSON
artifact-detective normalize pytest-report.html
```

## More Information

- Use `artifact-detective --help` for general help
- Use `artifact-detective <command> --help` for command-specific help
- See [Artifact Types](../artifact-types/) for supported types
