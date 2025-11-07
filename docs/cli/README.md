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

# Detect with validation and metadata
artifact-detective detect results.json --validate --show-description

# Validate artifact
artifact-detective validate jest-json results.json

# Extract from CI log
artifact-detective extract eslint-txt build.log

# Extract with validation and JSON output
artifact-detective extract eslint-txt build.log --validate --json

# Convert to JSON
artifact-detective normalize pytest-report.html
```

## Features

- **Auto-detection**: Automatically identify artifact types from file content
- **Validation**: Verify detected/extracted content matches expected format
- **Metadata**: Get artifact tool URLs, format info, and parsing guides
- **Flexible I/O**: Read from files or stdin, write to stdout or files
- **JSON output**: Machine-readable output with artifact descriptors

## More Information

- Use `artifact-detective --help` for general help
- Use `artifact-detective <command> --help` for command-specific help
- See [Artifact Types](../artifact-types/) for supported types
