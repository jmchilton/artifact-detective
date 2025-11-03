import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { readFileSync } from 'fs';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { validate, ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import { FIXTURES_DIR } from './fixtures-helper.js';

describe('ESLint Artifacts', () => {
  describe('ESLint JSON', () => {
    const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

    it('detects eslint-json by content', () => {
      const result = detectArtifactType(eslintJsonPath);
      expect(result.detectedType).toBe('eslint-json');
      expect(result.originalFormat).toBe('json');
      expect(result.isBinary).toBe(false);
    });

    it('validates eslint JSON content', () => {
      const content = readFileSync(eslintJsonPath, 'utf-8');
      const result = validate('eslint-json', content);
      expect(result.valid).toBe(true);
    });

    it('parses eslint JSON with proper structure', () => {
      const content = readFileSync(eslintJsonPath, 'utf-8');
      const data = JSON.parse(content);

      // Should be array of results
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Check first result structure
      const firstResult = data[0];
      expect(typeof firstResult.filePath).toBe('string');
      expect(Array.isArray(firstResult.messages)).toBe(true);
      expect(typeof firstResult.errorCount).toBe('number');
      expect(typeof firstResult.warningCount).toBe('number');

      // Check message structure if any messages exist
      if (firstResult.messages.length > 0) {
        const message = firstResult.messages[0];
        expect(typeof message.ruleId).toBe('string');
        expect(typeof message.message).toBe('string');
        expect(typeof message.line).toBe('number');
        expect(typeof message.column).toBe('number');
        expect(typeof message.severity).toBe('number');
      }
    });

    it('detects eslint violations in test fixture', () => {
      const content = readFileSync(eslintJsonPath, 'utf-8');
      const data = JSON.parse(content);
      const firstResult = data[0];

      // Fixture should have violations
      expect(firstResult.errorCount).toBeGreaterThan(0);
      expect(firstResult.messages.length).toBeGreaterThan(0);

      // Check for expected rules
      const ruleIds = firstResult.messages.map((msg: Record<string, unknown>) => msg.ruleId);
      expect(ruleIds).toContain('no-unused-vars');
    });

    it('has registry entry with auto-detection support', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['eslint-json'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
    });

    it('rejects invalid eslint JSON', () => {
      const invalidJson = '{"not": "eslint"}';
      const result = validate('eslint-json', invalidJson);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects empty eslint array', () => {
      const emptyArray = '[]';
      const result = validate('eslint-json', emptyArray);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('rejects malformed JSON', () => {
      const malformedJson = '{invalid json}';
      const result = validate('eslint-json', malformedJson);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });
});
