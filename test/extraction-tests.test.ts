import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ArtifactType, ExtractorConfig } from '../src/index.js';
import { extractArtifactFromLog, extractArtifactToJson } from '../src/validators/index.js';

type PatternRule = { string: string } | { regex: string } | { lint: string };

interface ExtractionTest {
  'artifact-type': ArtifactType;
  description: string;
  'log-file': string;
  extraction?: {
    startMarker?: string;
    endMarker?: string;
    includeEndMarker?: boolean;
  };
  include: PatternRule[];
  exclude: PatternRule[];
}

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/extraction-tests');

/**
 * Check if a pattern matches content
 */
function patternMatches(content: string, rule: PatternRule): boolean {
  if ('string' in rule) {
    return content.includes(rule.string);
  } else if ('regex' in rule) {
    try {
      const regex = new RegExp(rule.regex, 'm');
      return regex.test(content);
    } catch {
      console.error(`Invalid regex pattern: ${rule.regex}`);
      return false;
    }
  } else if ('lint' in rule) {
    // Lint type - substring match for lint-style output
    return content.includes(rule.lint);
  }
  return false;
}

/**
 * Get readable pattern description
 */
function patternDescription(rule: PatternRule): string {
  if ('string' in rule) return `string: "${rule.string}"`;
  if ('regex' in rule) return `regex: "${rule.regex}"`;
  if ('lint' in rule) return `lint: "${rule.lint}"`;
  return 'unknown pattern';
}

// Load manifest at module level so tests can be generated at collection time
const manifestPath = join(FIXTURES_DIR, 'manifest.yml');
const manifestContent = readFileSync(manifestPath, 'utf-8');
const manifestData = yaml.load(manifestContent) as Record<string, ExtractionTest[]>;
const extractionTests = manifestData['extraction-tests'] ?? [];

describe('Extraction Tests', () => {
  // Test that manifest exists and is valid
  it('manifest.yml exists and is valid', () => {
    expect(extractionTests).toBeDefined();
    expect(Array.isArray(extractionTests)).toBe(true);
    expect(extractionTests.length).toBeGreaterThan(0);
  });

  // For each test in the manifest, create a test suite
  for (const test of extractionTests) {
    describe(`${test['artifact-type']} extraction`, () => {
      let extractedContent: string | null;

      beforeAll(() => {
        const logPath = join(FIXTURES_DIR, test['log-file']);
        expect(logPath).toBeTruthy();

        const logContent = readFileSync(logPath, 'utf-8');
        expect(logContent).toBeTruthy();

        // Build extractor config from manifest if provided
        let extractorConfig: ExtractorConfig | undefined;
        if (test.extraction) {
          extractorConfig = {
            startMarker: test.extraction.startMarker
              ? new RegExp(test.extraction.startMarker)
              : undefined,
            endMarker: test.extraction.endMarker
              ? new RegExp(test.extraction.endMarker)
              : undefined,
            includeEndMarker: test.extraction.includeEndMarker,
          };
        }

        // Run extraction
        extractedContent = extractArtifactFromLog(
          test['artifact-type'],
          logContent,
          extractorConfig,
        );
      });

      it('log file exists', () => {
        const logPath = join(FIXTURES_DIR, test['log-file']);
        const content = readFileSync(logPath, 'utf-8');
        expect(content).toBeTruthy();
      });

      it('extraction succeeds (produces output)', () => {
        expect(extractedContent).toBeTruthy();
        expect(extractedContent).not.toBeNull();
        expect(typeof extractedContent).toBe('string');
      });

      // Test include patterns
      for (const includePattern of test.include ?? []) {
        it(`includes ${patternDescription(includePattern)}`, () => {
          expect(extractedContent).toBeTruthy();
          const matches = patternMatches(extractedContent!, includePattern);
          expect(matches).toBe(true);
          if (!matches) {
            console.error(`Expected to find: ${patternDescription(includePattern)}`);
            console.error(`In extracted content:\n${extractedContent?.substring(0, 1000)}`);
          }
        });
      }

      // Test exclude patterns
      for (const excludePattern of test.exclude ?? []) {
        it(`excludes ${patternDescription(excludePattern)}`, () => {
          expect(extractedContent).toBeTruthy();
          const matches = patternMatches(extractedContent!, excludePattern);
          expect(matches).toBe(false);
          if (matches) {
            console.error(`Did not expect to find: ${patternDescription(excludePattern)}`);
            console.error(`But found in:\n${extractedContent?.substring(0, 1000)}`);
          }
        });
      }
    });
  }
});

