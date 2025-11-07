import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';
import {
  validateGoTestNDJSON,
  validateGolangciLintJSON,
  canConvertToJSON,
} from '../src/validators/index.js';

describe('Go artifact types', () => {
  const goTestPath = fixtures.go.goTestJson();
  const golangciLintPath = fixtures.go.golangciLintJson();

  testArtifactType({
    artifactType: 'go-test-ndjson',
    fixturePath: goTestPath,
    expectedFormat: 'json',
    supportsAutoDetection: true,
    invalidSamples: [
      '',
      '{"Package": "test", "Time": "2025-01-01T00:00:00Z"}',
      '{"Action": "start", "Time": "2025-01-01T00:00:00Z"}',
      'not json at all',
    ],
  });

  describe('go-test-ndjson specific tests', () => {
    it('real go test JSON has expected structure', () => {
      const content = readFileSync(goTestPath, 'utf-8');
      expect(content).toContain('"Action"');
      expect(content).toContain('"Package"');
      expect(content).toContain('"Time"');
      expect(content.toLowerCase()).toContain('example.com/calculator');
    });

    it('go-test-ndjson can be converted to JSON with normalization', () => {
      const result = canConvertToJSON({ detectedType: 'go-test-ndjson' });
      expect(result).toBe(true);
    });
  });

  testArtifactType({
    artifactType: 'golangci-lint-json',
    fixturePath: golangciLintPath,
    expectedFormat: 'json',
    supportsAutoDetection: true,
    invalidSamples: [
      '[]',
      '{"foo": "bar"}',
      'not json',
    ],
  });

  describe('golangci-lint-json specific tests', () => {
    it('real golangci-lint JSON has expected structure', () => {
      const content = readFileSync(golangciLintPath, 'utf-8');
      expect(content).toContain('"Issues"');
      expect(content).toContain('"Report"');
      expect(content).toContain('"Linters"');
    });

    it('golangci-lint-json can be converted to JSON', () => {
      const result = canConvertToJSON({ detectedType: 'golangci-lint-json' });
      expect(result).toBe(true);
    });
  });
});
