import type { ValidationResult } from "./types.js";

export function validateMypyJSON(content: string): ValidationResult {
  try {
    const lines = content.trim().split("\n").filter((l) => l.trim());

    // Mypy JSON should have at least one line of NDJSON
    if (lines.length === 0) {
      return {
        valid: false,
        error: "Mypy JSON output is empty",
      };
    }

    // Check first line is valid JSON with expected mypy fields
    const firstLine = lines[0];
    let firstObj: unknown;
    try {
      firstObj = JSON.parse(firstLine);
    } catch (e) {
      return {
        valid: false,
        error: `First line is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    // Validate first object has mypy-specific fields
    if (typeof firstObj !== "object" || firstObj === null) {
      return {
        valid: false,
        error: "First line is not a JSON object",
      };
    }

    const obj = firstObj as Record<string, unknown>;
    if (typeof obj.file !== "string") {
      return {
        valid: false,
        error: "Missing or invalid 'file' field in first error",
      };
    }

    if (typeof obj.line !== "number") {
      return {
        valid: false,
        error: "Missing or invalid 'line' field in first error",
      };
    }

    if (typeof obj.message !== "string") {
      return {
        valid: false,
        error: "Missing or invalid 'message' field in first error",
      };
    }

    if (typeof obj.code !== "string") {
      return {
        valid: false,
        error: "Missing or invalid 'code' field in first error",
      };
    }

    // Validate at least one more line if available (to ensure NDJSON format)
    if (lines.length > 1) {
      try {
        JSON.parse(lines[1]);
      } catch (e) {
        return {
          valid: false,
          error: `Invalid JSON on line 2: ${e instanceof Error ? e.message : String(e)}`,
        };
      }
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: `Validation error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
