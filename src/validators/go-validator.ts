import type { ValidationResult } from './types.js';

export function validateGoTestJSON(content: string): ValidationResult {
  try {
    const lines = content.trim().split('\n');

    if (lines.length === 0) {
      return {
        valid: false,
        error: 'Empty file',
      };
    }

    let hasTestOutput = false;
    let hasPackageAction = false;

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const obj = JSON.parse(line);

        // Check for standard go test JSON structure
        if (obj.Action && obj.Package) {
          hasPackageAction = true;
        }

        // Look for test output or results
        if ((obj.Test || obj.Output) && obj.Action) {
          hasTestOutput = true;
        }
      } catch {
        // Skip non-JSON lines
        continue;
      }
    }

    if (!hasPackageAction) {
      return {
        valid: false,
        error: 'Missing go test package and action fields',
      };
    }

    if (!hasTestOutput) {
      return {
        valid: false,
        error: 'No test output or results found',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function validateGolangciLintJSON(content: string): ValidationResult {
  try {
    const obj = JSON.parse(content);

    // Validate root structure
    if (typeof obj !== 'object' || obj === null) {
      return {
        valid: false,
        error: 'Root object expected',
      };
    }

    // Check for golangci-lint JSON structure
    if (!Array.isArray(obj.Issues) && typeof obj.Report !== 'object') {
      return {
        valid: false,
        error: 'Missing Issues array or Report object',
      };
    }

    // At minimum, should have either Issues or Report
    if (!(Array.isArray(obj.Issues) || (obj.Report && Array.isArray(obj.Report.Linters)))) {
      return {
        valid: false,
        error: 'Invalid golangci-lint structure',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
