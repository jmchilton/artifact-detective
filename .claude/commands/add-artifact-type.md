---
description: Add artifact type to existing sample project
---

You are adding a new artifact type to an existing sample project to generate test fixtures.

## User Input

The user will describe an artifact type, for example:
- "eslint json output"
- "prettier output"
- "golangci-lint json"
- "vitest json reporter"
- "jest html reporter"

## Your Task

Add the new artifact type to the appropriate existing sample project, generate the artifact, implement full support in artifact-detective, and test.

### 1. Analyze Artifact Type

From user prompt, determine:
- **Tool name**: eslint, prettier, vitest, jest, golangci-lint, etc.
- **Output format**: json, xml, html, txt
- **Language ecosystem**: javascript, python, java, rust, go
- **Artifact type name**: Follow convention `{tool}-{format}` (e.g., `eslint-json`, `vitest-json`)
- **Whether auto-detection feasible**: Structured formats (JSON/XML/HTML with unique markers) = yes, plain text = usually no

### 2. Find Target Sample Project

Determine which existing sample project to extend:
- JavaScript tools → `fixtures/sample-projects/javascript/`
- Python tools → `fixtures/sample-projects/python/`
- Java tools → `fixtures/sample-projects/java/`
- Rust tools → `fixtures/sample-projects/rust/`
- Go tools → Would need new project (follow /setup-fixture-project)

If no appropriate sample project exists, stop and tell user to run `/setup-fixture-project` first.

### 3. Read Current Configuration

Read the target sample project's:
- `manifest.yml` - Current artifacts and tool versions
- `package.json`/`pom.xml`/`Cargo.toml`/etc - Dependencies
- `Dockerfile` - Build commands
- `docker-compose.yml` - Artifact generation commands

### 4. Update Sample Project

**Add tool dependency** (if not already present):
- JavaScript: Add to `package.json` with pinned version
- Python: Add to `pyproject.toml`
- Java: Add to `pom.xml`
- Rust: Add to `Cargo.toml`

**Update docker-compose.yml command**:
- Add command to generate new artifact type
- Redirect output to `/output/{artifact-name}.{ext}`
- Use `2>&1 | tee` for text outputs
- Use `--output` or similar flags for structured outputs
- Ensure command runs even if it fails (use `|| true` or `;` separator)

**Update manifest.yml**:
- Add new artifact entry with:
  - `file`: Output filename
  - `type`: New artifact type name
  - `format`: json|xml|html|txt
  - `description`: What violations/results expected
  - `parsers`: List relevant parser functions (or `[]`)
  - `coverage_target`: Source file to be covered

**Update source code** (if needed):
- Add code that triggers violations/warnings for the new tool
- Aim for 4-8 violations to ensure tool actually runs

### 5. Generate Artifacts

Run Docker build to generate new artifact:

```bash
cd fixtures/sample-projects/{language}
docker compose up --build --abort-on-container-exit
docker compose down -v
```

Verify new artifact appears in `fixtures/generated/{language}/`

### 6. Update Type System

**Add to `src/types.ts`**:
- Add `"{tool}-{format}"` to `ArtifactType` union
- Create interfaces for structured output if needed (e.g., for JSON/XML with parsing)

