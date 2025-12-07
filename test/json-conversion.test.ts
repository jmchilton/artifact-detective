import { describe, it, expect } from 'vitest';
import { isJSON, canConvertToJSON, convertToJSON } from '../src/validators/index.js';
import type { ArtifactType } from '../src/types.js';
import { loadAllFixtures } from './fixtures-helper.js';

describe('JSON conversion utilities', () => {
  describe('isJSON', () => {
    it('returns true for jest-json', () => {
      const result = { detectedType: 'jest-json' as ArtifactType };
      expect(isJSON(result)).toBe(true);
    });

    it('returns true for playwright-json', () => {
      const result = { detectedType: 'playwright-json' as ArtifactType };
      expect(isJSON(result)).toBe(true);
    });

    it('returns true for pytest-json', () => {
      const result = { detectedType: 'pytest-json' as ArtifactType };
      expect(isJSON(result)).toBe(true);
    });

    it('returns false for mypy-ndjson (NDJSON format, not single JSON)', () => {
      const result = { detectedType: 'mypy-ndjson' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns true for eslint-json', () => {
      const result = { detectedType: 'eslint-json' as ArtifactType };
      expect(isJSON(result)).toBe(true);
    });

    it('returns false for clippy-ndjson (NDJSON format, not single JSON)', () => {
      const result = { detectedType: 'clippy-ndjson' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for pytest-html', () => {
      const result = { detectedType: 'pytest-html' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for eslint-txt', () => {
      const result = { detectedType: 'eslint-txt' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for junit-xml', () => {
      const result = { detectedType: 'junit-xml' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for jest-html', () => {
      const result = { detectedType: 'jest-html' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for unknown type', () => {
      const result = { detectedType: 'unknown' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns false for binary type', () => {
      const result = { detectedType: 'binary' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });
  });

  describe('canConvertToJSON', () => {
    it('returns true for all native JSON types', () => {
      const jsonTypes: ArtifactType[] = [
        'jest-json',
        'playwright-json',
        'pytest-json',
        'eslint-json',
        'checkstyle-sarif-json',
      ];

      for (const type of jsonTypes) {
        const result = { detectedType: type };
        expect(canConvertToJSON(result)).toBe(true);
      }
    });

    it('returns true for types with normalizers', () => {
      const normalizableTypes: ArtifactType[] = [
        'pytest-html',
        'jest-html',
        'mypy-ndjson',
        'clippy-ndjson',
      ];

      for (const type of normalizableTypes) {
        const result = { detectedType: type };
        expect(canConvertToJSON(result)).toBe(true);
      }
    });

    it('returns false for types without normalizer or JSON', () => {
      const nonConvertibleTypes: ArtifactType[] = [
        'eslint-txt',
        'tsc-txt',
        'ruff-txt',
        'flake8-txt',
        'junit-xml',
        'checkstyle-xml',
        'spotbugs-xml',
        'cargo-test-txt',
        'rustfmt-txt',
      ];

      for (const type of nonConvertibleTypes) {
        const result = { detectedType: type };
        expect(canConvertToJSON(result)).toBe(false);
      }
    });

    it('returns true for mypy-txt (has normalizer)', () => {
      const result = { detectedType: 'mypy-txt' as ArtifactType };
      expect(canConvertToJSON(result)).toBe(true);
    });

    it('returns false for unknown type', () => {
      const result = { detectedType: 'unknown' as ArtifactType };
      expect(canConvertToJSON(result)).toBe(false);
    });

    it('returns false for binary type', () => {
      const result = { detectedType: 'binary' as ArtifactType };
      expect(canConvertToJSON(result)).toBe(false);
    });
  });

  describe('convertToJSON', () => {
    const fixtures = loadAllFixtures(['javascript', 'python', 'rust', 'java']);

    it('returns valid JSON for native JSON type (jest-json)', () => {
      const fixture = fixtures.find((f) => f.type === 'jest-json');
      if (!fixture) {
        throw new Error('jest-json fixture not found');
      }

      const result = { detectedType: 'jest-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(conversionResult?.description.type).toBe('jest-json');
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(parsed).toHaveProperty('testResults');
    });

    it('returns valid JSON for pytest-json', () => {
      const fixture = fixtures.find((f) => f.type === 'pytest-json');
      if (!fixture) {
        throw new Error('pytest-json fixture not found');
      }

      const result = { detectedType: 'pytest-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(parsed).toHaveProperty('tests');
    });

    it('returns valid JSON for pytest-html (via normalizer)', () => {
      const fixture = fixtures.find((f) => f.type === 'pytest-html');
      if (!fixture) {
        throw new Error('pytest-html fixture not found');
      }

      const result = { detectedType: 'pytest-html' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(parsed).toHaveProperty('tests');
    });

    it('returns valid JSON for jest-html (via normalizer)', () => {
      const fixture = fixtures.find((f) => f.type === 'jest-html');
      if (!fixture) {
        throw new Error('jest-html fixture not found');
      }

      const result = { detectedType: 'jest-html' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(parsed).toHaveProperty('testResults');
      expect(parsed).toHaveProperty('numTotalTests');
    });

    it('returns valid JSON for playwright-json', () => {
      const fixture = fixtures.find((f) => f.type === 'playwright-json');
      if (!fixture) {
        throw new Error('playwright-json fixture not found');
      }

      const result = { detectedType: 'playwright-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
    });

    it('returns valid JSON for eslint-json', () => {
      const fixture = fixtures.find((f) => f.type === 'eslint-json');
      if (!fixture) {
        throw new Error('eslint-json fixture not found');
      }

      const result = { detectedType: 'eslint-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
    });

    it('returns valid JSON for checkstyle-sarif-json', () => {
      const fixture = fixtures.find((f) => f.type === 'checkstyle-sarif-json');
      if (!fixture) {
        throw new Error('checkstyle-sarif-json fixture not found');
      }

      const result = { detectedType: 'checkstyle-sarif-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(parsed.version).toBe('2.1.0');
      expect(Array.isArray(parsed.runs)).toBe(true);
      expect(parsed.runs[0].tool.driver.name).toBe('Checkstyle');
    });

    it('returns JSON array for mypy-ndjson (NDJSON converted to array)', () => {
      const fixture = fixtures.find((f) => f.type === 'mypy-ndjson');
      if (!fixture) {
        throw new Error('mypy-ndjson fixture not found');
      }

      const result = { detectedType: 'mypy-ndjson' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
      // Each item should have mypy-ndjson structure
      for (const item of parsed) {
        expect(item).toHaveProperty('file');
        expect(item).toHaveProperty('message');
      }
    });

    it('returns JSON array for clippy-ndjson (NDJSON converted to array)', () => {
      const fixture = fixtures.find((f) => f.type === 'clippy-ndjson');
      if (!fixture) {
        throw new Error('clippy-ndjson fixture not found');
      }

      const result = { detectedType: 'clippy-ndjson' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();
      const parsed = JSON.parse(conversionResult!.json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
      // Each item should have clippy-ndjson structure (compiler message)
      for (const item of parsed) {
        expect(item).toHaveProperty('reason');
      }
    });

    it('returns null for type without normalizer (eslint-txt)', () => {
      const fixture = fixtures.find((f) => f.type === 'eslint-txt');
      if (!fixture) {
        throw new Error('eslint-txt fixture not found');
      }

      const result = { detectedType: 'eslint-txt' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeNull();
    });

    it('returns null for unknown type', () => {
      const result = { detectedType: 'unknown' as ArtifactType };
      const json = convertToJSON(result, '/some/path.txt');

      expect(json).toBeNull();
    });

    it('returns null for binary type', () => {
      const result = { detectedType: 'binary' as ArtifactType };
      const json = convertToJSON(result, '/some/path.bin');

      expect(json).toBeNull();
    });

    it('returns null when file does not exist', () => {
      const result = { detectedType: 'jest-json' as ArtifactType };
      const json = convertToJSON(result, '/nonexistent/path.json');

      expect(json).toBeNull();
    });

    it('returns null when JSON file is invalid', () => {
      const result = { detectedType: 'jest-json' as ArtifactType };
      // Use a text file as the path for an invalid JSON test
      const fixture = fixtures.find((f) => f.type === 'eslint-txt');
      if (!fixture) {
        throw new Error('eslint-txt fixture not found');
      }

      const json = convertToJSON(result, fixture.path);
      expect(json).toBeNull();
    });

    it('converts mypy-txt to JSON array format', () => {
      const fixture = fixtures.find((f) => f.type === 'mypy-txt');
      if (!fixture) {
        throw new Error('mypy-txt fixture not found');
      }

      const result = { detectedType: 'mypy-txt' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      expect(conversionResult?.description).toBeTruthy();
      expect(() => JSON.parse(conversionResult!.json)).not.toThrow();

      const array = JSON.parse(conversionResult!.json);
      expect(Array.isArray(array)).toBe(true);
      expect(array.length).toBeGreaterThan(0);

      for (const obj of array) {
        expect(obj).toHaveProperty('file');
        expect(obj).toHaveProperty('line');
        expect(obj).toHaveProperty('column');
        expect(obj).toHaveProperty('message');
        expect(obj).toHaveProperty('severity');
        expect(obj).toHaveProperty('code');
        expect(['error', 'warning']).toContain(obj.severity);
      }
    });

    it('mypy-txt converts notes to hints', () => {
      const fixture = fixtures.find((f) => f.type === 'mypy-txt');
      if (!fixture) {
        throw new Error('mypy-txt fixture not found');
      }

      const result = { detectedType: 'mypy-txt' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();

      // Look for an error that has a note/hint
      const array = JSON.parse(conversionResult!.json);
      const withHints = array.filter((obj) => obj.hint !== null && obj.hint !== undefined);

      // The fixture should have at least one error with a hint
      expect(withHints.length).toBeGreaterThan(0);
      const hinted = withHints[0];
      expect(typeof hinted.hint).toBe('string');
      expect(hinted.hint.length).toBeGreaterThan(0);
    });

    it('description type reflects target type after normalization (pytest-html → pytest-json)', () => {
      const fixture = fixtures.find((f) => f.type === 'pytest-html');
      if (!fixture) {
        throw new Error('pytest-html fixture not found');
      }

      const result = { detectedType: 'pytest-html' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      // Description should be for target type (pytest-json), not source (pytest-html)
      expect(conversionResult?.description.type).toBe('pytest-json');
    });

    it('description type reflects target type after normalization (jest-html → jest-json)', () => {
      const fixture = fixtures.find((f) => f.type === 'jest-html');
      if (!fixture) {
        throw new Error('jest-html fixture not found');
      }

      const result = { detectedType: 'jest-html' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      // Description should be for target type (jest-json), not source (jest-html)
      expect(conversionResult?.description.type).toBe('jest-json');
    });

    it('description type reflects target type after normalization (mypy-ndjson → mypy-json)', () => {
      const fixture = fixtures.find((f) => f.type === 'mypy-ndjson');
      if (!fixture) {
        throw new Error('mypy-ndjson fixture not found');
      }

      const result = { detectedType: 'mypy-ndjson' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      // Description should be for target type (mypy-json), not source (mypy-ndjson)
      expect(conversionResult?.description.type).toBe('mypy-json');
    });

    it('description type remains same for native JSON types (no normalization)', () => {
      const fixture = fixtures.find((f) => f.type === 'jest-json');
      if (!fixture) {
        throw new Error('jest-json fixture not found');
      }

      const result = { detectedType: 'jest-json' as ArtifactType };
      const conversionResult = convertToJSON(result, fixture.path);

      expect(conversionResult).toBeTruthy();
      // Description should remain jest-json since no normalization occurred
      expect(conversionResult?.description.type).toBe('jest-json');
    });
  });
});
