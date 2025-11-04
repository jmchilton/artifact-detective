import { readFileSync } from 'fs';
import type { ArtifactType } from '../types.js';
import type { ArtifactTypeCapabilities, ValidationResult } from './types.js';
import { validateJestJSON } from './jest-validator.js';
import { validatePlaywrightJSON } from './playwright-validator.js';
import { validatePytestJSON, validatePytestHTML } from './pytest-validator.js';
import { validateJUnitXML } from './junit-validator.js';
import { validateCheckstyleXML } from './checkstyle-validator.js';
import { validateSpotBugsXML } from './spotbugs-validator.js';
import { validateEslintJSON } from './eslint-validator.js';
import { validateMypyJSON } from './mypy-validator.js';
import {
  validateESLintOutput,
  validateTSCOutput,
  validateFlake8Output,
  validateRuffOutput,
  validateMypyOutput,
} from './linter-validator.js';
import { validateCargoTestOutput } from './cargo-validator.js';
import { validateClippyJSON, validateClippyText } from './clippy-validator.js';
import { validateRustfmtOutput } from './rustfmt-validator.js';
import { extractLinterOutput } from '../parsers/linters/extractors.js';
import { extractPytestJSON } from '../parsers/html/pytest-html.js';

export { validateJestJSON } from './jest-validator.js';
export { validatePlaywrightJSON } from './playwright-validator.js';
export { validatePytestJSON, validatePytestHTML } from './pytest-validator.js';
export { validateJUnitXML } from './junit-validator.js';
export { validateCheckstyleXML } from './checkstyle-validator.js';
export { validateSpotBugsXML } from './spotbugs-validator.js';
export { validateEslintJSON } from './eslint-validator.js';
export { validateMypyJSON } from './mypy-validator.js';
export {
  validateESLintOutput,
  validateTSCOutput,
  validateFlake8Output,
  validateRuffOutput,
  validateMypyOutput,
} from './linter-validator.js';
export { validateCargoTestOutput } from './cargo-validator.js';
export { validateClippyJSON, validateClippyText } from './clippy-validator.js';
export { validateRustfmtOutput } from './rustfmt-validator.js';
export type {
  ValidationResult,
  ValidatorFunction,
  ArtifactTypeCapabilities,
  ExtractFunction,
  NormalizeFunction,
} from './types.js';

/**
 * Extract function for linter output artifacts
 * Extracts structured output from linter logs
 */
function extractLinterText(artifactType: string, filePath: string): string | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const linterType = artifactType.replace(/-txt$/, '').replace(/-json$/, '');
    return extractLinterOutput(linterType, content);
  } catch {
    return null;
  }
}

/**
 * Normalize function for pytest HTML artifacts
 * Converts HTML report to JSON by extracting embedded test data
 */
function normalizePytestHTML(filePath: string): string | null {
  try {
    const report = extractPytestJSON(filePath);
    return report ? JSON.stringify(report) : null;
  } catch {
    return null;
  }
}

/**
 * Registry of artifact type capabilities and validators.
 *
 * - supportsAutoDetection: true if the type has unique structural markers for reliable auto-detection
 * - validator: function to validate content matches expected format (null if no validator)
 * - extract: function to extract content from artifact file (null if no extraction needed)
 * - normalize: function to normalize content to JSON (null if no normalization needed)
 * - isJSON: true if the artifact type is already in JSON format
 *
 * Artifacts support JSON export if: isJSON is true OR normalize function exists
 */
