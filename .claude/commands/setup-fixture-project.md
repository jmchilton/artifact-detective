---
description: Setup sample project for fixture generation
---

You are setting up a new sample project to generate test fixtures following the patterns in FIXTURE_PLAN.md.

## User Input

The user will describe a project type, for example:

- "A fairly typical Java maven project"
- "A Go project"
- "A JavaScript project that uses Yarn instead of npm directly"
- "A Python project using poetry"

## Your Task

Create a complete sample project in `fixtures/sample-projects/{language}/` that generates real CI artifacts. Follow this plan:

### 1. Analyze Requirements

From user prompt, determine:

- **Language**: javascript, python, java, go, rust, etc.
- **Build tool**: npm, yarn, maven, gradle, poetry, pip, cargo, go mod, etc.
- **Test framework**: jest, vitest, mocha, pytest, junit, go test, cargo test, etc.
- **Linters/formatters**: eslint, prettier, ruff, black, checkstyle, golangci-lint, clippy, rustfmt, etc.
- **Type checkers**: typescript, mypy, etc.
- **Pinned versions**: Use recent stable versions

### 2. Create Directory Structure

```
fixtures/sample-projects/{language}/
├── Dockerfile                    # Pinned language + tool versions
├── docker-compose.yml            # Orchestrates artifact generation
├── manifest.yml                  # Expected artifacts schema
├── {build-config}                # package.json, pom.xml, Cargo.toml, go.mod, etc.
├── {tool-configs}                # jest.config.js, pytest.ini, .eslintrc, etc.
├── src/                          # Source code with deliberate issues
│   └── {files}                   # Code with linter/type violations
└── test/ or tests/               # Tests with pass/fail/skip mix
    └── {test-files}
```

### 3. Write Dockerfile

- Pin language version (e.g., `FROM node:20.11.0-alpine`, `FROM python:3.11.7-slim`)
- Install dependencies with exact versions
- Copy source code
- Install additional tools (browser for playwright, etc.)
- Create `/output` directory for artifacts

### 4. Write docker-compose.yml

```yaml
version: '3.8'
services:
  generate:
    build: .
    volumes:
      - ../../generated/{language}:/output
    command: /bin/sh -c "
      {run tests with JSON/XML/HTML output};
      {run linters to /output/*.txt};
      {run type checker to /output/*.txt};
      "
```

### 5. Write manifest.yml

Follow this schema:

```yaml
language: {language}
{language}_version: "{version}"
tools:
  - name: {tool1}
    version: "{version}"
  - name: {tool2}
    version: "{version}"

artifacts:
  - file: "{name}.json"
    type: {artifact-type}        # From src/types.ts ArtifactType union
    format: json|xml|html|txt
    description: "{test counts, violation counts, etc.}"
    parsers: []                   # Functions to test, or [] if none
    coverage_target: "{source file}"

commands:
  generate: "docker-compose up --build --abort-on-container-exit"
  clean: "docker-compose down -v && rm -rf ../../generated/{language}"
```

### 6. Create Test Code

Write minimal tests with deliberate outcomes:

- **Passing tests**: 3-5 basic assertions
- **Failing tests**: 1-2 with deliberate failures
- **Skipped tests**: 1 skipped/ignored test

Examples:

- JavaScript/TypeScript: Jest or Vitest tests
- Python: pytest with pass/fail/skip
- Java: JUnit tests
- Go: table-driven tests with t.Skip()
- Rust: #[test], #[should_panic], #[ignore]

### 7. Create Source Code with Issues

Write code with deliberate violations:

- **Linter issues**: unused vars, style violations, complexity warnings
- **Type errors**: (if applicable) missing types, type mismatches
- **Formatter issues**: inconsistent formatting

Aim for 4-8 violations per tool.

### 8. Update Type System (if needed)

If introducing new artifact types:

- Add to `src/types.ts` ArtifactType union
- Add to `ARTIFACT_TYPE_REGISTRY` in `src/validators/index.ts`
- Set `supportsAutoDetection` appropriately
- Create validator function if possible
- Update type detector in `src/detectors/type-detector.ts`

### 9. Generate Artifacts

```bash
cd fixtures/sample-projects/{language}
docker-compose up --build --abort-on-container-exit
docker-compose down -v
```

Commit generated artifacts to `fixtures/generated/{language}/`

### 10. Update Tests

Extend `test/fixture-validation.test.ts`:

- Add language to `languages` array if new
- Tests auto-run based on manifest.yml
- Verify all artifacts generated
- Verify validators pass
- Verify auto-detection works (if supported)
- Verify parsers work (if any)

### 11. Run Tests

```bash
npm test
npm run test:coverage
```

Verify all tests pass and coverage targets met.

## Output Format

Provide the user with:

1. Summary of what was created
2. List of artifacts generated
3. Test results (X/Y passing)
4. Coverage impact
5. Any bugs/issues found
6. Next steps (if any)

## Examples

### JavaScript/npm project

- jest, playwright, eslint, typescript
- 4 artifacts: jest-json, playwright-json, eslint-txt, tsc-txt

### Python project

- pytest, pytest-html, ruff, mypy
- 4 artifacts: pytest-json, pytest-html, ruff-txt, mypy-txt

### Java maven project

- junit, checkstyle, spotbugs
- 3 artifacts: junit-xml, checkstyle-xml, spotbugs-xml

### Go project

- go test, golangci-lint, go vet
- 3 artifacts: gotest-json, golangci-json, govet-txt

## Best Practices

- **Pin all versions** in Dockerfile and dependency files
- **Keep it minimal** - small, focused test cases
- **Deliberate failures** - ensure tools actually detect issues
- **Document quirks** - note tool-specific output patterns in manifest
- **Commit artifacts** - they're version-controlled test data
- **Test first** - verify type system supports artifacts before generating

## Important Notes

- Reference existing sample projects (javascript, python, rust) for patterns
- Follow FIXTURE_PLAN.md conventions exactly
- Use TodoWrite to track progress through the 11 steps
- Ask user for clarification if project type is ambiguous
- Default to best practices for ecosystem if tools not specified
