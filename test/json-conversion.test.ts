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

    it('returns false for mypy-json (NDJSON format, not single JSON)', () => {
      const result = { detectedType: 'mypy-json' as ArtifactType };
      expect(isJSON(result)).toBe(false);
    });

    it('returns true for eslint-json', () => {
      const result = { detectedType: 'eslint-json' as ArtifactType };
      expect(isJSON(result)).toBe(true);
    });

    it('returns false for clippy-json (NDJSON format, not single JSON)', () => {
      const result = { detectedType: 'clippy-json' as ArtifactType };
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
      ];

      for (const type of jsonTypes) {
        const result = { detectedType: type };
        expect(canConvertToJSON(result)).toBe(true);
      }
    });

    it('returns true for pytest-html (has normalizer)', () => {
      const result = { detectedType: 'pytest-html' as ArtifactType };
      expect(canConvertToJSON(result)).toBe(true);
    });

    it('returns false for types without normalizer or JSON', () => {
      const nonConvertibleTypes: ArtifactType[] = [
        'eslint-txt',
        'tsc-txt',
        'ruff-txt',
        'mypy-txt',
        'flake8-txt',
        'junit-xml',
        'checkstyle-xml',
        'spotbugs-xml',
        'jest-html',
        'cargo-test-txt',
        'rustfmt-txt',
        'mypy-json',
        'clippy-json',
      ];

      for (const type of nonConvertibleTypes) {
        const result = { detectedType: type };
        expect(canConvertToJSON(result)).toBe(false);
      }
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
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeTruthy();
      expect(() => JSON.parse(json!)).not.toThrow();
      const parsed = JSON.parse(json!);
      expect(parsed).toHaveProperty('testResults');
    });

    it('returns valid JSON for pytest-json', () => {
      const fixture = fixtures.find((f) => f.type === 'pytest-json');
      if (!fixture) {
        throw new Error('pytest-json fixture not found');
      }

      const result = { detectedType: 'pytest-json' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeTruthy();
      expect(() => JSON.parse(json!)).not.toThrow();
      const parsed = JSON.parse(json!);
      expect(parsed).toHaveProperty('tests');
    });

    it('returns valid JSON for pytest-html (via normalizer)', () => {
      const fixture = fixtures.find((f) => f.type === 'pytest-html');
      if (!fixture) {
        throw new Error('pytest-html fixture not found');
      }

      const result = { detectedType: 'pytest-html' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeTruthy();
      expect(() => JSON.parse(json!)).not.toThrow();
      const parsed = JSON.parse(json!);
      expect(parsed).toHaveProperty('tests');
    });

    it('returns valid JSON for playwright-json', () => {
      const fixture = fixtures.find((f) => f.type === 'playwright-json');
      if (!fixture) {
        throw new Error('playwright-json fixture not found');
      }

      const result = { detectedType: 'playwright-json' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeTruthy();
      expect(() => JSON.parse(json!)).not.toThrow();
    });

    it('returns valid JSON for eslint-json', () => {
      const fixture = fixtures.find((f) => f.type === 'eslint-json');
      if (!fixture) {
        throw new Error('eslint-json fixture not found');
      }

      const result = { detectedType: 'eslint-json' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeTruthy();
      expect(() => JSON.parse(json!)).not.toThrow();
    });

    it('returns null for mypy-json (NDJSON format, not convertible)', () => {
      const fixture = fixtures.find((f) => f.type === 'mypy-json');
      if (!fixture) {
        throw new Error('mypy-json fixture not found');
      }

      const result = { detectedType: 'mypy-json' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeNull();
    });

    it('returns null for clippy-json (NDJSON format, not convertible)', () => {
      const fixture = fixtures.find((f) => f.type === 'clippy-json');
      if (!fixture) {
        throw new Error('clippy-json fixture not found');
      }

      const result = { detectedType: 'clippy-json' as ArtifactType };
      const json = convertToJSON(result, fixture.path);

      expect(json).toBeNull();
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
  });
});
