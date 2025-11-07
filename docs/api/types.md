# TypeScript Types Reference

Complete reference of all TypeScript types and interfaces exported by artifact-detective.

## Core Types

### ArtifactType

Union type of all supported artifact types.

```typescript
type ArtifactType =
  | 'playwright-json' | 'jest-json' | 'jest-html'
  | 'pytest-json' | 'pytest-html'
  | 'junit-xml' | 'checkstyle-xml' | 'checkstyle-sarif-json'
  | 'spotbugs-xml' | 'surefire-html'
  | 'eslint-json' | 'eslint-txt'
  | 'mypy-ndjson' | 'mypy-json' | 'mypy-txt'
  | 'tsc-txt'
  | 'ruff-txt' | 'flake8-txt'
  | 'cargo-test-txt'
  | 'clippy-ndjson' | 'clippy-json' | 'clippy-txt'
  | 'rustfmt-txt' | 'gofmt-txt'
  | 'go-test-ndjson' | 'go-test-json'
  | 'golangci-lint-json'
  | 'isort-txt' | 'black-txt'
  | 'rspec-json' | 'rspec-html'
  | 'binary' | 'unknown'
```

**Categories:**
- **Test Frameworks**: jest-*, playwright-*, pytest-*, junit-*, surefire-*, go-test-*, rspec-*, cargo-test-*
- **Linters**: eslint-*, tsc-*, mypy-*, ruff-*, flake8-*, clippy-*, golangci-lint-*
- **Formatters**: rustfmt-*, gofmt-*, isort-*, black-*
- **Special**: checkstyle-*, spotbugs-*, binary, unknown

---

### OriginalFormat

File format determined by extension.

```typescript
type OriginalFormat = 'json' | 'xml' | 'html' | 'txt' | 'binary'
```

---

### DetectionResult

Result of artifact type detection.

```typescript
interface DetectionResult {
  detectedType: ArtifactType;      // Detected artifact type
  originalFormat: OriginalFormat;   // File format (by extension)
  isBinary: boolean;                // Whether file is binary
}
```

**Example:**
```typescript
import { detectArtifactType } from 'artifact-detective';

const result = detectArtifactType('./report.html');
// {
//   detectedType: 'pytest-html',
//   originalFormat: 'html',
//   isBinary: false
// }
```

---

### ValidationResult

Result of validating artifact content.

```typescript
interface ValidationResult {
  valid: boolean;                  // Validation passed
  error?: string;                  // Error message if invalid
  artifact?: ArtifactDescriptor;    // Full artifact metadata if valid
}
```

**Example:**
```typescript
import { validate } from 'artifact-detective';

const result = validate('jest-json', content);
if (result.valid) {
  console.log('Valid artifact');
  console.log(result.artifact?.toolUrl);
  console.log(result.artifact?.fileExtension);
}
```

---

### ConversionResult

Result of converting artifact to JSON.

```typescript
interface ConversionResult {
  json: string;                     // JSON content as string
  description: ArtifactDescription; // Artifact information
}
```

---

### ArtifactJsonResult

Result of extracting and converting artifact to JSON.

```typescript
interface ArtifactJsonResult {
  json: string;                    // JSON content as string
  effectiveType: ArtifactType;     // Type after conversion
  description?: ArtifactDescription; // Artifact information
}
```

---

## Capability Types

### ArtifactTypeCapabilities

Registry entry describing what operations an artifact type supports.

```typescript
interface ArtifactTypeCapabilities {
  supportsAutoDetection: boolean;           // Reliable detection possible
  validator: ValidatorFunction | null;      // Validate function
  extract: ExtractFromLogFunction | null;   // Extract from log function
  normalize: NormalizeFunction | null;      // Normalize to JSON function
  normalizesTo: ArtifactType | null;       // Type after normalization
  artificialType: boolean;                  // Only exists after normalization
  isJSON: boolean;                          // Already in JSON format
}
```

**Example:**
```typescript
import { ARTIFACT_TYPE_REGISTRY } from 'artifact-detective';

const capabilities = ARTIFACT_TYPE_REGISTRY['pytest-html'];
console.log(capabilities.isJSON);           // false (HTML format)
console.log(capabilities.normalize !== null); // true (can convert)
console.log(capabilities.supportsAutoDetection); // true
```

