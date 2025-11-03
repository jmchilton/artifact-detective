import type { ValidationResult } from "./types.js";

/**
 * Validates rustfmt check output format
 * Expected patterns:
 * - Diff output showing formatting differences with "Diff in" marker
 * - Empty output is valid (no formatting issues)
 */
export function validateRustfmtOutput(content: string): ValidationResult {
  // Empty output is valid (no formatting issues)
  if (content.trim() === "") {
    return { valid: true };
  }

  // rustfmt --check outputs diffs with specific "Diff in" marker
  const diffPattern = /Diff\s+in\s+\S+\.rs\s+at\s+line/i.test(content);

  if (diffPattern) {
    return { valid: true };
  }

  return {
    valid: false,
    error: "Does not match rustfmt output format",
  };
}
