import type { ValidationResult } from "./types.js";
/**
 * Validates cargo test text output format
 * Expected patterns:
 * - "running N tests"
 * - "test result: ok." or "test result: FAILED."
 * - Individual test results like "test tests::test_name ... ok"
 */
export declare function validateCargoTestOutput(content: string): ValidationResult;
//# sourceMappingURL=cargo-validator.d.ts.map