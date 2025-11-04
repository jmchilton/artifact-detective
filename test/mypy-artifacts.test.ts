import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { readFileSync } from 'fs';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { validate, ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import { FIXTURES_DIR } from './fixtures-helper.js';

describe('Mypy Artifacts', () => {
  describe('Mypy NDJSON', () => {
    const mypyJsonPath = join(FIXTURES_DIR, 'generated/python/mypy-results.json');

    it('detects mypy-ndjson by content', () => {
      const result = detectArtifactType(mypyJsonPath);
      expect(result.detectedType).toBe('mypy-ndjson');
      expect(result.originalFormat).toBe('json');
      expect(result.isBinary).toBe(false);
    });

    it('fails to validate non-mypy NDJSON', () => {
      const nonMypyJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const content = readFileSync(nonMypyJsonPath, 'utf-8');
      const result = validate('mypy-ndjson', content);
      expect(result.valid).toBe(false);

      const resultFirstLineNotJsonObject = validate('mypy-ndjson', '7');
      expect(resultFirstLineNotJsonObject.valid).toBe(false);

      const resultInvalidLineNumber = validate('mypy-ndjson', '{"file": "moo.txt", "line": "6"}');
      expect(resultInvalidLineNumber.valid).toBe(false);

      const resultInvalidMessage = validate(
        'mypy-ndjson',
        '{"file": "moo.txt", "line": 6, "message": 12}',
      );
      expect(resultInvalidMessage.valid).toBe(false);

      const resultInvalidCode = validate(
        'mypy-ndjson',
        '{"file": "moo.txt", "line": 6, "message": "moo", "code": 13}',
      );
      expect(resultInvalidCode.valid).toBe(false);
    });

    it('validates mypy NDJSON content', () => {
      const content = readFileSync(mypyJsonPath, 'utf-8');
      const result = validate('mypy-ndjson', content);
      expect(result.valid).toBe(true);
    });

    it('parses mypy JSON NDJSON format', () => {
      const content = readFileSync(mypyJsonPath, 'utf-8');
      const lines = content
        .trim()
        .split('\n')
        .filter((l) => l.trim());

      // Should have multiple lines of JSON
      expect(lines.length).toBeGreaterThan(0);

      // Each line should be a valid JSON object
      const errors = lines.map((line) => JSON.parse(line));
      expect(errors.length).toBeGreaterThan(0);

      // Check structure of first error
      const firstError = errors[0];
      expect(typeof firstError.file).toBe('string');
      expect(typeof firstError.line).toBe('number');
      expect(typeof firstError.column).toBe('number');
      expect(typeof firstError.message).toBe('string');
      expect(typeof firstError.code).toBe('string');
      expect(typeof firstError.severity).toBe('string');
    });

    it('contains expected mypy errors from fixture', () => {
      const content = readFileSync(mypyJsonPath, 'utf-8');
      const lines = content
        .trim()
        .split('\n')
        .filter((l) => l.trim());
      const errors = lines.map((line) => JSON.parse(line));

      // Check for no-untyped-def errors
      const noUntypedDefErrors = errors.filter(
        (e: Record<string, unknown>) => e.code === 'no-untyped-def',
      );
      expect(noUntypedDefErrors.length).toBeGreaterThan(0);

      // Check for return-value error
      const returnValueErrors = errors.filter(
        (e: Record<string, unknown>) => e.code === 'return-value',
      );
      expect(returnValueErrors.length).toBeGreaterThan(0);
    });

    it('has registry entry with auto-detection support', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['mypy-ndjson'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
    });

    it('rejects invalid JSON', () => {
      const invalidJson = '{"not": "mypy"}';
      const result = validate('mypy-ndjson', invalidJson);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects empty mypy output', () => {
      const emptyOutput = '';
      const result = validate('mypy-ndjson', emptyOutput);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('rejects JSON without mypy structure', () => {
      const wrongStructure = '{"message": "test"}';
      const result = validate('mypy-ndjson', wrongStructure);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('file');
    });
  });
});
