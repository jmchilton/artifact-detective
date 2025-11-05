# Extract Command

Extract artifact from CI log

## Usage

```
artifact-detective extract <type> <log> [options]
```

## Arguments

- **type** (required): Artifact type to extract (e.g., eslint-txt)
- **log** (required): Path to CI log file (use "-" for stdin)

## Options

- **--output <file>**: Write extracted artifact to file instead of stdout
- **--start-marker <regex>**: Custom regex to detect start of extraction section
- **--end-marker <regex>**: Custom regex to detect end of extraction section

## Examples

### Extract ESLint output from CI log

```bash
artifact-detective extract eslint-txt build.log
```

### Extract with custom markers

```bash
artifact-detective extract eslint-txt log.txt --start-marker "^LINTER OUTPUT" --end-marker "^END"
```