**Update `src/detectors/type-detector.ts`**:
- Add detection logic if auto-detection feasible
- For JSON: Check for unique fields/structure
- For XML: Check for unique root elements/attributes
- For HTML: Check for meta tags or specific elements
- For txt: Usually skip (can't reliably auto-detect)

**Create validator** (if feasible):
- Create `src/validators/{tool}-validator.ts`
- Export `validate{Tool}{Format}` function
- Check for structural markers
- Return `ValidationResult`

**Create parser** (if needed):
- Create `src/parsers/{format}/{tool}-parser.ts` if extracting structured data
- Export `extract{Tool}{Format}` function
- Parse and return typed results
- OR extend existing linter extractor in `src/parsers/linters/extractors.ts`

**Register in `src/validators/index.ts`**:
- Import validator
- Export validator
- Add to `ARTIFACT_TYPE_REGISTRY`:
  ```typescript
  "{tool}-{format}": {
    supportsAutoDetection: true/false,
    validator: validate{Tool}{Format} or null,
  }
  ```

**Export from `src/index.ts`** (if adding parser):
- Export parser function
- Export types

### 7. Create/Update Tests

**Create test file** (if new tool category):
- Create `test/{language}-{tool}.test.ts`
- Or extend existing test file for that language

**Add test cases**:
```typescript
describe("{Tool} {Format}", () => {
  const artifactPath = join(
    FIXTURES_DIR,
    "generated/{language}/{artifact-file}",
  );

  it("detects {tool}-{format} by content", () => {
    const result = detectArtifactType(artifactPath);
    expect(result.detectedType).toBe("{tool}-{format}");
    expect(result.originalFormat).toBe("{format}");
  });

  it("validates {tool} {format} content", () => {
    const content = readFileSync(artifactPath, "utf-8");
    const result = validate("{tool}-{format}", content);
    expect(result.valid).toBe(true);
  });

  // Add parser tests if applicable
  it("parses {tool} {format} and extracts data", () => {
    const report = extract{Tool}{Format}(artifactPath);
    expect(report).not.toBeNull();
    // Add specific assertions about parsed structure
  });

  it("has registry entry with correct capabilities", () => {
    const capabilities = ARTIFACT_TYPE_REGISTRY["{tool}-{format}"];
    expect(capabilities).toBeDefined();
    expect(capabilities.supportsAutoDetection).toBe(true/false);
    expect(capabilities.validator).toBeDefined/toBeNull();
  });
});
```

### 8. Run Tests

```bash
npm test
npm run lint
```

If tests fail:
- Fix type system implementation
- Update validators/parsers
- Regenerate artifacts if needed
- Re-run tests until all pass

### 9. Commit Changes

Create conventional commit:
```
feat: add {tool}-{format} artifact type support

- Add {tool}-{format} to ArtifactType union
- Extend {language} sample project to generate {tool} {format} output
- Add {tool} detection/validation/parsing
- Register in ARTIFACT_TYPE_REGISTRY
- Add comprehensive tests for {tool} artifacts
- X/Y tests passing

Enables automated detection of {tool} output from {language} projects.
```

## Tool-Specific Patterns

### ESLint JSON
- Tool: eslint
- Format: json
- Command: `eslint . --format json --output-file /output/eslint-output.json || true`
- Detection: JSON with `results` array, each with `filePath`, `messages`
- Parser: Direct JSON consumption or linter extractor

### Prettier Output
- Tool: prettier
- Format: txt
- Command: `prettier --check . 2>&1 | tee /output/prettier-output.txt || true`
- Detection: Not feasible (plain text)
- Parser: Text pattern matching

### Vitest JSON
- Tool: vitest
- Format: json
- Command: `vitest run --reporter=json --outputFile=/output/vitest-results.json || true`
- Detection: JSON with `testResults` or `numTotalTests` fields
- Parser: Direct JSON consumption, similar to Jest structure

### Jest HTML
- Tool: jest
- Format: html
- Command: `jest --reporters=jest-html-reporter || true` (requires jest-html-reporter package)
- Detection: HTML with `<meta name="generator" content="jest-html-reporter">`
- Parser: Cheerio-based HTML extraction

### Golangci-lint JSON
- Tool: golangci-lint
- Format: json
- Command: `golangci-lint run --out-format json > /output/golangci-output.json || true`
- Detection: JSON with `Issues` array
- Parser: Direct JSON consumption

## Output Format

Provide user with:
1. Summary of artifact type added
2. Sample project extended
3. Type system changes made
4. Artifacts generated (file sizes)
5. Test results (X/Y passing)
6. Coverage impact
7. Any issues encountered
8. Commit message used

## Best Practices

- **Pinned versions**: Add exact version to package.json/pom.xml/etc
- **Fail gracefully**: Use `|| true` so build continues if tool fails
- **Meaningful violations**: Ensure source code triggers actual violations
- **Test thoroughly**: Verify detection, validation, parsing all work
- **Follow patterns**: Match existing artifact type implementations
- **Document quirks**: Note tool-specific output patterns in code comments

## Important Notes

- Always check if tool already exists in sample project dependencies
- Ensure Docker command captures both stdout and stderr for text outputs
- Verify artifact actually generated before implementing type system
- Run full test suite to ensure no regressions
- Use TodoWrite to track progress through the 9 steps
