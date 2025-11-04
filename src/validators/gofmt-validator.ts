import type { ValidationResult } from './types.js';

export function validateGofmtOutput(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      error: 'Empty gofmt output',
    };
  }

  // gofmt -d output format is unified diff:
  // Must have "---" and "+++" lines (diff headers)
  // AND either @@ markers (unified diff hunks) OR lines starting with +/- (changes)

  const has3Dashes = content.includes('---');
  const has3Plus = content.includes('+++');
  const hasUnifiedDiffMarkers = /@@ /.test(content);
  const hasChangeLines = /\n[\s]*[+-][^+-]/.test(content); // +/- not followed by another +/-

  // Unified diff format requires all three: ---, +++, and either @@ or +/- lines
  if (has3Dashes && has3Plus && (hasUnifiedDiffMarkers || hasChangeLines)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Not valid gofmt diff output format',
  };
}
