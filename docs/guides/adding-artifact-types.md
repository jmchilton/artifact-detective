# Adding a New Artifact Type

When adding support for a new artifact type (e.g., `jest-txt`), you must make changes in 6 locations. This checklist ensures nothing is missed.

## Pre-Implementation

1. Decide if you're extracting (text → text) or normalizing (text → JSON)
2. Gather sample output logs
3. Read the artifact type naming convention: `<tool>-<format>` (e.g., `jest-txt`, `eslint-json`)

## Implementation Checklist

### 1. **src/types.ts** - Add to ArtifactType union
Add your type to the `ArtifactType` union in strict alphabetical order:

```typescript
export type ArtifactType =
  | 'existing-type'
  | 'jest-txt'  // ← New type here, alphabetically ordered
  | 'next-type'
```

**Why:** TypeScript enforcement - prevents using undefined types throughout codebase.

---

### 2. **src/parsers/linters/extractors.ts** - Implement extraction logic
If your type needs extraction (e.g., pulling Jest output from CI logs):

Add the extraction function:
```typescript
function extractJestOutput(lines: string[]): string | null {
  // Implementation: parse lines and return extracted content or null
}
```

Register it in the switch statement in `extractLinterOutput()`:
```typescript
case 'jest':
  return extractJestOutput(lines);
```

**Why:** This is where the actual content extraction happens from raw logs.

**Note:** Only needed if extraction from logs is required. Skip for JSON types or types without extraction needs.

---

### 3. **src/validators/index.ts** - Create wrapper and register
Create a wrapper function that calls your extraction:

```typescript
function extractJestFromLog(logContents: string, config?: ExtractorConfig): string | null {
  return extractLinterOutput('jest', logContents, config);
}
```

Add entry to `ARTIFACT_TYPE_REGISTRY`:
```typescript
'jest-txt': {
  supportsAutoDetection: false,  // Set to true if detectable from content
  validator: null,                // Set if content validation needed
  extract: extractJestFromLog,     // Set if extraction from logs needed
  normalize: null,                 // Set if text→JSON normalization needed
  normalizesTo: null,              // Target type if normalizing
  artificialType: false,           // Set true only for normalized output types
  isJSON: false,                   // true only for JSON types
},
```

**Why:** Central registry that connects types to their capabilities.

**Critical:** Every artifact type MUST have a registry entry or it will fail at runtime.

---

### 4. **src/docs/artifact-descriptions.yml** - Add description metadata
Add an entry in alphabetical order:

```yaml
jest-txt:
  fileExtension: 'txt'
  shortDescription: 'Jest JavaScript test framework plain text output with test results and summaries'
  toolUrl: 'https://jestjs.io/'
  formatUrl: 'https://jestjs.io/docs/cli#--no-coverage'
  parsingGuide: |
    Jest text output is plain text formatted human-readably. [Detailed explanation...]

    [Include: what the format looks like, how to parse it, common patterns]

    Success indicators: [What indicates valid content]
    Common errors: [What often goes wrong]
```

**Why:** Critical for three things:
1. Tests check that descriptions exist (see test #2 in validation)
2. Used by `extract()` function to build artifact descriptors
3. Provides documentation for AI agents and users

**This step is MANDATORY** - without it, extraction will return null even if logic is correct.

---

### 5. **fixtures/extraction-tests/manifest.yml** - Add test fixture entry
Create a `fixtures/extraction-tests/<type>/logs.txt` file with sample output, then add to manifest:

```yaml
extraction-tests:
  - artifact-type: jest-txt
    description: "Jest text output from a Galaxy build"
    log-file: "jest-txt/logs.txt"
    include:
      - string: "PASS"
      - string: "FAIL"
      - regex: 'Test Suites:'
    exclude:
      - regex: '^\d{4}-\d{2}-\d{2}T'  # Remove timestamps
      - string: "##["                  # Remove GitHub Actions markers
```

**Patterns:**
- `string: "text"` - Must be present in extracted output
- `regex: "pattern"` - Must match in extracted output
- `lint: "text"` - Lint-style substring match

**Why:** Automated tests verify extraction produces correct content with expected patterns included/excluded.

---

### 6. **fixtures/extraction-tests/<type>/logs.txt** - Add sample log file
Place actual tool output in the fixture directory.

**Tips:**
- Include real examples with both passing and failing cases if applicable
- Should be representative of actual CI log output
- File size typically 5KB-50KB depending on tool

**Why:** Tests run extraction against real output to verify correctness.

---

## Validation

After making changes, run these commands:

```bash
# Check TypeScript compilation
npm run build

# Run linter
npm run lint

# Run all tests (including new fixture tests)
npm test

# (Soon) Validate new artifact type is wired correctly
npm run validate:new-artifact <type-name>
```

## Common Mistakes

❌ **Missing artifact description** - Extraction returns null even though code works
- Solution: Add entry to `artifact-descriptions.yml`

❌ **Typo in registry key** - Type is registered but not found
- Solution: Ensure `ArtifactType` union and registry key match exactly

❌ **Extractor function not registered in switch** - Extraction never called
- Solution: Add `case` in `extractLinterOutput()` switch statement

❌ **Non-deterministic patterns** - Tests pass locally but fail in CI
- Solution: Use `include`/`exclude` patterns in manifest that match reliably

❌ **Over-filtering in exclude patterns** - Valid content gets removed
- Solution: Test patterns against sample output before committing

## Example: Adding `jest-txt` (Complete Walkthrough)

1. ✅ Type added to `src/types.ts`
2. ✅ `extractJestOutput()` implemented in `src/parsers/linters/extractors.ts`
3. ✅ `extractJestFromLog()` wrapper + registry entry in `src/validators/index.ts`
4. ✅ Description added to `src/docs/artifact-descriptions.yml`
5. ✅ Manifest entry + test fixture in `fixtures/extraction-tests/jest-txt/`
6. ✅ All tests pass

---

## Advanced: Normalization (Text → JSON)

If your type normalizes to JSON (e.g., `mypy-txt` → `mypy-json`):

```typescript
// src/validators/index.ts
function normalizeMyPyText(filePath: string): string | null {
  // Read file, parse, convert to JSON, return JSON string
}

'mypy-txt': {
  extract: extractMyPyOutput,
  normalize: normalizeMyPyText,
  normalizesTo: 'mypy-json',  // ← Must exist as artifact type too
  isJSON: false,
},

'mypy-json': {
  validator: null,
  extract: null,
  normalize: null,
  normalizesTo: null,
  artificialType: true,  // ← Mark as artificial if user-facing detection shouldn't find it
  isJSON: true,
},
```

Add both types to `artifact-descriptions.yml` and `src/types.ts`.

---

## Questions?

Check existing similar types:
- `eslint-txt` / `eslint-json` - Text extraction without normalization
- `mypy-ndjson` / `mypy-json` - NDJSON normalization to JSON array
- `jest-json` / `jest-html` - Multiple formats for same tool
