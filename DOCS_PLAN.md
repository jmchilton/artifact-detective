# Artifact Type Documentation Enhancement Plan

## Goal
Add comprehensive AI-agent-friendly documentation for each artifact type. Create structured descriptions that help AI systems understand how to parse, validate, and extract data from each artifact format.

## 1. New Interface Type

### ArtifactDescription
```typescript
export interface ArtifactDescription {
  type: ArtifactType;
  shortDescription: string;                    // 1-2 sentence summary
  toolUrl?: string;                            // Link to tool's official site
  formatUrl?: string;                          // Link to format spec/docs
  parsingGuide: string;                        // 2-3 paragraph detailed guide for AI agents
}
```

### Location
- File: `src/docs/artifact-descriptions.ts`
- Contains interface and function to load descriptions from YAML
- Exports: `ArtifactDescription`, `loadArtifactDescriptions()`, `getArtifactDescription()`

## 2. YAML Documentation File

### Location & Structure
- File: `src/docs/artifact-descriptions.yml`
- One entry per ArtifactType
- YAML structure:
```yaml
jest-json:
  shortDescription: "Jest JavaScript test framework JSON output with test results and coverage"
  toolUrl: "https://jestjs.io/"
  formatUrl: "https://jestjs.io/docs/configuration#reporters-arraystring"
  parsingGuide: |
    Jest JSON reports are complete JSON objects (not NDJSON). The root structure contains testResults array
    where each object represents a test file with detailed results (numPassingTests, numFailingTests, failures array, etc.).

    Look for testResults array - if it exists and has length > 0, the file is likely valid. Each test file entry
    should have numPassingTests + numFailingTests + numPendingTests > 0. Failures array should contain error details
    with ancestorTitles (test hierarchy) and failureMessages (actual error text).

    Success indicators: testResults array present, non-empty, each entry has expected numeric fields and passes
    structural validation. Common errors: Missing testResults field, entries with null/undefined values, malformed
    failure messages. AI agents should validate numeric fields are actually numbers, arrays are arrays, and required
    fields like status and title exist in test objects.
```

### Entry Count & Validation
- Must have entries for all 28 ArtifactTypes (including binary, unknown, artificial types)
- Test validates: all keys in ArtifactType union have corresponding YAML entries
- Runtime validation: Loading YAML checks for any missing types

## 3. Breaking Changes to Existing Functions

### ValidationResult (src/validators/types.ts)
**Before:**
```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

**After:**
```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
  description?: ArtifactDescription;        // New: Include description on successful validation
}
```

### convertToJSON (src/validators/index.ts)
**Before:**
```typescript
export function convertToJSON(
  result: { detectedType: ArtifactType },
  filePath: string,
): string | null
```

**After:**
```typescript
export interface ConversionResult {
  json: string;
  description: ArtifactDescription;
}

