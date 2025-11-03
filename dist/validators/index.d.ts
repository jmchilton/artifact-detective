import type { ArtifactType } from "../types.js";
import type { ArtifactTypeCapabilities, ValidationResult } from "./types.js";
export { validateJestJSON } from "./jest-validator.js";
export { validatePlaywrightJSON } from "./playwright-validator.js";
export { validatePlaywrightHTML } from "./playwright-html-validator.js";
export { validatePytestJSON, validatePytestHTML } from "./pytest-validator.js";
export { validateJUnitXML } from "./junit-validator.js";
export { validateESLintOutput, validateTSCOutput, validateFlake8Output, validateRuffOutput, validateMypyOutput, } from "./linter-validator.js";
export { validateCargoTestOutput } from "./cargo-validator.js";
export { validateClippyJSON, validateClippyText } from "./clippy-validator.js";
export { validateRustfmtOutput } from "./rustfmt-validator.js";
export type { ValidationResult, ValidatorFunction, ArtifactTypeCapabilities } from "./types.js";
/**
 * Registry of artifact type capabilities and validators.
 *
 * - supportsAutoDetection: true if the type has unique structural markers for reliable auto-detection
 * - validator: function to validate content matches expected format (null if no validator)
 */
export declare const ARTIFACT_TYPE_REGISTRY: Record<ArtifactType, ArtifactTypeCapabilities>;
/**
 * Central validation entry point. Dispatches to appropriate validator based on artifact type.
 *
 * @param type - The artifact type to validate
 * @param content - The file content as a string
 * @returns ValidationResult indicating if content is valid for the given type
 */
export declare function validate(type: ArtifactType, content: string): ValidationResult;
//# sourceMappingURL=index.d.ts.map