describe('Extract and Convert to JSON', () => {
  const FIXTURES_DIR_EXTRACTION = join(import.meta.dirname, '../fixtures/extraction-tests');
  const FIXTURES_DIR_GENERATED = join(import.meta.dirname, '../fixtures/generated');

  describe('Text extractors without normalizers', () => {
    it('eslint-txt: has extractor but no normalizer (returns null)', () => {
      const eslintPath = join(FIXTURES_DIR_EXTRACTION, 'eslint-txt/logs.txt');
      const logContent = readFileSync(eslintPath, 'utf-8');

      const result = extractArtifactToJson('eslint-txt', logContent);

      // eslint-txt has an extractor but no normalizer, so cannot convert to JSON
      expect(result).toBeNull();
    });
  });

  describe('Native JSON types', () => {
    it('eslint-json: returns valid JSON from file content', () => {
      const eslintPath = join(FIXTURES_DIR_GENERATED, 'javascript/eslint-results.json');
      const content = readFileSync(eslintPath, 'utf-8');

      const result = extractArtifactToJson('eslint-json', content);

      expect(result).not.toBeNull();

      // Effective type should be eslint-json
      expect(result!.effectiveType).toBe('eslint-json');

      // Validate JSON is valid
      const json = JSON.parse(result!.json);
      expect(json).toBeDefined();
      expect(Array.isArray(json)).toBe(true);

      // Description should be included
      expect(result!.description).toBeTruthy();
      expect(result!.description?.toolUrl).toContain('eslint');
      expect(result!.description?.fileExtension).toBe('json');
    });

    it('pytest-json: returns valid JSON with test data', () => {
      const pytestPath = join(FIXTURES_DIR_GENERATED, 'python/pytest-results.json');
      const content = readFileSync(pytestPath, 'utf-8');

      const result = extractArtifactToJson('pytest-json', content);

      expect(result).not.toBeNull();
      expect(result!.effectiveType).toBe('pytest-json');

      const json = JSON.parse(result!.json);
      expect(json).toHaveProperty('tests');

      // Description for pytest-json
      expect(result!.description?.toolUrl).toContain('pytest');
      expect(result!.description?.fileExtension).toBe('json');
    });

    it('go-test-ndjson: handles NDJSON test output', () => {
      // Simulate NDJSON content (newline-delimited JSON)
      const ndjsonContent = `{"test":"TestAdd","result":"pass"}
{"test":"TestSubtract","result":"pass"}`;

      const result = extractArtifactToJson('go-test-ndjson', ndjsonContent);

      expect(result).not.toBeNull();

      // Should be converted to JSON array
      expect(result!.effectiveType).toBe('go-test-json');

      const json = JSON.parse(result!.json);
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);

      // Description should have json fileExtension after normalization
      expect(result!.description?.fileExtension).toBe('json');
    });
  });

  describe('NDJSON normalization', () => {
    it('clippy-ndjson: normalizes NDJSON to JSON array', () => {
      // Simulate clippy NDJSON output
      const ndjsonContent = `{"reason":"compiler-message","message":{"rendered":"warning: unused variable"}}
{"reason":"compiler-message","message":{"rendered":"warning: dead code"}}`;

      const result = extractArtifactToJson('clippy-ndjson', ndjsonContent);

      expect(result).not.toBeNull();

      // Effective type should be clippy-json after normalization
      expect(result!.effectiveType).toBe('clippy-json');

      // Should be valid JSON array
      const json = JSON.parse(result!.json);
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);

      // Description should be for clippy
      expect(result!.description?.toolUrl).toContain('clippy');
      expect(result!.description?.fileExtension).toBe('json');
    });
  });

  describe('Types without extractors/normalizers', () => {
    it('cargo-test-txt: returns null (no extractor, no normalizer)', () => {
      const content = 'test output without structure';

      const result = extractArtifactToJson('cargo-test-txt', content);

      expect(result).toBeNull();
    });

    it('rustfmt-txt: returns null (no extractor, no normalizer)', () => {
      const content = 'some rustfmt output';

      const result = extractArtifactToJson('rustfmt-txt', content);

      expect(result).toBeNull();
    });

    it('black-txt: returns null (no normalizer)', () => {
      const content = 'reformatted file.py';

      const result = extractArtifactToJson('black-txt', content);

      expect(result).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('invalid JSON content: returns null for JSON types', () => {
      const invalidContent = 'not valid json {[}';

      const result = extractArtifactToJson('eslint-json', invalidContent);

      expect(result).toBeNull();
    });

    it('empty content: returns null for extractable types', () => {
      const result = extractArtifactToJson('eslint-txt', '');

      expect(result).toBeNull();
    });

    it('malformed NDJSON: filters invalid lines and returns valid ones', () => {
      const mixedContent = `{"valid":"json"}
this is not json
{"another":"valid"}`;

      const result = extractArtifactToJson('go-test-ndjson', mixedContent);

      expect(result).not.toBeNull();

      const json = JSON.parse(result!.json);
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2); // Should have 2 valid JSON objects, skip invalid line
    });
  });

  describe('Result structure validation', () => {
    it('returns complete ArtifactJsonResult object with all fields', () => {
      const eslintPath = join(FIXTURES_DIR_GENERATED, 'javascript/eslint-results.json');
      const content = readFileSync(eslintPath, 'utf-8');

      const result = extractArtifactToJson('eslint-json', content);

      expect(result).not.toBeNull();

      // Verify all required fields are present
      expect(result!).toHaveProperty('json');
      expect(result!).toHaveProperty('effectiveType');
      expect(result!).toHaveProperty('description');

      // Verify types
      expect(typeof result!.json).toBe('string');
      expect(typeof result!.effectiveType).toBe('string');
      expect(result!.description).toHaveProperty('toolUrl');
      expect(result!.description).toHaveProperty('parsingGuide');
    });

    it('returns correct effectiveType for normalized artifacts', () => {
      const ndjsonContent = `{"test":"test1"}
{"test":"test2"}`;

      const result = extractArtifactToJson('go-test-ndjson', ndjsonContent);

      // Input type is go-test-ndjson, but output type should be go-test-json
      expect(result!.effectiveType).toBe('go-test-json');
      expect(result!.effectiveType).not.toBe('go-test-ndjson');
    });
  });

  describe('Validation within extraction', () => {
    it('extract with validate option includes validationResult for valid content', async () => {
      const { extract } = await import('../src/validators/index.js');
      const eslintPath = join(FIXTURES_DIR_GENERATED, 'javascript/eslint-results.json');
      const content = readFileSync(eslintPath, 'utf-8');

      const result = extract('eslint-json', content, { validate: true });

      expect(result).not.toBeNull();
      expect(result!).toHaveProperty('validationResult');
      expect(result!.validationResult).toBeDefined();
      expect(result!.validationResult!.valid).toBe(true);
      expect(result!.validationResult!.artifact).toBeDefined();
      expect(result!.validationResult!.artifact?.artifactType).toBe('eslint-json');
    });

    it('extract without validate option does not include validationResult', async () => {
      const { extract } = await import('../src/validators/index.js');
      const eslintPath = join(FIXTURES_DIR_GENERATED, 'javascript/eslint-results.json');
      const content = readFileSync(eslintPath, 'utf-8');

      const result = extract('eslint-json', content);

      expect(result).not.toBeNull();
      expect(result!.validationResult).toBeUndefined();
    });

    it('extract with validate option detects invalid content', async () => {
      const { extract } = await import('../src/validators/index.js');
      const invalidContent = 'not valid json {[}';

      const result = extract('eslint-json', invalidContent, { validate: true });

      expect(result).not.toBeNull();
      expect(result!.validationResult).toBeDefined();
      expect(result!.validationResult!.valid).toBe(false);
      expect(result!.validationResult!.error).toBeDefined();
    });

    it('validate option works with normalized extraction', async () => {
      const { extract } = await import('../src/validators/index.js');
      const eslintPath = join(FIXTURES_DIR_GENERATED, 'javascript/eslint-results.json');
      const content = readFileSync(eslintPath, 'utf-8');

      // Extract with both normalize and validate options
      const result = extract('eslint-json', content, { normalize: false, validate: true });

      expect(result).not.toBeNull();
      expect(result!.validationResult).toBeDefined();
      expect(result!.validationResult!.valid).toBe(true);
      expect(result!.validationResult!.artifact?.artifactType).toBe('eslint-json');
    });
  });
});
