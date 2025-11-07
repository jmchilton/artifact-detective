import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { testArtifactType, testValidationRejection, validateFixture } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';

describe('Mypy Artifacts', () => {
  const mypyJsonPath = fixtures.python.mypyNdjson();

  testArtifactType({
    artifactType: 'mypy-ndjson',
    fixturePath: mypyJsonPath,
    expectedFormat: 'json',
    supportsAutoDetection: true,
    invalidSamples: [
      '{"not": "mypy"}',
      '',
      '{"message": "test"}',
      '7',
      '{"file": "moo.txt", "line": "6"}',
      '{"file": "moo.txt", "line": 6, "message": 12}',
      '{"file": "moo.txt", "line": 6, "message": "moo", "code": 13}',
    ],
  });

  describe('Mypy NDJSON format', () => {
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

    it('fails to validate non-mypy NDJSON', () => {
      const nonMypyJsonPath = fixtures.javascript.eslintJson();
      const content = readFileSync(nonMypyJsonPath, 'utf-8');
      const result = validateFixture('mypy-ndjson', nonMypyJsonPath);
      expect(result.valid).toBe(false);
    });
  });
});
