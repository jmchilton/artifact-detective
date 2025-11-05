# Custom Extraction Markers

> **Beta Guide** | AI-Generated | [Tested with GitHub Actions (Python & JavaScript)]
>
> This guide is in beta and was AI-generated. Custom marker extraction has been thoroughly tested with **Python and JavaScript projects in GitHub Actions**. Examples for other CI platforms (Jenkins, GitLab CI, CircleCI, etc.) are based on typical log patterns but are **not validated**. If you successfully use markers with other platforms, please contribute examples.

Learn how to create custom extraction patterns for your specific CI environment.

## Overview

When extracting artifacts from CI logs, you can define custom start and end markers to precisely locate your artifact data.

## Marker Basics

Markers are regular expressions that identify the beginning and end of an artifact section in logs.

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "regex-for-start" \
  --end-marker "regex-for-end"
```

## Common CI Platforms

### GitHub Actions ✅ (Tested)

GitHub Actions uses `::group::` and `::endgroup::` markers:

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "::group::ESLint Report" \
  --end-marker "::endgroup::"
```

Example log output:
```
::group::ESLint Report
/path/file.js
  1:5  error  Unexpected token
::endgroup::
```

This has been validated with Python and JavaScript projects in GitHub Actions.

### GitLab CI ⚠️ (Untested)

GitLab CI may use collapsible section markers (pattern-based, not validated):

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "^\\s*\\[eslint\\] Starting" \
  --end-marker "^\\s*\\[eslint\\] Complete"
```

### Jenkins ⚠️ (Untested)

Jenkins may use section markers in console output (pattern-based, not validated):

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "^\\+\\+ ESLint Start" \
  --end-marker "^\\+\\+ ESLint End"
```

### CircleCI ⚠️ (Untested)

CircleCI may use similar patterns (pattern-based, not validated):

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "LINTING RESULTS:" \
  --end-marker "^Build .* completed"
```

### TravisCI / Azure Pipelines ⚠️ (Untested)

Experimental patterns (not validated):

```bash
artifact-detective extract eslint-txt build.log \
  --start-marker "^linting:" \
  --end-marker "^$"
```

---

> **Help Needed**: If you successfully use extraction markers with platforms other than GitHub Actions, please share your working patterns. Open an issue or PR to help improve this guide.

## Regex Tips

### Anchors

- `^` - Start of line
- `$` - End of line
- `\\b` - Word boundary

### Character Classes

- `.` - Any character
- `\\d` - Digit
- `\\s` - Whitespace
- `\\w` - Word character (letter, digit, underscore)

### Quantifiers

- `*` - Zero or more
- `+` - One or more
- `?` - Zero or one
- `{n}` - Exactly n
- `{n,m}` - Between n and m

### Escaping

In bash, escape special regex characters:
- `\\` for backslash
- `\\.` for literal dot
- `\\[` for literal bracket

## Practical Examples

### Extract from Section Headers

Log format with headers:
```
========== ESLINT REPORT ==========
/path/file.js: 2 errors, 1 warning
...
========== END REPORT ==========
```

Markers:
```bash
--start-marker "^=+ ESLINT REPORT =+" \
--end-marker "^=+ END REPORT =+"
```

### Extract Tool Output with Timestamps

Log format:
```
[12:34:56] Starting ESLint checks
[12:34:58] /path/file.js: 2 errors
...
[12:35:00] ESLint checks complete
```

Markers:
```bash
--start-marker "\\[.*\\] Starting ESLint" \
--end-marker "\\[.*\\] ESLint.*complete"
```

### Extract Between Success/Failure Markers

Log format:
```
>> Starting linter checks
File: /path/file.js
  Error on line 5
<< Linter completed
```

Markers:
```bash
--start-marker "^>> Starting linter" \
--end-marker "^<< Linter completed"
```

## Testing Your Markers

### 1. Test with grep

```bash
# Test start marker
grep -E "your-start-pattern" build.log | head -5

# Test end marker  
grep -E "your-end-pattern" build.log | head -5
```

### 2. Extract and Verify

```bash
# Run extraction with your markers
artifact-detective extract eslint-txt build.log \
  --start-marker "your-pattern" \
  --output test.txt

# Check result
head -20 test.txt
tail -20 test.txt
```

### 3. Validate Extraction

```bash
# Validate the extracted artifact
artifact-detective validate eslint-txt test.txt

# Should show: Valid artifact
```

## Advanced Patterns

### Optional Content

```bash
# Pattern where section name might vary
--start-marker "^=+ (ESLINT|LINTING) REPORT =+"
```

### Non-greedy Matching

For complex logs, use specific content to avoid over-capturing:

```bash
# Match between specific file paths
--start-marker "/path/to/project.*eslint" \
--end-marker "Total.*violations"
```

### Multiple Word Patterns

```bash
# Match lines with multiple required words
--start-marker ".*ESLint.*Results.*"
```

## Debugging Markers

If extraction isn't working:

1. **Check marker format**: Ensure regex is valid
   ```bash
   echo "test line" | grep -E "your-pattern" || echo "No match"
   ```

2. **Check log format**: View actual markers in log
   ```bash
   head -100 build.log | grep -i eslint
   ```

3. **Test simplified markers**: Start simple
   ```bash
   --start-marker "eslint" \
   --end-marker "complete"
   ```

4. **Check escaping**: Verify backslashes are escaped
   ```bash
   # Wrong: --start-marker "\[" (single backslash)
   # Right: --start-marker "\\[" (double backslash in bash)
   ```

## Storing Markers

For frequently-used markers, create a config file:

```bash
#!/bin/bash
# extract-markers.sh

GITHUB_START="::group::"
GITHUB_END="::endgroup::"
JENKINS_START="^\\+\\+ Start"
JENKINS_END="^\\+\\+ End"

artifact-detective extract eslint-txt build.log \
  --start-marker "$GITHUB_START" \
  --end-marker "$GITHUB_END"
```
