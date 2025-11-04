import { describe, it, expect } from 'vitest';
import { detectArtifactType } from '../src/index.js';
import {
  validateGoTestJSON,
  validateGolangciLintJSON,
  ARTIFACT_TYPE_REGISTRY,
  canConvertToJSON,
} from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/generated/go');

describe('Go artifact types', () => {
  const goTestPath = join(FIXTURES_DIR, 'go-test.json');
  const golangciLintPath = join(FIXTURES_DIR, 'golangci-lint.json');

  describe('go-test-json', () => {
    it('detects go-test-json by content', () => {
      const result = detectArtifactType(goTestPath);
      expect(result.detectedType).toBe('go-test-json');
      expect(result.originalFormat).toBe('json');
      expect(result.isBinary).toBe(false);
    });

    it('validates go-test JSON content', () => {
      const content = readFileSync(goTestPath, 'utf-8');
      const result = validateGoTestJSON(content);
      expect(result.valid).toBe(true);
    });

    it('rejects empty file', () => {
      const result = validateGoTestJSON('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects JSON without Action field', () => {
      const invalidJson = '{"Package": "test", "Time": "2025-01-01T00:00:00Z"}';
      const result = validateGoTestJSON(invalidJson);
      expect(result.valid).toBe(false);
    });

    it('rejects JSON without Package field', () => {
      const invalidJson = '{"Action": "start", "Time": "2025-01-01T00:00:00Z"}';
      const result = validateGoTestJSON(invalidJson);
      expect(result.valid).toBe(false);
    });

    it('rejects non-JSON content', () => {
      const notJson = 'not json at all';
      const result = validateGoTestJSON(notJson);
      expect(result.valid).toBe(false);
    });

    it('has proper registry entry', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['go-test-json'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
      expect(capabilities.isJSON).toBe(false);
      expect(capabilities.normalize).toBeTruthy();
    });

    it('real go test JSON has expected structure', () => {
      const content = readFileSync(goTestPath, 'utf-8');
      expect(content).toContain('"Action"');
      expect(content).toContain('"Package"');
      expect(content).toContain('"Time"');
      expect(content.toLowerCase()).toContain('example.com/calculator');
    });

    it('go-test-json is NDJSON format (not JSON)', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['go-test-json'];
      expect(capabilities.isJSON).toBe(false);
    });

    it('go-test-json cannot be converted to JSON without normalization', () => {
      const result = canConvertToJSON({ detectedType: 'go-test-json' });
      expect(result).toBe(true);
    });
  });

  describe('golangci-lint-json', () => {
    it('detects golangci-lint-json by content', () => {
      const result = detectArtifactType(golangciLintPath);
      expect(result.detectedType).toBe('golangci-lint-json');
      expect(result.originalFormat).toBe('json');
      expect(result.isBinary).toBe(false);
    });

    it('validates golangci-lint JSON content', () => {
      const content = readFileSync(golangciLintPath, 'utf-8');
      const result = validateGolangciLintJSON(content);
      expect(result.valid).toBe(true);
    });

    it('rejects non-object JSON', () => {
      const result = validateGolangciLintJSON('[]');
      expect(result.valid).toBe(false);
    });

    it('rejects JSON without required structure', () => {
      const invalidJson = '{"foo": "bar"}';
      const result = validateGolangciLintJSON(invalidJson);
      expect(result.valid).toBe(false);
    });

    it('rejects non-JSON content', () => {
      const notJson = 'not json';
      const result = validateGolangciLintJSON(notJson);
      expect(result.valid).toBe(false);
    });

    it('has proper registry entry', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['golangci-lint-json'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
      expect(capabilities.isJSON).toBe(true);
      expect(capabilities.normalize).toBeNull();
    });

    it('real golangci-lint JSON has expected structure', () => {
      const content = readFileSync(golangciLintPath, 'utf-8');
      expect(content).toContain('"Issues"');
      expect(content).toContain('"Report"');
      expect(content).toContain('"Linters"');
    });

    it('golangci-lint-json is JSON format', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['golangci-lint-json'];
      expect(capabilities.isJSON).toBe(true);
    });

    it('golangci-lint-json can be converted to JSON', () => {
      const result = canConvertToJSON({ detectedType: 'golangci-lint-json' });
      expect(result).toBe(true);
    });
  });
});
