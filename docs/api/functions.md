# API Functions Guide

Complete reference for all public functions exported by artifact-detective.

## Core Functions

### detectArtifactType

Automatically detect the artifact type from a file by inspecting its content.

```typescript
function detectArtifactType(filePath: string): DetectionResult
```

**Parameters:**
- `filePath` - Path to the artifact file

**Returns:** `DetectionResult` with:
- `detectedType` - The identified artifact type (or 'unknown')
- `originalFormat` - Format detected by extension (json, xml, html, txt, binary)
- `isBinary` - Whether file is binary

**Example:**
```typescript
import { detectArtifactType } from 'artifact-detective';

const result = detectArtifactType('./test-results/pytest-report.html');
console.log(result.detectedType); // 'pytest-html'
console.log(result.originalFormat); // 'html'
```

**Use Cases:**
- Identify artifact type automatically without user input
- Determine if a file is binary before processing
- Pre-validation before calling `validate()` or `convertToJSON()`

---

### validate

Validate that a file content matches an expected artifact type.

```typescript
function validate(type: ArtifactType, content: string): ValidationResult
```

**Parameters:**
- `type` - Expected artifact type
- `content` - File content as string

**Returns:** `ValidationResult` with:
- `valid` - Boolean indicating if validation passed
- `error` - Error message if validation failed (optional)
- `description` - Artifact description if valid (optional)

**Example:**
```typescript
import { validate } from 'artifact-detective';

const fileContent = fs.readFileSync('./results.json', 'utf-8');
const result = validate('jest-json', fileContent);

if (result.valid) {
  console.log('✓ Valid Jest JSON');
  console.log('Tool:', result.description?.toolUrl);
} else {
  console.error('✗ Invalid:', result.error);
}
```

**Use Cases:**
- Validate user-provided artifacts before processing
- Ensure file matches expected type before conversion
- Get artifact documentation when validation succeeds

---

### convertToJSON

Convert an artifact file to JSON format.

```typescript
function convertToJSON(filePath: string, type?: ArtifactType): ConversionResult | null
```

**Parameters:**
- `filePath` - Path to artifact file
- `type` - Optional artifact type (auto-detected if not provided)

**Returns:** `ConversionResult` with JSON string and description, or null if conversion not supported

**Example:**
```typescript
import { convertToJSON } from 'artifact-detective';

// Auto-detect type and convert
const result = convertToJSON('./pytest-report.html');
if (result) {
  fs.writeFileSync('./report.json', result.json);
  console.log('Converted to JSON');
}

// Or specify type explicitly
const result2 = convertToJSON('./report.html', 'pytest-html');
```

**Supports:**
- HTML reports → JSON (pytest-html, jest-html, rspec-html)
- Text linter output → JSON (mypy-txt → mypy-ndjson)
- NDJSON → JSON array (clippy-ndjson, mypy-ndjson)

---

### canConvertToJSON

Check if an artifact type can be converted to JSON without actually converting.

```typescript
function canConvertToJSON(type: ArtifactType): boolean
```

**Parameters:**
- `type` - Artifact type to check

**Returns:** `true` if type supports JSON conversion

**Example:**
```typescript
import { canConvertToJSON } from 'artifact-detective';

if (canConvertToJSON('pytest-html')) {
  console.log('Can convert pytest HTML to JSON');
}

if (!canConvertToJSON('eslint-txt')) {
  console.log('ESLint text output cannot be converted');
}
```

**Use Cases:**
- Check capability before attempting conversion
- Filter artifact types for UI dropdowns
- Validate user input before processing

---

### isJSON

Check if an artifact type is already in JSON format.

```typescript
function isJSON(type: ArtifactType): boolean
```

**Parameters:**
- `type` - Artifact type to check

**Returns:** `true` if type is natively JSON

**Example:**
```typescript
import { isJSON } from 'artifact-detective';

const type = 'jest-json';
if (isJSON(type)) {
  console.log('Jest JSON is already JSON format');
}
```

**JSON Artifact Types:**
- Test frameworks: jest-json, pytest-json, playwright-json, junit-xml, rspec-json, go-test-json
- Linters: eslint-json, golangci-lint-json, mypy-json, clippy-json
- Security: brakeman-json, rubocop-json

---

### extractArtifactFromLog

Extract artifact content from a CI log file.

```typescript
function extractArtifactFromLog(
  artifactType: ArtifactType,
  logContents: string,
  config?: ExtractorConfig
): string | null
```

**Parameters:**
- `artifactType` - Type of artifact to extract (must support extraction)
- `logContents` - Full CI log file contents
- `config` - Optional extractor configuration with custom markers

**Returns:** Extracted artifact content or null if extraction not supported/failed

**Example:**
```typescript
import { extractArtifactFromLog } from 'artifact-detective';

const logContent = fs.readFileSync('./ci-output.log', 'utf-8');

// Extract with default markers
const eslintOutput = extractArtifactFromLog('eslint-txt', logContent);

// Or with custom markers
const customOutput = extractArtifactFromLog('eslint-txt', logContent, {
  startMarker: /^=== LINT RESULTS ===/,
  endMarker: /^=== END LINT ===/,
  includeEndMarker: false
});
```

**Extractable Types:**
- Linters: eslint-txt, tsc-txt, mypy-txt, ruff-txt, flake8-txt, clippy-txt
- Formatters: rustfmt-txt, gofmt-txt, isort-txt, black-txt

**Marker Configuration:**
- `startMarker` - Regex to find extraction start (default: tool-specific)
- `endMarker` - Regex to find extraction end (default: next tool or EOF)
- `includeEndMarker` - Include end marker in extracted content (default: false)

---

### extractArtifactToJson

Extract artifact from CI log and convert to JSON in one step.