export function convertToJSON(
  result: { detectedType: ArtifactType },
  filePath: string,
): ConversionResult | null
```

### extractArtifactToJson (src/validators/index.ts)
**Before:**
```typescript
export interface ArtifactJsonResult {
  json: string;
  effectiveType: ArtifactType;
}
```

**After:**
```typescript
export interface ArtifactJsonResult {
  json: string;
  effectiveType: ArtifactType;
  description: ArtifactDescription;        // New: Include description
}
```

### validate (src/validators/index.ts)
**Before:**
```typescript
export function validate(type: ArtifactType, content: string): ValidationResult
```

**After:**
```typescript
export function validate(type: ArtifactType, content: string): ValidationResult {
  // If valid, include description in result
  // Return early with error (no description) if invalid
}
```

## 4. File Changes Required

### New Files
- `src/docs/artifact-descriptions.ts` - Interface, loader, helpers
- `src/docs/artifact-descriptions.yml` - YAML with all 28 type descriptions

### Modified Files
- `src/validators/types.ts` - Add ArtifactDescription interface, update ValidationResult
- `src/validators/index.ts` - Update validate(), convertToJSON(), extractArtifactToJson(), add ConversionResult interface
- `src/index.ts` - Export new types and descriptions module
- `test/docs.test.ts` - New test file:
  - Validate all ArtifactType union members have YAML entries
  - Validate ArtifactDescription objects are non-empty and well-formed
  - Test description loading and lookup functions

### Affected Test Updates
- `test/json-conversion.test.ts` - Update convertToJSON tests to expect ConversionResult
- `test/validators.test.ts` - Update validate tests to check for description in result
- `test/extraction.test.ts` - Update extractArtifactToJson tests (if exists)

## 5. Content Guidelines for Descriptions

### shortDescription (1-2 sentences)
- Tool name and primary purpose
- Key output information (e.g., "Test results and coverage metrics")
- Example: "Jest JavaScript test framework JSON output with test results and coverage"

### parsingGuide (2-3 paragraphs for AI agents)
**Paragraph 1 - Format Overview:**
- File format type (JSON, NDJSON, XML, HTML, text)
- Root structure (array, object, lines)
- Key top-level fields/patterns
- Example: "Jest JSON reports are complete JSON objects (not NDJSON). Root contains testResults array where each entry represents a test file with detailed results..."

**Paragraph 2 - Parsing & Validation:**
- What fields to check for presence/validity
- Data type validation expectations
- Required vs optional fields
- Error indicators
- Example: "Look for testResults array with length > 0. Each entry should have numPassingTests (number), failures (array), status (string). Validate that numeric fields are actual numbers, not strings..."

**Paragraph 3 - Success & Error Indicators:**
- Success: What indicates a valid file?
- Common errors: What breaks frequently?
- Failure detection: How to identify broken/incomplete files?
- Example: "Success indicators: testResults present, non-empty, proper numeric totals. Common errors: Missing testResults, null values, malformed failure messages. AI should validate totals match actual test counts..."

## 6. Implementation Order

1. **Create types** - Add ArtifactDescription interface to validators/types.ts
2. **Create YAML** - Write artifact-descriptions.yml with all 28 entries
3. **Create loader** - Implement loading/validation logic in docs/artifact-descriptions.ts
4. **Update types** - Modify ValidationResult, add ConversionResult
5. **Update functions** - Modify validate(), convertToJSON(), extractArtifactToJson()
6. **Add exports** - Export new types from index.ts
7. **Create tests** - Add docs.test.ts with comprehensive validation
8. **Update existing tests** - Fix all tests that use modified functions
9. **Documentation** - Update README if needed

## 7. Testing Strategy

### docs.test.ts (New)
```typescript
describe('Artifact Descriptions', () => {
  describe('YAML coverage', () => {
    it('has entries for all ArtifactType union members', () => {
      const descriptions = loadArtifactDescriptions();
      const allTypes: ArtifactType[] = [
        'jest-json', 'playwright-json', 'pytest-json',
        // ... all 28 types
      ];
      for (const type of allTypes) {
        expect(descriptions[type]).toBeDefined();
      }
    });

    it('descriptions are well-formed', () => {
      const descriptions = loadArtifactDescriptions();
      for (const [type, desc] of Object.entries(descriptions)) {
        expect(desc.type).toBe(type);
        expect(desc.shortDescription).toBeTruthy();
        expect(desc.shortDescription.length).toBeLessThan(200);
        expect(desc.parsingGuide).toBeTruthy();
        expect(desc.parsingGuide.split('\n').length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('description loading', () => {
    it('loads descriptions synchronously', () => {
      const desc = getArtifactDescription('jest-json');
      expect(desc).toBeDefined();
      expect(desc.type).toBe('jest-json');
    });

    it('returns null for unknown type', () => {
      const desc = getArtifactDescription('unknown-type' as ArtifactType);
      expect(desc).toBeNull();
    });
  });
});
```

### Updated existing tests
- `json-conversion.test.ts`: Check result.description exists and is valid
- `validators.test.ts`: Check ValidationResult includes description when valid

## 8. Breaking Changes Summary

| Function | Change | Impact |
|----------|--------|--------|
| `validate()` | Returns ValidationResult with optional description | Code checking result.error only still works |
| `convertToJSON()` | Returns ConversionResult instead of string | **BREAKING** - must update return type handling |
| `extractArtifactToJson()` | ArtifactJsonResult now has description field | **BREAKING** - must handle new field |
| `ValidationResult` | Added optional description field | Additive, backward compatible for most uses |

## 9. Success Criteria

- ✅ All 28 ArtifactTypes have descriptions in YAML
- ✅ ArtifactDescription interface well-defined and exported
- ✅ Description loader validates completeness at runtime
- ✅ validate() includes description in successful results
- ✅ convertToJSON() returns ConversionResult with description
- ✅ extractArtifactToJson() includes description in result
- ✅ Comprehensive docs.test.ts validating all descriptions
- ✅ All existing tests updated and passing
- ✅ 715+ tests pass after all changes

## 10. Artifact Type Coverage (28 types)

**Real Tool Types (24):**
- Test Frameworks: jest-json, playwright-json, pytest-json, pytest-html, jest-html, surefire-html, junit-xml
- Linters: eslint-json, eslint-txt, tsc-txt, flake8-txt, ruff-txt, mypy-txt, clippy-txt, clippy-ndjson, golangci-lint-json
- Type Checkers: mypy-ndjson, checkstyle-xml, checkstyle-sarif-json, spotbugs-xml
- Formatters: rustfmt-txt, gofmt-txt
- Test Runners: cargo-test-txt, go-test-ndjson

**Artificial Normalized Types (3):**
- mypy-json, go-test-json, clippy-json

**Meta Types (1):**
- binary, unknown (2 total)

Total: 28 types

---

This plan provides comprehensive documentation infrastructure that helps both AI agents and human developers understand how to work with each artifact type.
