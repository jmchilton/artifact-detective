import type { ValidationResult } from "./types.js";
/**
 * Validates rustfmt check output format
 * Expected patterns:
 * - Diff output showing formatting differences
 * - File paths with "Diff in..." lines
 * - Empty output is valid (no formatting issues)
 */
export declare function validateRustfmtOutput(content: string): ValidationResult;
//# sourceMappingURL=rustfmt-validator.d.ts.map