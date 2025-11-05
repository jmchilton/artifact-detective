import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ArtifactType } from '../src/types.js';
import { extractArtifactFromLog } from '../src/validators/index.js';

type PatternRule =
  | { string: string }
  | { regex: string }
  | { lint: string };

interface ExtractionTest {
  'artifact-type': ArtifactType;
  description: string;
  'log-file': string;
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

        // Run extraction
        extractedContent = extractArtifactFromLog(
          test['artifact-type'],
          logContent,
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
