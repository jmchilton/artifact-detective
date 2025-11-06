# Formatters

Reference documentation for all formatters artifact types.

## Overview

This section covers detailed information for each artifact type in the **Formatters** category.

## rustfmt-txt

**Rustfmt Rust code formatter output showing formatting changes or status**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Rustfmt](https://rust-lang.github.io/rustfmt/)
- **Format Spec**: [TXT Format](https://rust-lang.github.io/rustfmt/?version=v1)

### Parsing Guide

Rustfmt text output typically shows file paths that would be reformatted or shows no output if formatting is already correct. When run with --check flag, it lists files that need formatting. Output is minimal - usually just file paths one per line, or a message like 'Diff from Rust Code' followed by unified diff format showing specific changes.

If checking format: expect file paths (one per line) of files needing formatting. If showing diff: look for unified diff format with +++ and --- lines showing before/after, and +/- lines showing specific changes. No detailed error information like other linters - rustfmt is about formatting consistency, not style violations.

Success indicators: File paths are readable and valid, diff format (if shown) is valid unified diff, no spurious lines, output indicates formatter ran successfully. Common errors: Parsing diff format incorrectly, treating formatting files as errors (they're not failures), empty output misinterpreted as failure. Rustfmt success is 'nothing to report' or list of files to reformat (not actual errors).


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## gofmt-txt

**Go gofmt code formatter output showing formatting check results**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Gofmt](https://golang.org/cmd/gofmt/)
- **Format Spec**: [TXT Format](https://golang.org/cmd/gofmt/)

### Parsing Guide

Gofmt text output typically shows file paths that differ from gofmt formatting, one per line. When run with -l (list) flag, it outputs only filenames needing formatting. With -d (diff) flag, it shows unified diff output for each file. No output usually means files are already correctly formatted.

If listing files: expect file paths one per line of files needing formatting. If showing diffs: look for unified diff format with filenames and +/- lines showing formatting differences. No additional metadata or error codes - gofmt is purely about formatting consistency.

Success indicators: File paths are valid and readable, diff format (if shown) is valid unified diff structure, no spurious output. Common errors: File list empty (not an error - means already formatted), diff parsing issues, treating formatting files as errors. Gofmt success is 'no output' (properly formatted) or list of files needing formatting.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## isort-txt

**Isort Python import sorter output showing import ordering violations and required changes**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Isort](https://pycqa.github.io/isort/)
- **Format Spec**: [TXT Format](https://pycqa.github.io/isort/)

### Parsing Guide

Isort text output shows import sorting violations in unified diff format. When run with --check-only --diff flags, it displays 'ERROR: <file> Imports are incorrectly sorted and/or formatted.' followed by a unified diff showing how imports should be reorganized. The diff shows the original import order (with - prefix) and the corrected order (with + prefix).

Parse by identifying ERROR lines with file paths, then extract the unified diff that follows. The diff format uses standard +++ and --- lines with file paths marked with "before" and "after" timestamps. Actual diff hunks show which import lines would be moved, removed, or reordered. No line/column information - the violation is at file level.

Success indicators: ERROR line present with 'Imports are incorrectly sorted' message, diff format is valid unified diff, file paths identifiable in before/after markers. Common errors: Diff format malformed, ERROR message absent (file already sorted), missing before/after markers in diff header. When imports are correctly sorted, there's no ERROR message or diff - this is not a failure but successful validation.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## black-txt

**Black Python code formatter output showing formatting check results or diff of formatting changes**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Black](https://github.com/psf/black)
- **Format Spec**: [TXT Format](https://black.readthedocs.io/)

### Parsing Guide

Black text output shows formatting status and optionally a diff of formatting changes. When run with --check --diff flags on a properly formatted file, it outputs 'All done! ✨ 🍰 ✨' with message about files being unchanged. When formatting issues are found, it shows 'would reformat <file>' followed by unified diff showing the formatting changes. Diff uses standard --- and +++ markers with line numbers in @@ hunks.

Parse by checking for status messages: 'All done!' means files are properly formatted (success), 'would reformat' means formatting needed (violation), 'error:' means black encountered an error. If diff is present, parse using standard unified diff format with @@ line number markers and +/- content lines showing formatting changes. No error codes - black is about formatting consistency, not code quality issues.

Success indicators: Status message present (All done/would reformat/error), if diff shown then valid unified diff format with proper @@ markers, file paths identifiable, +/- lines show formatting changes. Common errors: Parsing diff incorrectly, treating formatted files as failures (All done = success), status message missing or unclear, diff format malformed. Black success is 'All done!' - formatting violations are indicated by 'would reformat' message.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## Other Categories

- [Test Frameworks](./test-frameworks.md)
- [Linters](./linters.md)
- [Formatters](./formatters.md)

See [Artifact Types Overview](./README.md) for the complete reference table.
