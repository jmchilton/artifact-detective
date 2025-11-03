import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { validate, ARTIFACT_TYPE_REGISTRY } from "../src/validators/index.js";
import { loadAllFixtures } from "./fixtures-helper.js";
import type { ArtifactType } from "../src/types.js";

/**
 * Test cross-validator specificity: ensure validators only validate their own artifact types
 * and reject fixtures from other types. This provides comprehensive negative test coverage.
 */
describe("Validator specificity (cross-validator negative tests)", () => {
  const allFixtures = loadAllFixtures();

  // Get all artifact types that have validators
  const typesWithValidators = Object.entries(ARTIFACT_TYPE_REGISTRY)
    .filter(([, capabilities]) => capabilities.validator !== null)
    .map(([type]) => type as ArtifactType);

  // Test that each fixture validates correctly with its own type
  describe("fixtures validate with correct type", () => {
    for (const fixture of allFixtures) {
      const capabilities = ARTIFACT_TYPE_REGISTRY[fixture.type];
      if (!capabilities?.validator) {
        // Skip fixtures without validators
        continue;
      }

      it(`${fixture.language}/${fixture.file} validates as ${fixture.type}`, () => {
        const content = readFileSync(fixture.path, "utf-8");
        const result = validate(fixture.type, content);
        expect(result.valid).toBe(true);
        if (!result.valid) {
          console.error(
            `Validation error for ${fixture.file}: ${result.error}`,
          );
        }
      });
    }
  });

  // Test that fixtures REJECT validation with wrong types (negative tests)
  describe("fixtures reject validation with wrong types", () => {
    for (const fixture of allFixtures) {
      const capabilities = ARTIFACT_TYPE_REGISTRY[fixture.type];
      if (!capabilities?.validator) {
        // Skip fixtures without validators
        continue;
      }

      // Test against all other validators
      for (const wrongType of typesWithValidators) {
        if (wrongType === fixture.type) {
          // Skip same type
          continue;
        }

        it(`${fixture.language}/${fixture.file} rejects validation as ${wrongType}`, () => {
          const content = readFileSync(fixture.path, "utf-8");
          const result = validate(wrongType, content);
          expect(result.valid).toBe(false);
        });
      }
    }
  });
});
