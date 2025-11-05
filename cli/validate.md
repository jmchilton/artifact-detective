# Validate Command

Validate artifact matches expected type

## Usage

```
artifact-detective validate <type> <file> [options]
```

## Arguments

- **type** (required): Expected artifact type
- **file** (required): Path to artifact file (use "-" for stdin)

## Options

- **--json**: Output result as JSON
- **--show-description**: Include parsing guide in output

## Examples

### Validate jest-json artifact

```bash
artifact-detective validate jest-json results.json
```

### Validate and show description

```bash
artifact-detective validate jest-json results.json --show-description
```

