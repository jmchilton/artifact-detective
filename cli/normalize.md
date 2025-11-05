# Normalize Command

Convert artifact to JSON format

## Usage

```
artifact-detective normalize <file> [options]
```

## Arguments

- **file** (required): Path to artifact file (use "-" for stdin)

## Options

- **--type <type>**: Override auto-detected artifact type
- **--output <file>**: Write JSON to file instead of stdout
- **--show-description**: Include parsing guide in output

## Examples

### Auto-detect and normalize to JSON

```bash
artifact-detective normalize pytest-report.html
```

### Normalize with explicit type

```bash
artifact-detective normalize report.html --type pytest-html --output report.json
```

