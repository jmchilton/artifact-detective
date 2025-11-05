# Normalization Guide

Learn how to convert artifacts to JSON format for processing and storage.

## Overview

Normalization converts various artifact formats (HTML, XML, text) into a unified JSON format for easier processing, storage, and analysis.

## Supported Conversions

### Automatic Normalization

These formats can be automatically normalized to JSON:

- **Pytest HTML** → JSON: `pytest normalize pytest-report.html`
- **Jest HTML** → JSON: `pytest normalize jest-report.html`
- **RSpec HTML** → JSON: `normalize rspec-report.html`
- **Mypy Text** → NDJSON: `normalize mypy.txt`
- **Clippy Text** → NDJSON: `normalize clippy.txt`
- **Checkstyle XML** → JSON: `normalize checkstyle.xml`

### Already JSON

These formats are returned as-is:

- Jest JSON: `jest-results.json`
- Playwright JSON: `playwright-results.json`
- Pytest JSON: `pytest-results.json`
- ESLint JSON: `eslint-report.json`

## Basic Usage

### Auto-detect and Normalize

```bash
artifact-detective normalize pytest-report.html --output report.json
```

The tool automatically detects the artifact type and converts it.

### Explicit Type

```bash
artifact-detective normalize report.html --type pytest-html --output report.json
```

### With Description

```bash
artifact-detective normalize pytest-report.html --show-description
```

Includes the artifact type description and parsing guide in the output.

## Common Workflows

### 1. Process HTML Report

```bash
# Normalize HTML report to JSON
artifact-detective normalize pytest-report.html --output report.json

# Query with jq
jq '.tests[] | select(.outcome == "failed")' report.json
```

### 2. Combine Multiple Formats

```bash
# Normalize different formats to JSON
artifact-detective normalize jest-report.html --output jest.json
artifact-detective normalize pytest-report.html --output pytest.json

# Combine
jq -s 'add' jest.json pytest.json > combined.json
```

### 3. CI Pipeline Integration

```bash
#!/bin/bash

# Extract from log if needed
artifact-detective extract pytest-json build.log --output pytest.json

# Normalize to JSON
if [[ $? -eq 0 ]]; then
  artifact-detective normalize pytest.json --output results.json
  
  # Upload results
  curl -X POST -d @results.json https://api.example.com/results
fi
```

### 4. Generate Reports

```bash
# Convert multiple HTML reports to JSON
for report in reports/*.html; do
  output="output/$(basename $report .html).json"
  artifact-detective normalize "$report" --output "$output"
done

# Generate summary
jq -s 'map(.tests | length) | add' output/*.json
```

## Output Formats

### Jest JSON Output

```json
{
  "testResults": [
    {
      "name": "path/to/test.js",
      "numPassingTests": 5,
      "numFailingTests": 0,
      "numPendingTests": 1,
      "failures": []
    }
  ],
  "numTotalTests": 6,
  "numTotalFailures": 0,
  "numTotalPending": 1
}
```

### Pytest JSON Output

```json
{
  "tests": [
    {
      "nodeid": "tests/test_example.py::test_function",
      "outcome": "passed",
      "duration": 0.123,
      "call": {}
    }
  ],
  "passed": 5,
  "failed": 0,
  "skipped": 1
}
```

### NDJSON Formats

Some tools output NDJSON (newline-delimited JSON):

```bash
# Each line is a valid JSON object
{"error": "...", "line": 1}
{"error": "...", "line": 2}
```

Process with:

```bash
jq -s '.' mypy.txt  # Convert to JSON array
```

## API Usage

### JavaScript

```javascript
import { normalizeArtifact, detectArtifactType } from 'artifact-detective';

// Auto-detect and normalize
const json = normalizeArtifact('pytest-report.html');
const data = JSON.parse(json);
console.log(data.tests);

// Explicit type
const json2 = normalizeArtifact('report.html', { 
  type: 'pytest-html' 
});
```

### TypeScript

```typescript
import { 
  normalizeArtifact, 
  canConvertToJSON 
} from 'artifact-detective';

const result = detectArtifactType('report.html');
if (result.detectedType && canConvertToJSON(result)) {
  const json = normalizeArtifact('report.html');
  const tests = JSON.parse(json).tests;
}
```

## Troubleshooting

### Normalization Returns Null

```bash
# Check if artifact is valid first
artifact-detective validate artifact-type file.html

# If valid, try with explicit type
artifact-detective normalize file.html --type artifact-type
```

### Format Not Supported

```bash
# Check supported types
artifact-detective validate jest-json --help

# Try extraction first if it's text output
artifact-detective extract type-txt build.log --output artifact.txt
```

### Incomplete JSON Output

```bash
# Some HTML reports may need special handling
# Try with --show-description to see parsing guide
artifact-detective normalize report.html --show-description
```
