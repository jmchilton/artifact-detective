import { describe, it, expect } from 'vitest';
import { validateCheckstyleSARIF } from '../src/validators/checkstyle-validator.js';
import { readFileSync } from 'fs';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';

describe('Checkstyle SARIF validator', () => {
  const sarifPath = fixtures.java.checkstyleSarif();

  testArtifactType({
    artifactType: 'checkstyle-sarif-json',
    fixturePath: sarifPath,
    expectedFormat: 'json',
    supportsAutoDetection: false,
    invalidSamples: [
      'not valid json {]',
      JSON.stringify({ runs: [{ tool: { driver: { name: 'checkstyle' } }, results: [] }] }),
      JSON.stringify({ version: '2.1.0', $schema: 'https://example.com/schema.json' }),
      JSON.stringify({
        version: '2.1.0',
        runs: [{ tool: { driver: { name: 'other-tool' } } }],
      }),
    ],
  });

  describe('Checkstyle SARIF specific validation', () => {
    it('accepts SARIF with checkstyle tool name', () => {
      const sarif = {
        version: '2.1.0',
        runs: [
          {
            tool: {
              driver: { name: 'Checkstyle' },
            },
            results: [],
          },
        ],
      };

      const result = validateCheckstyleSARIF(JSON.stringify(sarif));
      expect(result.valid).toBe(true);
    });

    it('accepts SARIF with checkstyle in lowercase tool name', () => {
      const sarif = {
        version: '2.1.0',
        runs: [
          {
            tool: {
              driver: { name: 'checkstyle' },
            },
            results: [],
          },
        ],
      };

      const result = validateCheckstyleSARIF(JSON.stringify(sarif));
      expect(result.valid).toBe(true);
    });

    it('accepts SARIF with results but no specific tool check', () => {
      const sarif = {
        version: '2.1.0',
        runs: [
          {
            tool: { driver: { name: 'unknown-tool' } },
            results: [
              {
                level: 'warning',
                message: { text: 'Some issue' },
                locations: [
                  {
                    physicalLocation: {
                      artifactLocation: { uri: 'file.java' },
                      region: { startLine: 1, startColumn: 1 },
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateCheckstyleSARIF(JSON.stringify(sarif));
      expect(result.valid).toBe(true);
    });

    it('extracts checkstyle violations from real SARIF', () => {
      const content = readFileSync(sarifPath, 'utf-8');
      const obj = JSON.parse(content);

      expect(obj.version).toBe('2.1.0');
      expect(Array.isArray(obj.runs)).toBe(true);
      expect(obj.runs[0].tool.driver.name).toBe('Checkstyle');

      const results = obj.runs[0].results;
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Check structure of first result
      const firstResult = results[0];
      expect(firstResult.level).toBe('warning');
      expect(typeof firstResult.message.text).toBe('string');
      expect(typeof firstResult.ruleId).toBe('string');
      expect(Array.isArray(firstResult.locations)).toBe(true);
      expect(firstResult.locations[0].physicalLocation.artifactLocation.uri).toMatch(
        /Calculator\.java/,
      );
    });

    it('validates SARIF with multiple violations', () => {
      const content = readFileSync(sarifPath, 'utf-8');
      const obj = JSON.parse(content);
      const results = obj.runs[0].results;

      // All violations should have proper structure
      for (const result of results) {
        expect(result.level).toBeDefined();
        expect(result.message).toBeDefined();
        expect(result.message.text).toBeDefined();
        expect(result.locations).toBeDefined();
        expect(Array.isArray(result.locations)).toBe(true);
        expect(result.locations.length).toBeGreaterThan(0);

        const loc = result.locations[0];
        expect(loc.physicalLocation).toBeDefined();
        expect(loc.physicalLocation.artifactLocation).toBeDefined();
        expect(typeof loc.physicalLocation.artifactLocation.uri).toBe('string');
        expect(loc.physicalLocation.region).toBeDefined();
        expect(typeof loc.physicalLocation.region.startLine).toBe('number');
        expect(typeof loc.physicalLocation.region.startColumn).toBe('number');
      }
    });
  });
});
