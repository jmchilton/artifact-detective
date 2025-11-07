import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';
import { detectArtifactType, validate, ARTIFACT_TYPE_REGISTRY } from '../../src/index.js';
import type { ArtifactType } from '../../src/types.js';
import type { ValidationResult } from '../../src/validators/types.js';

/**
 * Pattern 1: Standard artifact type testing helper
 * Eliminates boilerplate for artifact detection, validation, and registry checks
 */
export function testArtifactType(options: {
  artifactType: ArtifactType;
  fixturePath: string;
  expectedFormat: 'json' | 'xml' | 'html' | 'txt' | 'ndjson' | 'other';
  supportsAutoDetection?: boolean;
  invalidSamples?: string[];
  additionalTests?: () => void;
}) {
  describe(`${options.artifactType} detection and validation`, () => {
    if (options.supportsAutoDetection !== false) {
      it(`detects ${options.artifactType} by content`, () => {
        const result = detectArtifactType(options.fixturePath);
        expect(result.detectedType).toBe(options.artifactType);
        expect(result.originalFormat).toBe(options.expectedFormat);
        expect(result.isBinary).toBe(false);
      });
    }

    it(`validates ${options.artifactType} content`, () => {
      expectValidFixture(options.artifactType, options.fixturePath);
    });

    it('has proper registry entry', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY[options.artifactType];
      expect(capabilities).toBeDefined();
      expect(capabilities?.validator).toBeDefined();
      if (options.supportsAutoDetection !== false) {
        expect(capabilities?.supportsAutoDetection).toBe(true);
      }
    });

    if (options.invalidSamples && options.invalidSamples.length > 0) {
      testValidationRejection(options.artifactType, [
        ...options.invalidSamples.map((input, idx) => ({
          name: `rejects invalid sample ${idx + 1}`,
          input,
        })),
      ]);
    }

    if (options.additionalTests) {
      options.additionalTests();
    }
  });
}

/**
 * Pattern 5: Declarative validation rejection tests
 * Cleaner than imperative test blocks
 */
export function testValidationRejection(
  artifactType: ArtifactType,
  testCases: Array<{
    name: string;
    input: string;
    expectedError?: string;
  }>,
) {
  describe(`${artifactType} validation rejection`, () => {
    for (const testCase of testCases) {
      it(testCase.name, () => {
        const result = validate(artifactType, testCase.input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
        if (testCase.expectedError) {
          expect(result.error).toContain(testCase.expectedError);
        }
      });
    }
  });
}

/**
 * Pattern 6: Fixture validation helpers
 * Reduces 3-line validation sequences to 1 line
 */
export function validateFixture(artifactType: ArtifactType, fixturePath: string): ValidationResult {
  const content = readFileSync(fixturePath, 'utf-8');
  return validate(artifactType, content);
}

export function expectValidFixture(artifactType: ArtifactType, fixturePath: string): void {
  const result = validateFixture(artifactType, fixturePath);
  expect(result.valid).toBe(true);
  if (!result.valid) {
    console.error(`Validation failed for ${artifactType}: ${result.error}`);
  }
}

export function expectInvalidFixture(
  artifactType: ArtifactType,
  fixturePath: string,
  expectedError?: string,
): void {
  const result = validateFixture(artifactType, fixturePath);
  expect(result.valid).toBe(false);
  expect(result.error).toBeTruthy();
  if (expectedError) {
    expect(result.error).toContain(expectedError);
  }
}
