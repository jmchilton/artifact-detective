# Implementing Normalizers

A normalizer converts one artifact type to another, typically converting text output to JSON format. Examples:
- `mypy-txt` → `mypy-json` (normalize text to JSON array)
- `jest-txt` → `jest-json` (normalize text to structured JSON)
- `pytest-html` → `pytest-json` (parse HTML to extract JSON)

## Key Concepts

**Source Type**: The artifact type you're converting FROM (e.g., `jest-txt`)
**Target Type**: The artifact type you're converting TO (e.g., `jest-json`)

**Important**:
- Source type must have an **extractor** (defined in `extractors.ts`)
- Target type must have a **validator** (defined in `*-validator.ts`)
- Target type may be "artificial" - generated only through normalization

## Implementation Checklist

### 1. Understand Source and Target

Examine both artifact descriptions in `src/docs/artifact-descriptions.yml`:
- **Source**: What fields/patterns can you extract?
- **Target**: What structure must you produce?

Example: jest-txt → jest-json
- Source: PASS/FAIL lines, test counts, error snippets
- Target: `{ numTotalTests, testResults: [{name, status, failures}] }`

### 2. Create Normalizer Function

Add to `src/validators/index.ts` (before `ARTIFACT_TYPE_REGISTRY`):

```typescript
/**
 * Normalize jest text output to Jest JSON format
 *
 * Limitations:
 * - Cannot extract detailed stack traces (jest-txt has limited error info)
 * - Cannot reconstruct test hierarchy (uses "›" separators when available)
 * - Per-test duration not available (only file-level timing)
 */
function normalizeJestText(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Parse jest-txt format
    const lines = content.split('\n');

    // Extract test counts from summary lines
    const testSuitesMatch = content.match(/Test Suites:.*?(\d+)\s+failed.*?(\d+)\s+passed.*?(\d+)\s+total/);
    const testsMatch = content.match(/Tests:.*?(\d+)\s+passed.*?(\d+)\s+failed.*?(\d+)\s+total/);

    // Build jest-json structure
    const result = {
      numTotalTests: testsMatch ? parseInt(testsMatch[3]) : 0,
      numTotalFailures: testsMatch ? parseInt(testsMatch[2]) : 0,
      numPassedTests: testsMatch ? parseInt(testsMatch[1]) : 0,
      numPendingTests: 0,
      testResults: parseTestResults(lines),
    };

    return JSON.stringify(result, null, 2);
  } catch (e) {
    return null;
  }
}

// Helper function to parse individual test results
function parseTestResults(lines: string[]): any[] {
  // Implementation: parse PASS/FAIL lines and failure sections
}
```

### 3. Update Registry Entries

In `ARTIFACT_TYPE_REGISTRY`, update the **source type**:

```typescript
'jest-txt': {
  supportsAutoDetection: false,
  validator: null,
  extract: extractJestFromLog,
  normalize: normalizeJestText,           // ← Add normalizer
  normalizesTo: 'jest-json',               // ← Add target type
  artificialType: false,
  isJSON: false,
},
```

The **target type** entry (jest-json) typically already exists. If target is "artificial" (only created via normalization), mark it:

```typescript
'mypy-json': {
  supportsAutoDetection: false,
  validator: validateMyPyJSON,
  extract: null,
  normalize: null,
  normalizesTo: null,
  artificialType: true,          // ← Mark as artificial
  isJSON: true,
},
```

### 4. Create Test Case

Add to `test/extraction-tests.test.ts` or create new test file:

```typescript
describe('jest-txt to jest-json normalization', () => {
  it('normalizes jest-txt to valid jest-json structure', () => {
    const sourceFixturePath = join(FIXTURES_DIR, 'jest-txt/logs.txt');
    const sourceContent = readFileSync(sourceFixturePath, 'utf-8');

    // Extract source content
    const extracted = extractLinterOutput('jest', sourceContent);
    expect(extracted).toBeTruthy();

    // Normalize to JSON
    const normalized = normalizeJestText(sourceFixturePath);
    expect(normalized).toBeTruthy();

    // Parse and validate structure
    const jsonData = JSON.parse(normalized!);
    expect(jsonData.numTotalTests).toBeDefined();
    expect(jsonData.testResults).toBeInstanceOf(Array);
    expect(jsonData.testResults.length).toBeGreaterThan(0);
  });

  it('validates normalized output with jest-json validator', () => {
    const sourceFixturePath = join(FIXTURES_DIR, 'jest-txt/logs.txt');
    const normalized = normalizeJestText(sourceFixturePath);

    // Validate with target type validator
    const validationResult = validateJestJSON(normalized!);
    expect(validationResult.valid).toBe(true);
  });

  it('preserves test counts in normalization', () => {
    const sourceFixturePath = join(FIXTURES_DIR, 'jest-txt/logs.txt');
    const normalized = normalizeJestText(sourceFixturePath);

    const jsonData = JSON.parse(normalized!);

    // Verify counts match source
    // Source: Test Suites: 1 failed, 277 passed, 278 total
    // Tests: 277 passed, 1 failed, 278 total
    expect(jsonData.numTotalTests).toBe(278);
    expect(jsonData.numTotalFailures).toBe(1);
    expect(jsonData.numPassedTests).toBe(277);
  });
});
```

### 5. Document Limitations

Include in normalizer function comments:

```typescript
/**
 * Normalize jest text output to Jest JSON format
 *
 * Converts jest-txt (plain text) to jest-json structure.
 *
 * What IS preserved:
 * - Test counts (total, passed, failed, pending)
 * - File-level pass/fail status
 * - Basic error messages (first 2-3 lines)
 *
 * What IS NOT available (jest-txt doesn't contain this):
 * - Full stack traces (only summary available in text output)
 * - Test hierarchy/nesting details (jest-txt is file-level)
 * - Per-test duration (only file duration captured)
 * - Snapshot diffs
 * - Full assertion details
 *
 * Result: Normalizer produces valid JSON matching jest-json schema,
 * but some testResults entries may have incomplete failure details.
 */
function normalizeJestText(filePath: string): string | null {
```

### 6. Validation Command

Check your normalizer is properly wired:

```bash
npm run validate:normalizer jest-txt jest-json
```

This checks:
- ✓ Source type exists and has extractor
- ✓ Source type registry entry has normalize function
- ✓ Source type registry entry has normalizesTo set to target
- ✓ Target type exists
- ✓ Target type has validator
- ✓ Fixtures exist for both types

### 7. Run Tests

```bash
npm run build
npm run lint
npm test
```

## Common Issues

❌ **Normalizer returns null even though logic looks correct**
- Solution: Check error handling - return null only on actual errors, not validation failures

❌ **Target validator fails validation**
- Solution: Document this as a limitation. Validator may be stricter than source data allows. Update test to check specific fields instead of full validation.

❌ **Test counts don't match**
- Solution: Verify parsing regex patterns against actual fixture content. Use grep to find exact format.

❌ **Normalizer not called during extraction**
- Solution: Check registry entry has `normalize: normalizerFunction` and `normalizesTo: 'target-type'`

## Examples

### Simple: NDJSON → JSON Array

```typescript
function normalizeMyPyNDJSON(filePath: string): string | null {
  const lines = readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(l => l.trim());

  const results = [];
  for (const line of lines) {
    try {
      results.push(JSON.parse(line));
    } catch {
      // Skip invalid lines
    }
  }

  return JSON.stringify(results);
}
```

### Complex: HTML → JSON

```typescript
function normalizePytestHTML(filePath: string): string | null {
  const html = readFileSync(filePath, 'utf-8');
  const dom = parse(html);

  // Parse HTML structure to extract test data
  const results = {
    tests: [],
    summary: {},
  };

  // Query DOM for test rows, extract data
  // Build JSON structure

  return JSON.stringify(results);
}
```

### Artificial Types

If target type is "artificial" (only created via normalization), mark it with `artificialType: true` and document in `artifact-descriptions.yml`:

```yaml
mypy-json:
  fileExtension: 'json'
  shortDescription: 'Mypy Python type checker errors normalized to JSON array format (artificial type from mypy-ndjson normalization)'
  ...
  parsingGuide: |
    This type is generated by normalizing mypy-ndjson or mypy-txt...
    It does not occur naturally from mypy output but is created by
    the artifact-detective normalization process.
```

## See Also

- `docs/guides/adding-artifact-types.md` - Adding new artifact types
- `src/validators/` - Validator implementations to understand target schema
- `src/docs/artifact-descriptions.yml` - Source/target documentation
