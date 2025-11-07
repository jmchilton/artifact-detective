# API Documentation

TypeScript/JavaScript API for artifact-detective.

## Installation

```bash
npm install artifact-detective
```

## Core Functions

### Detection

#### `detectArtifactType(filePath: string)`

Automatically detect the artifact type from file contents.

```typescript
import { detectArtifactType } from 'artifact-detective';

const result = detectArtifactType('results.json');
// {
//   detectedType: 'jest-json',
//   confidence: 'high'
// }
```

**Returns:**
- `detectedType`: The detected artifact type (or null if not detected)
- `confidence`: Detection confidence level

### Validation

#### `validateArtifact(type: ArtifactType, filePath: string)`

Validate that an artifact matches the expected type.

```typescript
import { validateArtifact } from 'artifact-detective';

const result = validateArtifact('jest-json', 'results.json');
// {
//   isValid: true,
//   errors: []
// }
```

**Returns:**
- `isValid`: Whether the artifact is valid for the type
- `errors`: Array of validation errors (if any)

### Extraction & Normalization

#### `extract(type: ArtifactType, logContents: string, options?)`

Unified extraction function that can optionally normalize to JSON. Extract artifact content from CI logs or normalize to JSON format.

```typescript
import { extract } from 'artifact-detective';

const logContent = readFileSync('./ci-log.txt', 'utf-8');

// Extract raw linter output from logs
const result = extract('eslint-txt', logContent);
if (result) {
  console.log('Content:', result.content);
  console.log('Type:', result.artifact.artifactType);
  console.log('Is JSON:', result.artifact.isJSON);
}

// Extract and normalize to JSON in one step
const normalized = extract('mypy-txt', logContent, { normalize: true });
if (normalized) {
  const errors = JSON.parse(normalized.content);
  console.log(`Extracted ${errors.length} type errors`);
  console.log('Normalized from:', normalized.artifact.normalizedFrom);
}

// Extract with validation
const validated = extract('eslint-txt', logContent, { validate: true });
if (validated) {
  if (validated.validationResult?.valid) {
    console.log('✓ Extraction validated successfully');
    console.log('File extension:', validated.artifact.fileExtension);
  } else {
    console.log('✗ Validation failed:', validated.validationResult?.error);
  }
}
```

**Options:**
- `normalize` (boolean, default: false): If true, attempt to convert to JSON format
- `validate` (boolean, default: false): If true, run validation on extracted content
- `config` (ExtractorConfig): Extraction configuration with custom markers
  - `startMarker`: RegExp to detect section start
  - `endMarker`: RegExp to detect section end
  - `includeEndMarker`: Include end marker line in output (default: true)

**Returns:**
- `ExtractResult` with:
  - `content`: Raw or normalized content
  - `artifact`: ArtifactDescriptor with full metadata
    - `artifactType`: The artifact type
    - `shortDescription`: Human-readable description
    - `toolUrl`: Link to tool documentation
    - `formatUrl`: Link to format documentation
    - `parsingGuide`: Detailed parsing guide
    - `fileExtension`: File extension (json, xml, html, txt, ndjson, other)
    - `isJSON`: Whether format is JSON
    - `normalizedFrom`: Original type if normalized (undefined if raw)
  - `validationResult` (optional): ValidationResult if validate option was true
    - `valid`: Whether validation passed
    - `error`: Error message if invalid
    - `artifact`: Full ArtifactDescriptor if valid

### File-based Normalization

#### `convertToJSON(result: DetectionResult, filePath: string)`

Convert a detected artifact file to JSON format.

```typescript
import { detectArtifactType, convertToJSON, canConvertToJSON } from 'artifact-detective';

const detected = detectArtifactType('./pytest-report.html');
if (canConvertToJSON(detected)) {
  const result = convertToJSON(detected, './pytest-report.html');
  if (result) {
    const data = JSON.parse(result.json);
    console.log(data.tests);
    console.log('Guide:', result.description.parsingGuide);
  }
}
```

**Returns:**
- `ConversionResult` with:
  - `json`: The JSON content as a string
  - `description`: ArtifactDescription with metadata

## Type Definitions

### `ArtifactType`

Union type of all supported artifact types:

```typescript
type ArtifactType = 
  | 'jest-json'
  | 'jest-html'
  | 'playwright-json'
  | 'pytest-json'
  | 'pytest-html'
  // ... and 35+ more types
```

### `ValidationResult`

Result of artifact validation:

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  artifact?: ArtifactDescriptor;
}
```

### `ArtifactDescription`

Metadata about an artifact type:

```typescript
interface ArtifactDescription {
  type: string;
  shortDescription: string;
  toolUrl?: string;
  formatUrl?: string;
  parsingGuide: string;
}
```

### `ArtifactDescriptor`

Flattened descriptor containing all metadata about an artifact type:

```typescript
interface ArtifactDescriptor {
  artifactType: ArtifactType;
  shortDescription: string;
  toolUrl?: string;
  formatUrl?: string;
  parsingGuide: string;
  isJSON: boolean;
  normalizedFrom?: ArtifactType;
}
```

### `ExtractResult`

Result of extracting artifact content:

```typescript
interface ExtractResult {
  content: string;
  artifact: ArtifactDescriptor;
}
```

## Examples

### Example 1: Extract from Log and Access Metadata

```typescript
import { extract } from 'artifact-detective';

async function extractArtifact(logFile: string) {
  const logContent = readFileSync(logFile, 'utf-8');

  // Extract linter output from log
  const result = extract('eslint-txt', logContent);

  if (result) {
    console.log('Content:', result.content);
    console.log('Type:', result.artifact.artifactType);
    console.log('Tool:', result.artifact.toolUrl);
    console.log('Is JSON:', result.artifact.isJSON);
    console.log('Parsing Guide:', result.artifact.parsingGuide);

    return result.content;
  }
}
```

### Example 2: Extract and Normalize to JSON

```typescript
import { extract } from 'artifact-detective';

async function extractAndNormalize(logFile: string) {
  const logContent = readFileSync(logFile, 'utf-8');

  // Extract mypy output and convert to JSON in one step
  const result = extract('mypy-txt', logContent, { normalize: true });

  if (result) {
    const errors = JSON.parse(result.content);
    console.log(`Found ${errors.length} type errors`);
    console.log('Normalized type:', result.artifact.artifactType);
    console.log('Original was:', result.artifact.normalizedFrom);

    return errors;
  }
}
```

### Example 3: Validate Artifacts

```typescript
import { validate } from 'artifact-detective';

async function validateArtifacts(files: string[]) {
  const results = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const result = validate('jest-json', content);

    results.push({
      file,
      valid: result.valid,
      error: result.error,
      artifact: result.artifact,
      parsingGuide: result.artifact?.parsingGuide
    });
  }

  return results;
}
```

## Supported Artifact Types

See [Artifact Types Reference](../artifact-types/) for complete list of 40+ supported types.

## More Information

- 📖 [Full TypeDoc](typedoc/) - Generated API documentation
- 🔍 [CLI Reference](../cli/)
- 🧪 [Examples & Fixtures](../fixtures/)
