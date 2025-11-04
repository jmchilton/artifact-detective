import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import type { ArtifactType } from '../types.js';
import type { ArtifactTypeCapabilities, ValidationResult } from './types.js';
import { validateJestJSON } from './jest-validator.js';
import { validatePlaywrightJSON } from './playwright-validator.js';
import { validatePytestJSON, validatePytestHTML } from './pytest-validator.js';
import { validateJUnitXML } from './junit-validator.js';
import { validateCheckstyleXML, validateCheckstyleSARIF } from './checkstyle-validator.js';
import { validateSpotBugsXML } from './spotbugs-validator.js';
import { validateSurefireHTML } from './surefire-validator.js';
import { validateEslintJSON } from './eslint-validator.js';
import { validateMypyNDJSON } from './mypy-validator.js';
import {
  validateESLintOutput,
  validateTSCOutput,
  validateFlake8Output,
  validateRuffOutput,
  validateMypyOutput,
} from './linter-validator.js';
import { validateCargoTestOutput } from './cargo-validator.js';
import { validateClippyNDJSON, validateClippyText } from './clippy-validator.js';
import { validateRustfmtOutput } from './rustfmt-validator.js';
import { validateGoTestNDJSON, validateGolangciLintJSON } from './go-validator.js';
import { validateGofmtOutput } from './gofmt-validator.js';
import { extractLinterOutput, convertMypyTextToNDJSON } from '../parsers/linters/extractors.js';
import { extractPytestJSON } from '../parsers/html/pytest-html.js';
import { extractJestJSON } from '../parsers/html/jest-html.js';

export { validateJestJSON } from './jest-validator.js';
export { validatePlaywrightJSON } from './playwright-validator.js';
export { validatePytestJSON, validatePytestHTML } from './pytest-validator.js';
export { validateJUnitXML } from './junit-validator.js';
export { validateCheckstyleXML, validateCheckstyleSARIF } from './checkstyle-validator.js';
export { validateSpotBugsXML } from './spotbugs-validator.js';
export { validateSurefireHTML } from './surefire-validator.js';
export { validateEslintJSON } from './eslint-validator.js';
export { validateMypyNDJSON } from './mypy-validator.js';
export {
  validateESLintOutput,
  validateTSCOutput,
  validateFlake8Output,
  validateRuffOutput,
  validateMypyOutput,
} from './linter-validator.js';
export { validateCargoTestOutput } from './cargo-validator.js';
export { validateClippyNDJSON, validateClippyText } from './clippy-validator.js';
export { validateRustfmtOutput } from './rustfmt-validator.js';
export { validateGoTestNDJSON, validateGolangciLintJSON } from './go-validator.js';
export { validateGofmtOutput } from './gofmt-validator.js';
export type {
  ValidationResult,
  ValidatorFunction,
  ArtifactTypeCapabilities,
  ExtractFunction,
  NormalizeFunction,
} from './types.js';

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
 * Normalize function for jest HTML artifacts
 * Converts HTML report to JSON by parsing HTML structure
 */
function normalizeJestHTML(filePath: string): string | null {
  try {
    const report = extractJestJSON(filePath);
    return report ? JSON.stringify(report) : null;
  } catch {
    return null;
  }
}

/**
 * Helper to convert NDJSON string to JSON array string
 */
function ndjsonToJsonArray(ndjsonContent: string): string | null {
  try {
    const lines = ndjsonContent.trim().split('\n');
    const objects: unknown[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      try {
        objects.push(JSON.parse(line));
      } catch {
        // Skip lines that aren't valid JSON (e.g., compiler status messages)
        continue;
      }
    }

    return objects.length > 0 ? JSON.stringify(objects) : null;
  } catch {
    return null;
  }
}

/**
 * Normalize function for NDJSON (newline-delimited JSON) artifacts
 * Converts each line of JSON into a JSON array, skipping non-JSON lines
 */
function normalizeNDJSON(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return ndjsonToJsonArray(content);
  } catch {
    return null;
  }
}