---

### ValidatorFunction

Function signature for artifact validators.

```typescript
type ValidatorFunction = (content: string) => ValidationResult
```

---

### ExtractFromLogFunction

Function signature for extracting artifacts from CI logs.

```typescript
type ExtractFromLogFunction = (
  content: string,
  config?: ExtractorConfig
) => string | null
```

---

### NormalizeFunction

Function signature for converting artifacts to JSON.

```typescript
type NormalizeFunction = (filePath: string) => string | null
```

---

### ExtractorConfig

Configuration for artifact extraction from logs.

```typescript
interface ExtractorConfig {
  startMarker?: RegExp | string;    // Regex to find start of section
  endMarker?: RegExp | string;      // Regex to find end of section
  includeEndMarker?: boolean;       // Include end marker in output
}
```

**Example:**
```typescript
import { extractArtifactFromLog } from 'artifact-detective';

const config: ExtractorConfig = {
  startMarker: /^=== LINTER RESULTS ===/,
  endMarker: /^=== END RESULTS ===/,
  includeEndMarker: false
};

const output = extractArtifactFromLog('eslint-txt', logContent, config);
```

---

## Description Types

### ArtifactDescription

Documentation metadata for an artifact type.

```typescript
interface ArtifactDescription {
  toolUrl: string;              // Official tool documentation
  shortDescription: string;     // One-line summary
  parsingGuide: string;         // Detailed parsing information
  formatUrl: string;            // Format specification
}
```

**Example:**
```typescript
import { getArtifactDescription } from 'artifact-detective';

const desc = getArtifactDescription('jest-json');
// {
//   toolUrl: 'https://jestjs.io',
//   shortDescription: 'Jest JSON test reporter output...',
//   parsingGuide: 'Jest JSON contains...',
//   formatUrl: 'https://jestjs.io/docs/en/configuration.html'
// }
```

---

## Report Types

### Pytest Types

#### PytestTest

Single test case from pytest.

```typescript
interface PytestTest {
  nodeid: string;           // Test identifier
  outcome: string;          // 'passed', 'failed', 'skipped'
  log?: string;             // Captured output and errors
  extras?: Array<Record<string, unknown>>; // Media attachments
  setup?: {
    outcome: string;
  };
  call?: {
    outcome: string;
    longrepr?: string;      // Error traceback
  };
  teardown?: {
    outcome: string;
  };
}
```

#### PytestReport

Complete pytest report.

```typescript
interface PytestReport {
  created: number;                        // Timestamp
  exitCode: number;                       // Test run exit code
  root: string;                           // Project root
  environment?: Record<string, string>;   // Test environment
  tests: PytestTest[];                    // Test results
}
```

---

### Playwright Types

#### PlaywrightTest

Single test from Playwright report.

```typescript
interface PlaywrightTest {
  title: string;            // Test name
  status: string;           // 'passed', 'failed', 'skipped'
  duration: number;         // Duration in milliseconds
  errors?: string[];        // Error messages
  file?: string;            // Source file
  line?: number;            // Line number
  column?: number;          // Column number
}
```

#### PlaywrightSuite

Test suite with nested structure.

```typescript
interface PlaywrightSuite {
  title: string;                    // Suite name
  tests: PlaywrightTest[];          // Tests in suite
  suites?: PlaywrightSuite[];       // Nested suites
}
```

#### PlaywrightReport

Complete Playwright report.

```typescript
interface PlaywrightReport {
  suites: PlaywrightSuite[];        // Top-level suites
  stats?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}
```

---

### Checkstyle Types

#### CheckstyleViolation

Code style violation.

```typescript
interface CheckstyleViolation {
  line: number;              // Line number
  column: number;            // Column number
  severity: 'error' | 'warning' | 'info';
  message: string;           // Violation message
  source: string;            // Rule identifier
}
```

#### CheckstyleFile

File with violations.

```typescript
interface CheckstyleFile {
  name: string;              // File path
  violations: CheckstyleViolation[];
}
```

#### CheckstyleReport

Complete checkstyle report.

```typescript
interface CheckstyleReport {
  files: CheckstyleFile[];   // Files with violations
  summary: {
    totalFiles: number;
    filesWithViolations: number;
    totalViolations: number;
    errors: number;
    warnings: number;
  };
}
```

