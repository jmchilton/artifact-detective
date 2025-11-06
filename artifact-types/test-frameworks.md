# Test Frameworks

Reference documentation for all test frameworks artifact types.

## Overview

This section covers detailed information for each artifact type in the **Test Frameworks** category.

## jest-json

**Jest JavaScript test framework JSON output with test results and coverage metrics**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Jest](https://jestjs.io/)
- **Format Spec**: [JSON Format](https://jestjs.io/docs/configuration#reporters-arraystring)

### Parsing Guide

Jest JSON reports are complete JSON objects (not NDJSON). The root object contains testResults array where each object represents a test file with detailed results including numPassingTests, numFailingTests, numPendingTests, and failures array.

Look for testResults array - if it exists and has length > 0, the file is likely valid. Each test file entry should have numeric fields (numPassingTests, numFailingTests, numPendingTests) and a failures array containing error details with ancestorTitles (test hierarchy) and failureMessages (actual error text). The top level should also contain numTotalTests, numTotalFailures, and numTotalPending fields.

Success indicators: testResults array present and non-empty, numeric fields are actual numbers (not strings), failures array format is correct. Common errors: Missing testResults field, null or undefined values in required fields, malformed failure messages. Validate that numeric totals match actual test counts and all objects follow the expected schema.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## jest-html

**Jest HTML test report with test results rendered in HTML format**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | ✓ |
| Format | html |

### Tool Information

- **Tool**: [Jest](https://jestjs.io/)
- **Format Spec**: [HTML Format](https://jestjs.io/docs/cli#--coverage)

### Parsing Guide

Jest HTML reports are HTML documents with embedded JSON data. The report contains a <script> tag with id='__JEST_STATE__' that includes a JSON object with complete test results. The HTML also has human-readable sections showing test summaries, individual test results, and coverage information rendered as DOM elements.

Parse the HTML to find the script tag with id='__JEST_STATE__' and extract the JSON content. The JSON follows the same structure as jest-json output with testResults array, summary statistics, and failure details. You may need to strip any HTML entity encoding or script tag content markers. Look for patterns like 'window.jest_' or similar variable assignments.

Success indicators: <script> tag with state data exists, JSON data is properly formatted and parseable, testResults array present in extracted JSON. Common errors: Script tag missing or malformed, JSON data corrupted or partially escaped, wrong script tag selected (may have multiple), missing test result data. Extract carefully and validate resulting JSON parses correctly before using data.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## playwright-json

**Playwright test framework JSON report with test execution results and metadata**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Playwright](https://playwright.dev/)
- **Format Spec**: [JSON Format](https://playwright.dev/docs/test-reporters)

### Parsing Guide

Playwright JSON reports are complete JSON objects with a config object and an array of suites. The root contains metadata fields like configFile, rootDir, and testDir, followed by a suites array where each suite represents a test file or grouping with title and nested tests.

Each suite contains a tests array with test objects having title, status (passed/failed/skipped), duration, and error/retry information. Look for the suites array at root level - if it exists and has content, the file is likely valid. Test objects should have at minimum a title and status field, with duration being a number and error messages being strings when status is failed.

Success indicators: config object present, suites array exists and is non-empty, each suite has tests array, test objects have required fields (title, status). Common errors: Missing config or suites, status values that aren't passed/failed/skipped/skipped, duration values that aren't numbers, missing test titles. Validate that all status values are lowercase and match expected enum values.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## pytest-json

**Pytest test framework JSON report with detailed test execution results and summaries**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Pytest](https://docs.pytest.org/)
- **Format Spec**: [JSON Format](https://docs.pytest.org/en/latest/how-to-use-pytest/junit-xml.html)

### Parsing Guide

Pytest JSON reports are complete JSON objects containing tests array where each element represents a test case with outcome (passed/failed/skipped/error), duration, nodeid (test path), and failure/error information. The root level also includes summary statistics like passed, failed, skipped, and error counts.

Look for tests array at root level containing test objects. Each test object must have outcome (string), duration (number), and nodeid (string path to test). Failed or errored tests include call and longrepr fields with detailed error information. The summary statistics at root (passed, failed, skipped, error as numbers) should match the counts of test outcomes.

Success indicators: tests array exists and is non-empty, all test objects have required fields (outcome, duration, nodeid), outcome values match enum (passed/failed/skipped/error), numeric fields are actual numbers. Common errors: Missing tests array, outcome values that aren't valid enum values, duration as string instead of number, missing nodeid field, longrepr with malformed error text. Cross-validate summary counts against actual test counts.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## pytest-html

**Pytest HTML test report with test results displayed in HTML format with styling and summary**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | ✓ |
| Format | html |

### Tool Information

- **Tool**: [Pytest](https://docs.pytest.org/)
- **Format Spec**: [HTML Format](https://docs.pytest.org/en/latest/)

### Parsing Guide

Pytest HTML reports are HTML documents with test results rendered as DOM elements. The report contains a table or list structure showing test cases with their outcome (passed/failed/skipped), duration, and error messages. The HTML typically includes CSS styling, JavaScript for interactivity, and summary sections showing total pass/fail counts.

Look for table rows or list items representing individual tests. Each row/item should have a status indicator (typically using colors or icons), test name/path, and duration. For failed tests, error details are usually shown in expandable sections or as separate columns. The summary information is typically at the top or bottom showing total passed, failed, skipped counts.

Success indicators: Table or list of tests present, status indicators visible for each test, duration values shown, summary counts visible. Common errors: HTML structure different than expected (not using table), missing test names or paths, duration information missing or unparseble, summary counts missing, error details truncated or not accessible. Use HTML parsing libraries and verify you can extract all required test information.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## junit-xml

**JUnit XML test report format with test suite and test case results**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | xml |

### Tool Information

- **Tool**: [JUnit](https://junit.org/)
- **Format Spec**: [XML Format](https://www.ibm.com/docs/en/radfws/9.6?topic=testing-junit-xml-report)

### Parsing Guide

JUnit XML reports are XML documents with testsuites (root) or testsuite as the top-level element. Each testsuite contains testcase elements with name, classname, and time attributes. Failed or errored tests have nested failure or error elements containing the error message and optional stack trace.

Parse the XML structure to find testsuites/testsuite elements. Each testcase should have name (test method), classname (test class), and time (duration in seconds as string/number). Count the tests and compare against testsuite's tests, failures, errors, skipped attributes. Error details are in CDATA sections or text content of failure/error elements.

Success indicators: XML structure is well-formed, testsuites/testsuite elements exist, testcase elements have name and classname attributes, time attribute present and parseable as number. Common errors: Malformed XML (not well-formed), missing required attributes, time values that can't be converted to numbers, failure/error elements with empty or missing text content. Validate the document is proper XML before parsing.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## surefire-html

**Maven Surefire HTML test report with JUnit test results rendered in HTML**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | html |

### Tool Information

- **Tool**: [Surefire](https://maven.apache.org/surefire/maven-surefire-plugin/)
- **Format Spec**: [HTML Format](https://maven.apache.org/surefire/maven-surefire-report-plugin/)

### Parsing Guide

Surefire HTML reports are HTML documents generated by Maven Surefire plugin. Reports contain summary sections showing total tests, failures, skipped, errors, and success rate as percentages. Test details are displayed in tables with columns for test class/method name, status (success/failure/skip), duration, and error messages for failures.

Parse the HTML to find summary tables showing test counts and success percentage. Then locate the detailed test results table with rows for each test. Each row should have class name, test method, duration, and status. For failed tests, error messages are typically shown in expandable sections or separate columns.

Success indicators: Summary section with test counts and percentage, detailed test results table with status column, test method names and class names visible, duration values present. Common errors: HTML structure varies between Surefire versions, summary counts missing, test table format different than expected, error messages truncated or missing, duration not parseable. Use HTML parsing and be flexible with structure variations.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## go-test-ndjson

**Go test runner JSON output in newline-delimited JSON format with test execution events**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | json |

### Tool Information

- **Tool**: [Go Test](https://golang.org/cmd/go/)
- **Format Spec**: [JSON Format](https://golang.org/cmd/go/#hdr-Test_binary_flag)

### Parsing Guide

Go test NDJSON is newline-delimited JSON where each line is a separate JSON object representing a test event. Each event contains Action (string: run/pass/fail/skip/bench/output), Test (test name), Package (package name), Elapsed (duration in seconds), and Output (optional output text). Events are ordered chronologically representing test execution flow.

Parse by splitting on newlines and parsing each line as independent JSON. Look for Action values: run=test started, pass=test passed, fail=test failed, skip=test skipped. Each test result should have corresponding run/pass or fail event. Group by Test name and Package to build test hierarchy. Elapsed field gives duration as float (seconds).

Success indicators: Lines parse as valid JSON individually (NDJSON), each has Action and Test fields, Action is valid enum (run/pass/fail/skip), Elapsed is numeric when present. Common errors: Parsing as JSON array instead of NDJSON, missing Action field, Test field names inconsistent across events, Elapsed not numeric, events out of order. Handle NDJSON properly.


### Related Information

- See [CLI Reference](../cli/) for command-line usage
- See [API Functions](../api/functions.md) for programmatic usage
- See [Fixtures](../fixtures/) for real-world examples

---

## cargo-test-txt

**Cargo test plain text output from Rust test runner with test results and summary**

### Capabilities

| Feature | Support |
|---------|---------|
| Auto-Detect | ✓ |
| Extract from Log | — |
| Convert to JSON | — |
| Format | txt |

### Tool Information

- **Tool**: [Cargo](https://doc.rust-lang.org/cargo/)
- **Format Spec**: [TXT Format](https://doc.rust-lang.org/cargo/commands/cargo-test.html)

### Parsing Guide

Cargo test output is plain text showing test execution results. Each test result line shows test path/name, result status (ok, FAILED), and duration. Tests are prefixed with 'test ' and indented, followed by result status. Summary at end shows counts like 'test result: ok. X passed; Y failed; Z ignored'.

Parse test result lines with pattern 'test module_path::test_name ... ok' or '... FAILED'. Extract test name and status. Look for summary line with pattern showing counts for passed, failed, and ignored tests. Totals should equal sum of individual test statuses.

Success indicators: Test lines are identifiable with 'test' prefix, status (ok/FAILED) distinguishable, summary line present with counts, counts match parsed tests. Common errors: Output format varies between Rust versions, status not clearly ok/FAILED, test names with special characters hard to parse, summary line format changes, count mismatches. Use careful pattern matching.


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
