# Detect Command

Detect artifact type from file

## Usage

```
artifact-detective detect <file> [options]
```

## Arguments

- **file** (required): Path to artifact file (use "-" for stdin)

## Options

- **--json**: Output result as JSON

## Examples

### Detect artifact from file

```bash
artifact-detective detect results.json
```

### Detect from stdin and output JSON

```bash
cat results.json | artifact-detective detect - --json
```

