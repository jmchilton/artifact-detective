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

### Extraction

#### `extractFromLog(type: ArtifactType, logPath: string, options?)`

Extract an artifact from CI log output.

```typescript
import { extractFromLog } from 'artifact-detective';

const artifact = extractFromLog('eslint-txt', 'build.log', {
  startMarker: /ESLint:/,
  endMarker: /^$/
});
```

**Options:**
- `startMarker`: RegExp to detect section start
- `endMarker`: RegExp to detect section end

### Normalization

#### `normalizeArtifact(filePath: string, options?)`

Convert artifact to JSON format.

```typescript
import { normalizeArtifact } from 'artifact-detective';

const json = normalizeArtifact('pytest-report.html');
const data = JSON.parse(json);
console.log(data.tests);
```

**Options:**
- `type`: Override auto-detected artifact type

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
  isValid: boolean;
  errors: string[];
  description?: ArtifactDescription;
}
```

### `ArtifactDescription`

Metadata about an artifact type:

```typescript
interface ArtifactDescription {
  shortDescription: string;
  toolUrl: string;
  formatUrl: string;
  parsingGuide: string;
}
```

## Examples

### Example 1: Process Test Results

```typescript
import { detectArtifactType, normalizeArtifact } from 'artifact-detective';

async function processResults(filePath: string) {
  // Auto-detect type
  const detected = detectArtifactType(filePath);
  console.log(`Detected: ${detected.detectedType}`);
  
  // Convert to JSON
  if (detected.detectedType) {
    const json = normalizeArtifact(filePath);
    return JSON.parse(json);
  }
}
```

### Example 2: Validate Multiple Artifacts

```typescript
import { validateArtifact } from 'artifact-detective';

async function validateResults(files: string[]) {
  const results = [];
  
  for (const file of files) {
    const result = validateArtifact('jest-json', file);
    results.push({
      file,
      valid: result.isValid,
      errors: result.errors
    });
  }
  
  return results;
}
```

### Example 3: Extract from CI Log

```typescript
import { extractFromLog, validateArtifact } from 'artifact-detective';

async function extractAndValidate(logFile: string) {
  // Extract ESLint output from log
  const artifact = extractFromLog('eslint-txt', logFile);
  
  if (artifact) {
    // Save extracted artifact
    const fs = require('fs');
    fs.writeFileSync('eslint-output.txt', artifact);
    
    // Validate extracted artifact
    const validation = validateArtifact('eslint-txt', 'eslint-output.txt');
    console.log('Valid:', validation.isValid);
  }
}
```

## Supported Artifact Types

See [Artifact Types Reference](../artifact-types/) for complete list of 40+ supported types.

## More Information

- 📖 [Full TypeDoc](typedoc/) - Generated API documentation
- 🔍 [CLI Reference](../cli/)
- 🧪 [Examples & Fixtures](../fixtures/)
