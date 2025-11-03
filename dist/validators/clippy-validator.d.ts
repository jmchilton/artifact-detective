import type { ValidationResult } from "./types.js";
/**
 * Validates clippy JSON output format
 * Expected format: newline-delimited JSON with objects containing:
 * - "reason" field ("compiler-message", "compiler-artifact", "build-finished")
 * - "message" field for compiler-message entries with "level" and "spans"
 */
export declare function validateClippyJSON(content: string): ValidationResult;
/**
 * Validates clippy text output format
 * Expected patterns:
 * - "warning:" or "error:" lines with file paths
 * - Code span indicators like "--> src/lib.rs:7:5"
 * - Warning/error count summary
 */
export declare function validateClippyText(content: string): ValidationResult;
//# sourceMappingURL=clippy-validator.d.ts.map