/**
 * Normalize function for mypy text output
 * Converts text format to mypy-ndjson NDJSON, then to JSON array
 */
function normalizeMypyText(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const ndjson = convertMypyTextToNDJSON(content);
    if (!ndjson) {
      return null;
    }
    // Convert NDJSON to JSON array
    return ndjsonToJsonArray(ndjson);
  } catch {
    return null;
  }
}

/**
 * Specific extractor functions for linter output from CI logs
 */
function extractESLintFromLog(logContents: string): string | null {
  return extractLinterOutput('eslint', logContents);
}

function extractTSCFromLog(logContents: string): string | null {
  return extractLinterOutput('tsc', logContents);
}

function extractFlake8FromLog(logContents: string): string | null {
  return extractLinterOutput('flake8', logContents);
}

function extractRuffFromLog(logContents: string): string | null {
  return extractLinterOutput('ruff', logContents);
}

function extractMypyFromLog(logContents: string): string | null {
  return extractLinterOutput('mypy', logContents);
}

function extractClippyFromLog(logContents: string): string | null {
  return extractLinterOutput('clippy', logContents);
}

/**
 * Registry of artifact type capabilities and validators.
 *
 * - supportsAutoDetection: true if the type has unique structural markers for reliable auto-detection
 * - validator: function to validate content matches expected format (null if no validator)
 * - extract: function to extract artifact content from CI logs (null if no extraction supported)
 * - normalize: function to normalize content to JSON (null if no normalization needed)
 * - normalizesTo: artifact type after normalization (null if not normalized or normalizes to same type)
 * - artificialType: true if this type only exists after normalization (not from real tool output)
 * - isJSON: true if the artifact type is already in JSON format
 *
 * Artifacts support JSON export if: isJSON is true OR normalize function exists
 *
 * The registry supports three operation modes:
 * 1. Detection & validation: Use detectArtifactType and validate functions
 * 2. Extraction from logs: Use extractArtifactFromLog for linter types with extractors
 * 3. Extraction + normalization: Use extractArtifactToJson to extract and convert to JSON in one step
 */
