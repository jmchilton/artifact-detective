import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { testArtifactType, validateFixture } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';

describe('ESLint Artifacts', () => {
  const eslintJsonPath = fixtures.javascript.eslintJson();

  testArtifactType({
    artifactType: 'eslint-json',
    fixturePath: eslintJsonPath,
    expectedFormat: 'json',
    supportsAutoDetection: true,
    invalidSamples: ['{"not": "eslint"}', '[]', '{invalid json}'],
  });

  describe('ESLint JSON structure', () => {
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
  });
});
