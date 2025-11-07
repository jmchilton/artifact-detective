---
description: Implement a normalizer to convert one artifact type to another
---

You are implementing a normalizer that converts one artifact type to another (e.g., jest-txt → jest-json).

## User Input

The user will provide:
- **Source artifact type**: The type you're converting FROM (e.g., `jest-txt`)
- **Target artifact type**: The type you're converting TO (e.g., `jest-json`)

Example: `/implement-normalizer jest-txt jest-json`

## Your Task

Implement a complete normalizer with tests and documentation.

### 1. Validate Setup

Run validation to check both types are ready:

```bash
npm run validate:normalizer <source> <target>
```

If validation fails, stop and report errors - don't proceed without proper setup.

### 2. Understand Source and Target Formats

Read artifact descriptions from `src/docs/artifact-descriptions.yml`:

**Source type**:
- What data/fields can it provide?
- What is the structure/format?
- What are limitations?

**Target type**:
- What structure must you produce?
- What fields are required vs optional?
- What does the validator expect?

Load both fixture files to see real examples:
- Source: `fixtures/extraction-tests/<source>/logs.txt`
- Target: `fixtures/extraction-tests/<target>/logs.txt` (if exists)

### 3. Implement Normalizer Function

Create normalizer in `src/validators/index.ts` (before `ARTIFACT_TYPE_REGISTRY`).

**Key requirements**:
- Function signature: `function normalize<Tool>(filePath: string): string | null`
- Read file at filePath using `readFileSync(filePath, 'utf-8')`
- Parse/extract data from source format
- Build output matching target schema
- Return JSON string or null on error
- **Document limitations** in JSDoc comments

**Limitations to document**:
- What data can you NOT extract from source?
- What fields in target will be incomplete/empty?
- Why (what source format doesn't contain)?

Example:

```typescript
/**
 * Normalize jest text output to Jest JSON format
 *
 * Converts jest-txt (plain text from CI logs) to jest-json structure.
 *
 * What IS preserved:
 * - Test counts (total, passed, failed, pending)
 * - File-level pass/fail status
 * - Basic error messages
 *
 * What IS NOT available (jest-txt doesn't contain):
 * - Full stack traces
 * - Test hierarchy details
 * - Per-test duration
 * - Snapshot information
 */
function normalizeJestText(filePath: string): string | null {
  // Implementation
}
```

### 4. Update Registry Entry

Update source type in `ARTIFACT_TYPE_REGISTRY` in `src/validators/index.ts`:

```typescript
'jest-txt': {
  supportsAutoDetection: false,
  validator: null,
  extract: extractJestFromLog,
  normalize: normalizeJestText,        // ← Add this
  normalizesTo: 'jest-json',           // ← Add this
  artificialType: false,
  isJSON: false,
},
```

**Check that**:
- `normalize` points to your function
- `normalizesTo` matches target type exactly
- Both are set (validation tests check this)

### 5. Create Test Cases

Add to `test/extraction-tests.test.ts` or create new `test/normalizer-*.test.ts`:

**Test 1: Basic conversion**
```typescript
it('normalizes <source> to valid <target> JSON', () => {
  const sourcePath = join(FIXTURES_DIR, '<source>/logs.txt');
  const result = normalize<Tool>(sourcePath);

  expect(result).toBeTruthy();
  const json = JSON.parse(result!);
  expect(json).toBeDefined();
});
```

**Test 2: Validator passes** (if possible)
```typescript
it('normalized output passes <target> validator', () => {
  const sourcePath = join(FIXTURES_DIR, '<source>/logs.txt');
  const result = normalize<Tool>(sourcePath);

  const validation = validate<Target>(result!);
  expect(validation.valid).toBe(true);
});
```

**Test 3: Key fields preserved**
```typescript
it('preserves important fields from source', () => {
  const sourcePath = join(FIXTURES_DIR, '<source>/logs.txt');
  const result = normalize<Tool>(sourcePath);

  const json = JSON.parse(result!);
  // Verify key counts/values match source
  expect(json.numTotalTests).toBe(278);
  expect(json.testResults.length).toBeGreaterThan(0);
});
```

**Test 4: Limitations documented**
```typescript
it('documents limitations in normalizer JSDoc', () => {
  // Check function comments explain what cannot be converted
  // This is a code review check, not an automated test
});
```

### 6. Build and Test

```bash
npm run build
npm run lint
npm test
npm run validate:normalizer <source> <target>
```

All commands must succeed.

### 7. Document Limitations

In the normalizer JSDoc, clearly state:
- What data IS available and preserved
- What data IS NOT available (and why)
- Whether tests fully pass validation

Example of good documentation:

```typescript
/**
 * Normalizer produces valid JSON matching jest-json schema.
 *
 * PRESERVED:
 * ✓ Test suite counts
 * ✓ Pass/fail status per file
 * ✓ Basic error messages
 *
 * NOT PRESERVED (jest-txt doesn't contain):
 * ✗ Full stack traces (only 1-2 line summaries available)
 * ✗ Test nesting hierarchy (only file-level available)
 * ✗ Individual test timing
 * ✗ Snapshot diffs
 *
 * VALIDATION: Output passes jest-json validator's required fields.
 * Some testResults entries may have incomplete failure details.
 */
```

## Success Criteria

✅ Normalizer function implemented and exported
✅ Registry entries updated (normalize + normalizesTo)
✅ Test cases added (at least 2-3 meaningful tests)
✅ All tests pass (npm test)
✅ Lint passes (npm run lint)
✅ Validation passes (npm run validate:normalizer)
✅ Limitations documented in JSDoc
✅ Code builds successfully

## Common Issues

**"Target validator fails"**
- Document this as a known limitation
- Validator may be stricter than source data allows
- Test specific fields instead of full validation

**"Normalizer returns null"**
- Check error handling - should only return null on actual errors
- Validation failures should not cause null return
- Add try-catch around parsing

**"Registry validation fails"**
- Ensure `normalize` and `normalizesTo` both set
- Check spelling/exact type names match
- Run `npm run validate:normalizer` for detailed errors

## See Also

- `docs/guides/implementing-normalizers.md` - Detailed guide
- `src/docs/artifact-descriptions.yml` - Source/target format docs
- `src/validators/*-validator.ts` - Examples of what validators expect
