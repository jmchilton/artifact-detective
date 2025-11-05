# Getting Started

Quick installation and first steps with artifact-detective.

## Installation

### As a CLI Tool

```bash
npm install -g artifact-detective
artifact-detective --version
```

### As a Library

```bash
npm install artifact-detective
```

```typescript
import { detectArtifactType, validateArtifact } from 'artifact-detective';
```

## Command Line Usage

### Detect Artifact Type

```bash
artifact-detective detect results.json
```

Output:
```
Detected type: jest-json
Confidence: high
```

### Validate Artifact

```bash
artifact-detective validate jest-json results.json
```

### Extract from CI Log

```bash
artifact-detective extract eslint-txt build.log --output eslint.txt
```

### Normalize to JSON

```bash
artifact-detective normalize pytest-report.html --output report.json
```

## Library Usage

### Basic Detection

```typescript
import { detectArtifactType } from 'artifact-detective';

const result = detectArtifactType('/path/to/results.json');
if (result.detectedType) {
  console.log(`Detected: ${result.detectedType}`);
}
```

### Validation

```typescript
import { validateArtifact } from 'artifact-detective';

const result = validateArtifact('jest-json', '/path/to/results.json');
if (result.isValid) {
  console.log('Valid Jest JSON artifact!');
}
```

### Normalization

```typescript
import { normalizeArtifact } from 'artifact-detective';

const json = normalizeArtifact('/path/to/pytest-report.html');
console.log(JSON.parse(json));
```

## Common Workflows

### 1. Process Multiple Artifacts

```bash
for file in results/*.json; do
  artifact-detective validate jest-json "$file" --json
done
```

### 2. Extract and Process

```bash
# Extract from CI log
artifact-detective extract eslint-txt build.log --output eslint.txt

# Validate extracted artifact
artifact-detective validate eslint-txt eslint.txt
```

### 3. Normalize Mixed Formats

```bash
# Auto-detect type and convert to JSON
artifact-detective normalize pytest-report.html --output report.json

# Or specify type explicitly
artifact-detective normalize report.html --type pytest-html --output report.json
```

## Next Steps

- 📚 Explore [CLI Reference](../cli/)
- 🔍 See [Artifact Types](../artifact-types/)
- 🧪 Check [Fixture Examples](../fixtures/)
- 💻 Read [API Documentation](../api/)
