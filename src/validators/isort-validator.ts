import type { ValidationResult } from './types.js';

/**
 * Validate isort output format
 * isort produces diff output showing import sorting issues
 * Format:
 * - ERROR: <file> Imports are incorrectly sorted and/or formatted.
 * - Followed by unified diff showing changes
 * - Key markers: "ERROR:", "---", "+++", "@@" (diff headers)
 * - REQUIRED: Must have "ERROR:" marker - differentiates from generic diff tools like gofmt
 */
export function validateIsortOutput(content: string): ValidationResult {
  // MUST have isort-specific ERROR marker to differentiate from other diff-based tools
  const hasErrorMarker = /ERROR:.*Imports are incorrectly sorted/.test(content);

  if (!hasErrorMarker) {
    return {
      valid: false,
      error: 'Does not match isort output format (missing ERROR marker)',
    };
  }

  // If ERROR marker is present, it's likely isort even without full diff validation
  // (isort may output ERROR without full diff in some modes)
  return { valid: true };
}
