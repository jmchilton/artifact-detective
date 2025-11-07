import { describe, it, expect } from 'vitest';
import { canConvertToJSON } from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';

describe('Surefire HTML artifact type', () => {
  const surefireHtmlPath = fixtures.java.surefireHtml();

  testArtifactType({
    artifactType: 'surefire-html',
    fixturePath: surefireHtmlPath,
    expectedFormat: 'html',
    supportsAutoDetection: true,
    invalidSamples: [
      '<html><body><h1>Some Report</h1></body></html>',
      '{"not": "html"}',
      '<html><body><h1>Surefire Report</h1></body></html>',
    ],
  });

  describe('Surefire HTML specific tests', () => {
    it('real surefire HTML has expected structure', () => {
      const content = readFileSync(surefireHtmlPath, 'utf-8');

      // Check for surefire report structure
      expect(content.toLowerCase()).toMatch(/surefire/);
      expect(content.toLowerCase()).toMatch(/test/);
      expect(content).toMatch(/<html/i);
      expect(content).toMatch(/<body/i);
    });

    it('surefire HTML cannot be converted to JSON', () => {
      const result = canConvertToJSON({ detectedType: 'surefire-html' });

      expect(result).toBe(false);
    });
  });
});
