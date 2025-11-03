import type { ValidationResult } from './types.js';

export function validateESLintOutput(content: string): ValidationResult {
  // ESLint output patterns:
  // - Line:col format: "  12:5  error  'foo' is not defined"
  // - Summary: "✖ 5 problems (5 errors, 0 warnings)"
  // - Must have .js/.ts file paths

  const hasErrorPattern = /\d+:\d+\s+(error|warning)/.test(content);
  const hasSummary = /\d+\s+problem/.test(content);
  const hasJSFilePath = /\S+\.(js|ts|jsx|tsx)/.test(content);

  // Must have JavaScript/TypeScript file paths AND either error pattern or summary
  if (hasJSFilePath && (hasErrorPattern || hasSummary)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match ESLint output format',
  };
}

export function validateTSCOutput(content: string): ValidationResult {
  // TypeScript compiler output pattern:
  // src/file.ts(line,col): error TS1234: message

  const tscPattern = /\.tsx?\(\d+,\d+\):\s+error\s+TS\d+/.test(content);

  if (tscPattern) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match TypeScript compiler output format',
  };
}

export function validateFlake8Output(content: string): ValidationResult {
  // Flake8 output pattern:
  // path/to/file.py:line:col: CODE message
  // Example: ./src/main.py:1:1: F401 'os' imported but unused
  // Flake8 uses specific error code format: single letter + 3 digits
  // Does NOT have ruff-specific markers like [*] or "fixable with --fix"

  const flake8Pattern = /\.py:\d+:\d+:\s+[A-Z]\d{3}\s/.test(content);
  const hasRuffMarkers = /\[\*\]|fixable with the `--fix` option|Found\s+\d+\s+error/.test(content);

  if (flake8Pattern && !hasRuffMarkers) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match flake8 output format',
  };
}

export function validateRuffOutput(content: string): ValidationResult {
  // Ruff output pattern:
  // path/to/file.py:line:col: CODE [*] message
  // Example: src/sample.py:2:8: F401 [*] `os` imported but unused
  // Ruff uses specific error codes (I001, F401, etc.) and unique summary format
  // Key differentiator: "[*]" marker and "fixable with the `--fix` option"

  const ruffPattern = /\.py:\d+:\d+:\s+[A-Z]\d+\s+\[\*\]/.test(content);
  const ruffSummary = /Found\s+\d+\s+error/.test(content);
  const ruffFixable = /fixable with the `--fix` option/.test(content);

  if (ruffPattern || (ruffSummary && ruffFixable)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match ruff output format',
  };
}

export function validateMypyOutput(content: string): ValidationResult {
  // Mypy output pattern:
  // path/to/file.py:line: error: message  [error-code]
  // Example: src/sample.py:8: error: Function is missing a return type annotation  [no-untyped-def]
  // Key differentiators: "error:" keyword, error codes in brackets, and specific summary format
  // Summary: Found N errors in N files (checked N source files)

  const mypyPattern = /\.py:\d+:\s+(error|note):/.test(content);
  const mypySummary = /Found\s+\d+\s+error.+\(checked\s+\d+\s+source\s+file/.test(content);

  if (mypyPattern || mypySummary) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match mypy output format',
  };
}
