# Linters

Reference documentation for all linters artifact types.

## Overview

This section covers detailed information for each artifact type in the **Linters** category.

## eslint-txt

**ESLint JavaScript linter plain text output with code quality violations and error messages**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [ESLint](https://eslint.org/)
- **Format Spec**: [TXT Format](https://eslint.org/docs/user-guide/formatters/)

### Parsing Guide

ESLint text output is plain text formatted human-readably. The output contains file paths followed by lists of violations, each showing line:column, violation type (error/warning), message, and rule name in parentheses. Summary at end shows total errors and warnings with counts by severity and rule.

Parse by grouping lines by file paths (each file path is a header), then parse each violation line extracting line number, column number, severity indicator, message text, and rule name (typically in parentheses at end). Tally violations per file and severity type. The final summary line shows pattern like 'X errors and Y warnings' indicating totals.

Success indicators: File paths identifiable as headers, violation lines parse correctly with line:column:message:rule pattern, severity (error/warning) distinguishable, summary line matches total violation count. Common errors: Violations without proper line:column format, rule name missing or in unexpected format, summary counts don't match parsed violations, mixed output from other tools. Extract carefully and validate counts align.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## eslint-json

**ESLint JavaScript linter JSON report with code quality violations and rule violations**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [ESLint](https://eslint.org/)
- **Format Spec**: [JSON Format](https://eslint.org/docs/user-guide/formatters/)

### Parsing Guide

ESLint JSON reports are JSON arrays where each element represents a linted file. Each file object has filePath (string), messages array, and errorCount/warningCount/fixableErrorCount/fixableWarningCount. Messages array contains violation objects with line, column, message, ruleId, severity (1=warning, 2=error), and optional fix information.

Look for array at root level. Each file object must have filePath and messages array. Messages should have line/column (positive integers), message (string), ruleId (string like 'no-unused-vars'), and severity (1 or 2). When errorCount or warningCount are > 0, messages array should contain corresponding violations. Count total errors/warnings across files.

Success indicators: Root is JSON array, each element has filePath and messages, messages contain line/column/ruleId/severity, severity is 1 or 2, counts match actual message counts. Common errors: Root is not array, filePath missing, messages not array, line/column as strings instead of numbers, severity not 1 or 2, ruleId missing. Validate structure and data types carefully.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## tsc-txt

**TypeScript compiler (tsc) text output with type checking errors and diagnostics**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [TypeScript](https://www.typescriptlang.org/)
- **Format Spec**: [TXT Format](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

### Parsing Guide

TSC text output is plain text showing type errors from TypeScript compilation. Each error line contains filename, line:column location, error code (like TS1234), message text, and the source code line. Errors are grouped by file and severity. Summary at end shows total error count.

Parse by extracting lines with pattern 'filename(line,column): error TS####: message'. Group errors by filename and extract location (line, column as integers) and error code (TS#### format). The message contains the diagnostic message. Source context lines show the actual code with error location marked.

Success indicators: Errors have identifiable filename(line,column) format, error codes are TS#### format, messages are readable, summary count matches parsed errors. Common errors: Error format inconsistent or non-standard, line/column not numeric, missing error codes, context lines make parsing harder (skip them), summary count mismatch. Use regex patterns to extract structured data reliably.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## mypy-txt

**Mypy Python type checker plain text output with type checking errors and diagnostics**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | ✓ |
| Format | txt |

### Tool Information

- **Tool**: [Mypy](https://www.mypy-lang.org/)
- **Format Spec**: [TXT Format](https://mypy.readthedocs.io/en/stable/)

### Parsing Guide

Mypy text output is plain text where each error line contains filename, line:column location, error type, message, and optional error code. Lines are typically formatted as 'filename:line:column: error: message' or 'filename:line:column: note: message'. Messages can span multiple lines for context.

Parse lines matching pattern 'filename:line:column: (error|warning|note): message'. Extract filename, line number (positive integer), column number (positive integer), severity (error/warning/note), and message text. Be prepared for multi-line messages where context information continues on following lines without filename prefix.

Success indicators: Lines match filename:line:column: severity: message pattern, line/column are numeric, severity is one of error/warning/note, messages are descriptive. Common errors: Line/column parsing as strings, severity values unexpected, context lines cause parsing confusion (need special handling for multi-line messages), filename with special characters. Handle carefully and validate numeric fields.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## mypy-ndjson

**Mypy Python type checker output in newline-delimited JSON format with type errors**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Mypy](https://www.mypy-lang.org/)
- **Format Spec**: [JSON Format](https://mypy.readthedocs.io/en/stable/command_line.html#how-to-run-mypy)

### Parsing Guide

Mypy NDJSON is newline-delimited JSON where each line is a separate JSON object (not a JSON array). Each line represents a type error or message with filename, line, column, severity (error/note/warning), and message fields. Lines may also have a function name and category identifying the error type.

Parse by splitting on newlines and parsing each line as separate JSON. Each object should have filename (string, file path), line (positive integer), column (positive integer), message (string), and severity (string: error/note/warning). Count messages and group by severity and filename to understand error distribution.

Success indicators: Lines are valid JSON when parsed individually (not as JSON array), each line has filename/line/column/severity/message, line/column are numbers, severity values are valid. Common errors: Parsing as JSON array instead of NDJSON (will fail), lines with non-JSON content (compiler messages), line/column as strings instead of numbers, missing required fields. Remember this is NOT a single JSON array - each line is independent.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## ruff-txt

**Ruff Python linter text output with fast linting results and code quality violations**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Ruff](https://github.com/astral-sh/ruff)
- **Format Spec**: [TXT Format](https://docs.astral.sh/ruff/)

### Parsing Guide

Ruff text output format is similar to flake8: 'filename:line:column: CODE message'. Each violation contains file path, line number (positive integer), column number (positive integer), error code (like E501, F401, UP001), and message description. Ruff supports hundreds of rules from different linters (pycodestyle, pyflakes, pyupgrade, etc).

Extract filename, line, column, code, and message from each violation line using pattern matching. Group by code and file. Error codes can be from various rule sets (E/W for pycodestyle, F for pyflakes, UP for pyupgrade, etc). The message provides context for the violation.

Success indicators: Lines follow filename:line:column:code message pattern, line/column are numeric, code contains letters and digits, message text is present and descriptive. Common errors: Format variations from different ruff versions, line/column parsing as strings, code format unexpected, malformed file paths. Parse carefully and validate extracted numeric values.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## flake8-txt

**Flake8 Python linter text output with PEP 8 style violations and error codes**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Flake8](https://flake8.pycqa.org/)
- **Format Spec**: [TXT Format](https://flake8.pycqa.org/)

### Parsing Guide

Flake8 text output is plain text with violations in format 'filename:line:column: CODE message'. Each violation shows the file path, line and column numbers, a 4-character error code (like E501, W503, F401), and descriptive message. Violations are typically sorted by file and line number.

Parse each line to extract filename, line number, column number (all as separate integers or numeric strings), error code (4 characters, letter followed by digits), and message text after the code. Group violations by error code and file to understand distribution. Common codes: E#### for PEP 8 errors, W#### for warnings, F#### for PyFlakes issues.

Success indicators: Lines parse into filename:line:column:code message format, line/column are numeric, code is 4-char format (letter+digits), message is descriptive text. Common errors: Format variations between different flake8 versions, line/column not numeric, code format unexpected, message truncated, file paths with colons in name (cause parsing issues). Use careful regex patterns and handle edge cases.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## clippy-txt

**Rust Clippy linter plain text output with code quality warnings and lint messages**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | ✓ |
| Convert to JSON | ✓ |
| Format | txt |

### Tool Information

- **Tool**: [Clippy](https://github.com/rust-lang/rust-clippy)
- **Format Spec**: [TXT Format](https://docs.rust-embedded.org/book/static/clippy.html)

### Parsing Guide

Clippy text output is plain text formatted human-readably. Each warning shows severity (warning/error), message text, location (filename:line:column format), and source code context. Warnings are grouped logically with 'warning:' or 'error:' prefix, followed by lint rule name in brackets, and the message. Source lines show actual code with error location indicated.

Parse lines containing 'warning:' or 'error:' prefix to identify violations. Extract the lint rule name (typically in format like 'clippy::rule_name'), location (filename:line:column), and message. Context lines show code and may be indented. Count warnings and errors separately.

Success indicators: Warning/error lines identifiable by prefix, lint rule names extractable from message, locations in filename:line:column format, source context visible (though optional). Common errors: Warning/error prefix not clearly marked, rule names in unexpected format, location parsing inconsistent, context lines confuse parsing, message continues across lines. Extract structured data carefully.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## clippy-ndjson

**Rust Clippy linter output in newline-delimited JSON format with code quality warnings**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Clippy](https://github.com/rust-lang/rust-clippy)
- **Format Spec**: [JSON Format](https://docs.rust-embedded.org/book/static/clippy.html)

### Parsing Guide

Clippy NDJSON is newline-delimited JSON where each line is a separate JSON object representing a lint warning. Each object contains message field with diagnostic text, code with optional error code, spans array with file locations (filename, line_start, line_end, column_start, column_end), and level field (error/warning/note).

Parse by splitting on newlines and parsing each line as independent JSON. Each object should have message (string), level (error/warning/note), and spans array. Spans contain actual_filename and byte_start/byte_end information indicating violation location. Group warnings by code if present to identify lint rule distribution.

Success indicators: Lines parse as valid JSON individually (NDJSON, not array), each has message/level/spans, level is valid enum, spans contain filename information. Common errors: Parsing as JSON array (wrong), lines with non-JSON output, spans array empty or malformed, level not in valid values, missing message field. Remember NDJSON parsing - each line independent.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## golangci-lint-json

**Golangci-lint Go code linter JSON output with code quality violations and issues**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Golangci-lint](https://golangci-lint.run/)
- **Format Spec**: [JSON Format](https://golangci-lint.run/)

### Parsing Guide

Golangci-lint JSON is a complete JSON object with Issues array and statistics. Root contains Issues (array of violations), Report (summary info), and Statistics. Each Issue object has From/To (positions), Line/Column (location), Text (violation message), Source (code line), and Linter (which linter detected it, like 'golint', 'errcheck').

Look for Issues array - if empty, no violations found. Each Issue must have Line (positive integer), Column (positive integer), Text (message string), and Linter (string identifying source linter). Count issues by Linter to see which checks are failing most. Statistics provide totals for issues found.

Success indicators: Root object has Issues array, each Issue has Line/Column/Text/Linter fields, Line/Column are positive integers, Text is descriptive, Linter field identifies source. Common errors: Missing Issues array, Line/Column as strings instead of numbers, Text empty or missing, Linter field missing, malformed JSON. Validate structure and numeric fields.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## checkstyle-xml

**Checkstyle XML code quality report with style violations and warnings**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | ✓ |
| Format | xml |

### Tool Information

- **Tool**: [Checkstyle](https://checkstyle.sourceforge.io/)
- **Format Spec**: [XML Format](https://checkstyle.sourceforge.io/config.html)

### Parsing Guide

Checkstyle XML reports are XML documents with root element 'checkstyle' containing file elements. Each file element has name attribute (file path) and nested error elements representing style violations. Each error element has line, column, severity (error/warning/info), message, and source attributes.

Parse the XML to iterate through file elements by name attribute. For each file, count the error elements and check their attributes. Errors at line/column 0 typically indicate file-level issues (parsing errors, etc.). Group errors by file and severity to understand distribution of violations. The message attribute typically indicates the specific rule violated.

Success indicators: checkstyle root element exists, file elements present with name attributes, error elements within files have required attributes (line, column, message), severity values are valid (error/warning/info). Common errors: Malformed XML, missing required attributes on error elements, line/column as non-numeric strings, empty message attributes, unexpected root element name. Validate XML structure and attribute types.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## checkstyle-sarif-json

**Checkstyle code quality violations in SARIF (Static Analysis Results Interchange Format) JSON**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | ✓ |
| Format | json |

### Tool Information

- **Tool**: [Checkstyle](https://checkstyle.sourceforge.io/)
- **Format Spec**: [JSON Format](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)

### Parsing Guide

SARIF JSON is a standard JSON format for static analysis results. The root object contains version (string like "2.1.0"), runs array with execution metadata, and results array. Each result has ruleId, message, level (error/warning/note), and locations array indicating where violations occur. Locations contain physicalLocation with artifactLocation (file path), region (line/column information).

Look for runs array with at least one element. Within each run, check results array for violation objects. Each result should have message with text, level (string enum), and locations with file paths and line numbers. Validate that level values are valid (error/warning/note), line/column numbers are positive integers, and file paths are reasonable.

Success indicators: version field present and valid, runs array exists and non-empty, results array within run, each result has message and locations, level values match enum. Common errors: Missing runs or results array, level values not in valid enum, locations with missing or malformed region/physicalLocation, message text missing or empty. This is standard SARIF format - validate against SARIF 2.1.0 schema.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## spotbugs-xml

**SpotBugs (formerly FindBugs) XML Java code bug detection report**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | xml |

### Tool Information

- **Tool**: [SpotBugs](https://spotbugs.readthedocs.io/)
- **Format Spec**: [XML Format](https://spotbugs.readthedocs.io/en/latest/running.html#exporting-results)

### Parsing Guide

SpotBugs XML reports are XML documents with root element 'BugCollection' containing BugInstance elements. Each BugInstance has type attribute (bug type code), abbrev (abbreviation), category (bug category), and priority (priority level). Nested SourceLine and Method elements provide location information. Summary element provides count of bugs and classes analyzed.

Parse the XML to find all BugInstance elements. Each has type attribute identifying the bug pattern (e.g., NP_NULL_ON_SOME_PATH). Extract priority attribute (numeric: 1=high, 2=medium, 3=low) and category. SourceLine provides sourcefile and start/end line numbers. Count bugs by type and priority. Summary element gives total bug count and classes analyzed.

Success indicators: BugCollection root element exists, BugInstance elements present with type attribute, priority is numeric (1/2/3), SourceLine has sourcefile and line attributes, Summary provides counts. Common errors: Malformed XML, missing type or priority attributes, priority not numeric, SourceLine missing sourcefile, Summary element missing. Validate the document is well-formed XML and counts match actual BugInstance elements.


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
