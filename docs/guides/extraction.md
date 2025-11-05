# Extraction Guide

Learn how to extract test framework and linter artifacts from CI logs.

## Overview

The extraction feature helps you pull structured artifact data from CI log output, where tools often print their results inline with other log messages.

## Common Extraction Scenarios

### Extracting ESLint Output

ESLint often outputs directly to CI logs. Extract using:

```bash
artifact-detective extract eslint-txt build.log --output eslint.txt
```

The tool automatically detects ESLint output sections using standard markers.

### Extracting Linter Output

For text-based linter output (Mypy, Ruff, Flake8):

```bash
artifact-detective extract mypy-txt build.log --output mypy.txt
artifact-detective extract ruff-txt build.log --output ruff.txt
artifact-detective extract flake8-txt build.log --output flake8.txt
```

### Extracting from Piped Input

```bash
cat build.log | artifact-detective extract eslint-txt - > eslint.txt
```

## Custom Markers

For non-standard formats, use custom start and end markers:

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "^=== LINTER OUTPUT ===$" \
  --end-marker "^=== END LINTER ===$"
```

### Marker Examples

**For GitHub Actions:**
```bash
--start-marker "^::group::ESLint" \
--end-marker "^::endgroup::"
```

**For Jenkins:**
```bash
--start-marker "^\\[ESLint\\] Start" \
--end-marker "^\\[ESLint\\] End"
```

**For GitLab CI:**
```bash
--start-marker "^eslint_output_start" \
--end-marker "^eslint_output_end"
```

## Workflow Example

```bash
# 1. Download CI log
curl https://ci.example.com/build/123/log > build.log

# 2. Extract artifact
artifact-detective extract eslint-txt build.log --output eslint.txt

# 3. Validate extraction
artifact-detective validate eslint-txt eslint.txt

# 4. Normalize if needed
artifact-detective normalize eslint.txt --output eslint.json

# 5. Process JSON
cat eslint.json | jq '.violations | length'
```

## Supported Extraction Types

Extraction is supported for:
- Text-based linters: `eslint-txt`, `mypy-txt`, `ruff-txt`, `flake8-txt`, etc.
- Formatter output: `rustfmt-txt`, `gofmt-txt`, `black-txt`, etc.
- Test output: `cargo-test-txt`

For JSON/XML/HTML formats, no extraction is needed.

## Advanced Usage

### Extract with Validation

```bash
artifact-detective extract eslint-txt build.log --output eslint.txt && \
artifact-detective validate eslint-txt eslint.txt --json
```

### Extract and Normalize

```bash
# Some artifacts need both extraction and normalization
artifact-detective extract mypy-txt build.log --output mypy.txt
artifact-detective normalize mypy.txt --type mypy-txt --output mypy.json
```

### Regex Marker Tips

- Use `^` for start-of-line anchors
- Use `$` for end-of-line anchors
- Escape special characters with `\\`
- Use word boundaries `\\b` for precision
- Test markers with: `grep -E "marker" build.log`

## Testing with Fixtures

To test extraction with real-world artifacts:

- **JavaScript/Python**: See [JavaScript](../fixtures/javascript.md) and [Python](../fixtures/python.md) fixtures for complete examples
- **All Fixtures**: Browse [Fixtures Documentation](../fixtures/) for examples in other languages

These fixtures include actual CI log output that you can use to test extraction with real tool formats.
