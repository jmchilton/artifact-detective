import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { validate, ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import { loadAllFixtures } from './fixtures-helper.js';

describe('Generated fixture validation', () => {
  const fixtures = loadAllFixtures(['javascript', 'python', 'rust']);

  const fixturesByLanguage = fixtures.reduce(
    (acc, fixture) => {
      if (!acc[fixture.language]) {
        acc[fixture.language] = [];
      }
      acc[fixture.language].push(fixture);
      return acc;
    },
    {} as Record<string, typeof fixtures>,
  );

  for (const [lang, langFixtures] of Object.entries(fixturesByLanguage)) {
    describe(`${lang} fixtures`, () => {
      for (const fixture of langFixtures) {
        describe(fixture.file, () => {
          it('exists in generated/ directory', () => {
            expect(fixture.path).toBeTruthy();
          });

          const capabilities = ARTIFACT_TYPE_REGISTRY[fixture.type];

          // ALWAYS test validator if one exists (structural correctness)
          if (capabilities?.validator) {
            it('passes validator', () => {
              const content = readFileSync(fixture.path, 'utf-8');
              const result = validate(fixture.type, content);
              expect(result.valid).toBe(true);
              if (!result.valid) {
                console.error(`Validation error: ${result.error}`);
              }
            });
          }

          // ONLY test auto-detection if supported (based on registry)
          if (capabilities?.supportsAutoDetection) {
            it(`auto-detects as ${fixture.type}`, () => {
              const result = detectArtifactType(fixture.path);
              expect(result.detectedType).toBe(fixture.type);
            });
          }

          // Test extraction if an extract function exists
          if (capabilities?.extract) {
            it('extracts successfully', () => {
              const extracted = capabilities.extract(fixture.type, fixture.path);
              expect(extracted).toBeTruthy();
            });
          }

          // Test normalization if a normalize function exists
          if (capabilities?.normalize) {
            it('normalizes to JSON', () => {
              const json = capabilities.normalize(fixture.path);
              expect(json).toBeTruthy();
              expect(() => JSON.parse(json!)).not.toThrow();
            });
          }
        });
      }
    });
  }
});