```typescript
function extractArtifactToJson(
  artifactType: ArtifactType,
  logContents: string
): ArtifactJsonResult | null
```

**Parameters:**
- `artifactType` - Type of artifact to extract and convert
- `logContents` - Full CI log file contents

**Returns:** `ArtifactJsonResult` with:
- `json` - JSON string
- `effectiveType` - The artifact type after normalization
- `description` - Artifact description (optional)

Or null if extraction/conversion not supported

**Example:**
```typescript
import { extractArtifactToJson } from 'artifact-detective';

const logContent = fs.readFileSync('./build.log', 'utf-8');

// Extract mypy output from log and convert to JSON
const result = extractArtifactToJson('mypy-txt', logContent);

if (result) {
  fs.writeFileSync('./mypy-output.json', result.json);
  console.log(`Converted as ${result.effectiveType}`);
}
```

**Use Cases:**
- Extract linter output from CI logs and immediately get JSON
- Store CI artifacts in normalized JSON format
- Process multiple artifact types in CI pipeline

---

## Registry & Configuration

### ARTIFACT_TYPE_REGISTRY

Complete registry of all supported artifact types and their capabilities.

```typescript
const ARTIFACT_TYPE_REGISTRY: Record<ArtifactType, ArtifactTypeCapabilities>
```

**Registry Entry Structure:**
```typescript
{
  supportsAutoDetection: boolean;      // Reliable detection possible
  validator: ValidatorFunction | null;  // Validate function if available
  extract: ExtractFromLogFunction | null; // Extract from log if available
  normalize: NormalizeFunction | null;  // Normalize to JSON if available
  normalizesTo: ArtifactType | null;   // Type after normalization
  artificialType: boolean;              // Only exists after normalization
  isJSON: boolean;                      // Already in JSON format
}
```

**Example:**
```typescript
import { ARTIFACT_TYPE_REGISTRY } from 'artifact-detective';

const jestCapabilities = ARTIFACT_TYPE_REGISTRY['jest-json'];
console.log(jestCapabilities.isJSON); // true
console.log(jestCapabilities.supportsAutoDetection); // true

// Check if normalization is available
if (ARTIFACT_TYPE_REGISTRY['pytest-html'].normalize) {
  console.log('HTML pytest report can be normalized to JSON');
}
```

---

## Artifact Descriptions

### getArtifactDescription

Get detailed information about an artifact type.

```typescript
function getArtifactDescription(type: ArtifactType): ArtifactDescription | null
```

**Parameters:**
- `type` - Artifact type

**Returns:** `ArtifactDescription` with:
- `toolUrl` - URL to tool documentation
- `shortDescription` - One-line summary
- `parsingGuide` - Detailed parsing information
- `formatUrl` - Format specification URL

Or null if type not found

**Example:**
```typescript
import { getArtifactDescription } from 'artifact-detective';

const desc = getArtifactDescription('jest-json');
console.log(desc?.toolUrl);
console.log(desc?.parsingGuide);
```

---

## Common Workflows

### Workflow 1: Detect and Validate

```typescript
import { detectArtifactType, validate } from 'artifact-detective';
import fs from 'fs';

const filePath = './results.json';
const content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Detect type
const detection = detectArtifactType(filePath);
if (detection.isBinary) {
  console.error('File is binary, cannot process');
  process.exit(1);
}

// Step 2: Validate detected type
const validation = validate(detection.detectedType, content);
if (!validation.valid) {
  console.error(`Invalid ${detection.detectedType}: ${validation.error}`);
  process.exit(1);
}

console.log(`✓ Valid ${detection.detectedType}`);
```

### Workflow 2: Extract and Convert

```typescript
import { extractArtifactToJson } from 'artifact-detective';
import fs from 'fs';

const logPath = './ci-build.log';
const logContent = fs.readFileSync(logPath, 'utf-8');

// Extract ESLint output from CI log and convert to JSON
const result = extractArtifactToJson('eslint-txt', logContent);

if (result) {
  console.log(`Extracted as ${result.effectiveType}`);
  fs.writeFileSync('./eslint-output.json', result.json);
} else {
  console.error('Failed to extract ESLint output from log');
}
```

### Workflow 3: Process Multiple Artifacts

```typescript
import { canConvertToJSON, convertToJSON } from 'artifact-detective';
import fs from 'fs';
import path from 'path';

const resultsDir = './test-results';
const files = fs.readdirSync(resultsDir);

for (const file of files) {
  const filePath = path.join(resultsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Try to detect and convert
  const result = convertToJSON(filePath);

  if (result) {
    const jsonPath = filePath.replace(/\.\w+$/, '.json');
    fs.writeFileSync(jsonPath, result.json);
    console.log(`✓ Converted ${file}`);
  }
}
```

---

## Error Handling

All functions return gracefully when operations aren't supported:

```typescript
import { convertToJSON, extractArtifactFromLog } from 'artifact-detective';

// convertToJSON returns null if type doesn't support conversion
const result = convertToJSON('./eslint-output.txt', 'eslint-txt');
if (!result) {
  console.log('ESLint text output cannot be converted to JSON');
}

// extractArtifactFromLog returns null if type doesn't support extraction
const extracted = extractArtifactFromLog('eslint-txt', logContent);
if (!extracted) {
  console.log('Failed to extract or type not extractable');
}
```

---

## TypeScript Support

All functions are fully typed for TypeScript:

```typescript
import type {
  ArtifactType,
  DetectionResult,
  ValidationResult,
  ConversionResult,
} from 'artifact-detective';

const type: ArtifactType = 'jest-json';
const result: DetectionResult = detectArtifactType('./results.json');
const validation: ValidationResult = validate(type, content);
```