export const ARTIFACT_TYPE_REGISTRY: Record<ArtifactType, ArtifactTypeCapabilities> = {
  'jest-json': {
    supportsAutoDetection: true,
    validator: validateJestJSON,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  'playwright-json': {
    supportsAutoDetection: true,
    validator: validatePlaywrightJSON,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  'jest-html': {
    supportsAutoDetection: true,
    validator: null,
    extract: null,
    normalize: normalizeJestHTML,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'pytest-json': {
    supportsAutoDetection: true,
    validator: validatePytestJSON,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  'pytest-html': {
    supportsAutoDetection: true,
    validator: validatePytestHTML,
    extract: null,
    normalize: normalizePytestHTML,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'junit-xml': {
    supportsAutoDetection: true,
    validator: validateJUnitXML,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'checkstyle-xml': {
    supportsAutoDetection: true,
    validator: validateCheckstyleXML,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'checkstyle-sarif-json': {
    supportsAutoDetection: true,
    validator: validateCheckstyleSARIF,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  'spotbugs-xml': {
    supportsAutoDetection: true,
    validator: validateSpotBugsXML,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'surefire-html': {
    supportsAutoDetection: true,
    validator: validateSurefireHTML,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'eslint-json': {
    supportsAutoDetection: true,
    validator: validateEslintJSON,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  'mypy-ndjson': {
    supportsAutoDetection: true,
    validator: validateMypyNDJSON,
    extract: null,
    normalize: normalizeNDJSON,
    normalizesTo: 'mypy-json',
    artificialType: false,
    isJSON: false,
  },
  'mypy-json': {
    supportsAutoDetection: false,
    validator: null,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: true,
    isJSON: true,
  },
  'eslint-txt': {
    supportsAutoDetection: false,
    validator: validateESLintOutput,
    extract: extractESLintFromLog,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'tsc-txt': {
    supportsAutoDetection: false,
    validator: validateTSCOutput,
    extract: extractTSCFromLog,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'flake8-txt': {
    supportsAutoDetection: false,
    validator: validateFlake8Output,
    extract: extractFlake8FromLog,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'ruff-txt': {
    supportsAutoDetection: false,
    validator: validateRuffOutput,
    extract: extractRuffFromLog,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'mypy-txt': {
    supportsAutoDetection: false,
    validator: validateMypyOutput,
    extract: extractMypyFromLog,
    normalize: normalizeMypyText,
    normalizesTo: 'mypy-json',
    artificialType: false,
    isJSON: false,
  },
  'cargo-test-txt': {
    supportsAutoDetection: false,
    validator: validateCargoTestOutput,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'clippy-ndjson': {
    supportsAutoDetection: true,
    validator: validateClippyNDJSON,
    extract: null,
    normalize: normalizeNDJSON,
    normalizesTo: 'clippy-json',
    artificialType: false,
    isJSON: false,
  },
  'clippy-json': {
    supportsAutoDetection: false,
    validator: null,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: true,
    isJSON: true,
  },
  'clippy-txt': {
    supportsAutoDetection: false,
    validator: validateClippyText,
    extract: extractClippyFromLog,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'rustfmt-txt': {
    supportsAutoDetection: false,
    validator: validateRustfmtOutput,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'gofmt-txt': {
    supportsAutoDetection: false,
    validator: validateGofmtOutput,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  'go-test-ndjson': {
    supportsAutoDetection: true,
    validator: validateGoTestNDJSON,
    extract: null,
    normalize: normalizeNDJSON,
    normalizesTo: 'go-test-json',
    artificialType: false,
    isJSON: false,
  },
  'go-test-json': {
    supportsAutoDetection: false,
    validator: null,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: true,
    isJSON: true,
  },
  'golangci-lint-json': {
    supportsAutoDetection: true,
    validator: validateGolangciLintJSON,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: true,
  },
  binary: {
    supportsAutoDetection: true,
    validator: null,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },
  unknown: {
    supportsAutoDetection: false,
    validator: null,
    extract: null,
    normalize: null,
    normalizesTo: null,
    artificialType: false,
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
 * Extract artifact content from CI log file
 *
 * @param artifactType - Target artifact type (must have extractor)
 * @param logContents - CI log file contents
 * @returns Extracted artifact content or null if extraction not supported/failed
 */
export function extractArtifactFromLog(
  artifactType: ArtifactType,
  logContents: string,
): string | null {
  const capabilities = ARTIFACT_TYPE_REGISTRY[artifactType];
  if (!capabilities?.extract) {
    return null;
  }
  return capabilities.extract(logContents);
}

/**
 * Result of extracting and converting artifact to JSON
 */
export interface ArtifactJsonResult {
  json: string;
  effectiveType: ArtifactType;
}

/**
 * Extract artifact from log and convert to JSON
 *
 * @param artifactType - Source artifact type
 * @param logContents - CI log file contents
 * @returns JSON content and effective type, or null if not possible
 */
export function extractArtifactToJson(
  artifactType: ArtifactType,
  logContents: string,
): ArtifactJsonResult | null {
  const capabilities = ARTIFACT_TYPE_REGISTRY[artifactType];
  if (!capabilities) return null;

  // Step 1: Extract from log if extractor exists, otherwise use raw content
  let content = logContents;
  if (capabilities.extract) {
    const extracted = capabilities.extract(logContents);
    if (!extracted) return null;
    content = extracted;
  }

  // Step 2: If already JSON, return as-is
  if (capabilities.isJSON) {
    try {
      JSON.parse(content); // Validate
      return { json: content, effectiveType: artifactType };
    } catch {
      return null;
    }
  }

  // Step 3: If has normalizer, convert to JSON
  if (capabilities.normalize && capabilities.normalizesTo) {
    // Write to temp file for normalize function
    const tempFile = `/tmp/artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.txt`;
    try {
      writeFileSync(tempFile, content);
      const normalized = capabilities.normalize(tempFile);
      if (normalized) {
        return { json: normalized, effectiveType: capabilities.normalizesTo };
      }
    } finally {
      try {
        unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  return null;
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