---

### SpotBugs Types

#### SpotBugsBug

Potential bug identified by SpotBugs.

```typescript
interface SpotBugsBug {
  type: string;              // Bug type
  priority: number;          // Priority level
  abbrev: string;            // Short abbreviation
  category: string;          // Bug category
  instanceLine: number;      // Line number
  instanceMessage: string;   // Description
  sourceFile: string;        // Source file
  sourceLanguage?: string;   // Language (Java, etc.)
  classname?: string;        // Class name
  methodname?: string;       // Method name
}
```

#### SpotBugsReport

Complete SpotBugs report.

```typescript
interface SpotBugsReport {
  bugs: SpotBugsBug[];       // Identified bugs
  summary: {
    totalBugs: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
}
```

---

## Linter Types

### LinterMatch

Match result from linter detection.

```typescript
interface LinterMatch {
  linterType: string;        // Linter name
  content: string;           // Matched content
}
```

### LinterPattern

Pattern for detecting linter output.

```typescript
interface LinterPattern {
  name: string;              // Linter name
  pattern: RegExp;           // Detection regex
  description: string;       // Pattern description
}
```

### LinterOutput

Linter output detection result.

```typescript
interface LinterOutput {
  detectedType: string;      // Linter type
  filePath: string;          // Source file path
}
```

---

## Catalog Types

### CatalogEntry

Entry in artifact catalog.

```typescript
interface CatalogEntry {
  artifactName: string;      // User-friendly name
  artifactId: number;        // Unique ID
  runId: string;             // Test run ID
  detectedType: ArtifactType; // Detected artifact type
  originalFormat: OriginalFormat;
  filePath: string;          // Location of artifact
  converted?: boolean;       // Conversion status
  skipped?: boolean;         // Whether skipped
}
```

---

## Type Guard Patterns

### Type Narrowing

Use TypeScript type guards to work safely with union types:

```typescript
import type { ArtifactType } from 'artifact-detective';
import { isJSON, canConvertToJSON } from 'artifact-detective';

function processArtifact(type: ArtifactType, content: string) {
  if (isJSON(type)) {
    // Type is known to be JSON format
    const data = JSON.parse(content);
    console.log('Parsed JSON:', data);
  } else if (canConvertToJSON(type)) {
    // Type can be converted to JSON
    console.log('Can convert to JSON');
  } else {
    // Type is not JSON and cannot be converted
    console.log('Not JSON convertible');
  }
}
```

### Safe Type Access

Always check ARTIFACT_TYPE_REGISTRY before accessing:

```typescript
import { ARTIFACT_TYPE_REGISTRY } from 'artifact-detective';

function checkCapability(type: ArtifactType, capability: keyof ArtifactTypeCapabilities) {
  const entry = ARTIFACT_TYPE_REGISTRY[type];
  if (!entry) {
    console.error(`Unknown type: ${type}`);
    return false;
  }

  if (capability === 'validator') {
    return entry.validator !== null;
  }
  if (capability === 'extract') {
    return entry.extract !== null;
  }
  // ... etc
}
```

---

## Common Type Patterns

### Type-Safe Artifact Detection

```typescript
import type { ArtifactType, DetectionResult } from 'artifact-detective';
import { detectArtifactType } from 'artifact-detective';

const result: DetectionResult = detectArtifactType('./report.json');
const type: ArtifactType = result.detectedType;
```

### Type-Safe Validation

```typescript
import type { ArtifactType, ValidationResult } from 'artifact-detective';
import { validate } from 'artifact-detective';

function validateArtifact(
  type: ArtifactType,
  content: string
): ValidationResult {
  return validate(type, content);
}
```

### Handling Optional Descriptions

```typescript
import type { ArtifactDescription } from 'artifact-detective';
import { getArtifactDescription } from 'artifact-detective';

const description: ArtifactDescription | null = getArtifactDescription('jest-json');

if (description) {
  console.log(`Tool: ${description.toolUrl}`);
  console.log(`Summary: ${description.shortDescription}`);
}
```

---

## Related Resources

- [API Functions Guide](./functions.md) - Function reference and examples
- [Artifact Types](../artifact-types/) - Complete artifact type catalog
- [Fixture Documentation](../fixtures/) - Real-world examples by language