export const ARTIFACT_TYPE_REGISTRY: Record<ArtifactType, ArtifactTypeCapabilities> = {
  'jest-json': {
    supportsAutoDetection: true,
    validator: validateJestJSON,
    extract: null,
    normalize: null,
    isJSON: true,
  },
  'playwright-json': {
    supportsAutoDetection: true,
    validator: validatePlaywrightJSON,
    extract: null,
    normalize: null,
    isJSON: true,
  },
  'jest-html': {
    supportsAutoDetection: true,
    validator: null,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'pytest-json': {
    supportsAutoDetection: true,
    validator: validatePytestJSON,
    extract: null,
    normalize: null,
    isJSON: true,
  },
  'pytest-html': {
    supportsAutoDetection: true,
    validator: validatePytestHTML,
    extract: null,
    normalize: normalizePytestHTML,
    isJSON: false,
  },
  'junit-xml': {
    supportsAutoDetection: true,
    validator: validateJUnitXML,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'checkstyle-xml': {
    supportsAutoDetection: true,
    validator: validateCheckstyleXML,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'spotbugs-xml': {
    supportsAutoDetection: true,
    validator: validateSpotBugsXML,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'eslint-json': {
    supportsAutoDetection: true,
    validator: validateEslintJSON,
    extract: null,
    normalize: null,
    isJSON: true,
  },
  'mypy-json': {
    supportsAutoDetection: true,
    validator: validateMypyJSON,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'eslint-txt': {
    supportsAutoDetection: false,
    validator: validateESLintOutput,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'tsc-txt': {
    supportsAutoDetection: false,
    validator: validateTSCOutput,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'flake8-txt': {
    supportsAutoDetection: false,
    validator: validateFlake8Output,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'ruff-txt': {
    supportsAutoDetection: false,
    validator: validateRuffOutput,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'mypy-txt': {
    supportsAutoDetection: false,
    validator: validateMypyOutput,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'cargo-test-txt': {
    supportsAutoDetection: false,
    validator: validateCargoTestOutput,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'clippy-json': {
    supportsAutoDetection: true,
    validator: validateClippyJSON,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  'clippy-txt': {
    supportsAutoDetection: false,
    validator: validateClippyText,
    extract: extractLinterText,
    normalize: null,
    isJSON: false,
  },
  'rustfmt-txt': {
    supportsAutoDetection: false,
    validator: validateRustfmtOutput,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  binary: {
    supportsAutoDetection: true,
    validator: null,
    extract: null,
    normalize: null,
    isJSON: false,
  },
  unknown: {
    supportsAutoDetection: false,
    validator: null,
    extract: null,
    normalize: null,
    isJSON: false,
  },
};

/**
 * Central validation entry point. Dispatches to appropriate validator based on artifact type.
 *
 * @param type - The artifact type to validate
 * @param content - The file content as a string
 * @returns ValidationResult indicating if content is valid for the given type
 */
export function validate(type: ArtifactType, content: string): ValidationResult {
  const capabilities = ARTIFACT_TYPE_REGISTRY[type];

  if (!capabilities) {
    return {
      valid: false,
      error: `Unknown artifact type: ${type}`,
    };
  }

  if (!capabilities.validator) {
    return {
      valid: false,
      error: `No validator available for type: ${type}`,
    };
  }

  return capabilities.validator(content);
}

/**
 * Check if a detected artifact is already in JSON format
 *
 * @param result - The detection result from detectArtifactType
 * @returns true if the artifact type is natively JSON
 */
export function isJSON(result: { detectedType: ArtifactType }): boolean {
  const capabilities = ARTIFACT_TYPE_REGISTRY[result.detectedType];
  return capabilities?.isJSON ?? false;
}

/**
 * Check if a detected artifact can be converted to JSON format
 *
 * @param result - The detection result from detectArtifactType
 * @returns true if artifact is JSON or has a normalize function
 */
export function canConvertToJSON(result: { detectedType: ArtifactType }): boolean {
  const capabilities = ARTIFACT_TYPE_REGISTRY[result.detectedType];
  return (capabilities?.isJSON ?? false) || capabilities?.normalize !== null;
}

/**
 * Convert a detected artifact to JSON format
 *
 * @param result - The detection result from detectArtifactType
 * @param filePath - Path to the artifact file
 * @returns JSON string if conversion is possible, null otherwise
 */
export function convertToJSON(
  result: { detectedType: ArtifactType },
  filePath: string,
): string | null {
  const capabilities = ARTIFACT_TYPE_REGISTRY[result.detectedType];

  // If already JSON, read and return as-is
  if (capabilities?.isJSON) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      // Validate it's valid JSON
      JSON.parse(content);
      return content;
    } catch {
      return null;
    }
  }

  // If has normalize function, use it
  if (capabilities?.normalize) {
    return capabilities.normalize(filePath);
  }

  return null;
}
