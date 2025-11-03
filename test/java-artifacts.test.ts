import { describe, it, expect } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { detectArtifactType } from "../src/detectors/type-detector.js";
import { validate, ARTIFACT_TYPE_REGISTRY } from "../src/validators/index.js";
import {
  extractCheckstyleXML,
  extractSpotBugsXML,
} from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, "../fixtures");

describe("Java Artifact Detection and Validation", () => {
  describe("Checkstyle XML", () => {
    const checkstylePath = join(
      FIXTURES_DIR,
      "generated/java/checkstyle-result.xml",
    );

    it("detects checkstyle-xml by content", () => {
      const result = detectArtifactType(checkstylePath);
      expect(result.detectedType).toBe("checkstyle-xml");
      expect(result.originalFormat).toBe("xml");
      expect(result.isBinary).toBe(false);
    });

    it("validates checkstyle XML content", () => {
      const content = readFileSync(checkstylePath, "utf-8");
      const result = validate("checkstyle-xml", content);
      expect(result.valid).toBe(true);
    });

    it("parses checkstyle XML and extracts violations", () => {
      const report = extractCheckstyleXML(checkstylePath);
      expect(report).not.toBeNull();
      expect(report!.files.length).toBeGreaterThan(0);
      expect(report!.files[0].violations.length).toBeGreaterThan(0);

      const file = report!.files[0];
      expect(file.name).toContain("Calculator.java");

      // Check violation structure
      const violation = file.violations[0];
      expect(violation.line).toBeGreaterThan(0);
      expect(violation.column).toBeGreaterThan(0);
      expect(["error", "warning", "info"]).toContain(violation.severity);
      expect(violation.message).toBeTruthy();
      expect(violation.source).toBeTruthy();
    });

    it("calculates checkstyle summary statistics", () => {
      const report = extractCheckstyleXML(checkstylePath);
      expect(report).not.toBeNull();
      expect(report!.summary.totalViolations).toBeGreaterThan(0);
      expect(report!.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(report!.summary.errors).toBeGreaterThanOrEqual(0);
      expect(report!.summary.totalFiles).toBeGreaterThan(0);
    });

    it("has registry entry with auto-detection support", () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY["checkstyle-xml"];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
    });
  });

  describe("SpotBugs XML", () => {
    const spotbugsPath = join(
      FIXTURES_DIR,
      "generated/java/spotbugsXml.xml",
    );

    it("detects spotbugs-xml by content", () => {
      const result = detectArtifactType(spotbugsPath);
      expect(result.detectedType).toBe("spotbugs-xml");
      expect(result.originalFormat).toBe("xml");
      expect(result.isBinary).toBe(false);
    });

    it("validates spotbugs XML content", () => {
      const content = readFileSync(spotbugsPath, "utf-8");
      const result = validate("spotbugs-xml", content);
      expect(result.valid).toBe(true);
    });

    it("parses spotbugs XML and extracts bugs", () => {
      const report = extractSpotBugsXML(spotbugsPath);
      expect(report).not.toBeNull();
      expect(report!.bugs.length).toBeGreaterThanOrEqual(0);

      if (report!.bugs.length > 0) {
        const bug = report!.bugs[0];
        expect(bug.type).toBeTruthy();
        expect(bug.priority).toBeGreaterThanOrEqual(1);
        expect(bug.category).toBeTruthy();
        expect(bug.abbrev).toBeTruthy();
        expect(bug.sourceFile).toBeTruthy();
      }
    });

    it("calculates spotbugs summary by priority", () => {
      const report = extractSpotBugsXML(spotbugsPath);
      expect(report).not.toBeNull();
      expect(report!.summary.totalBugs).toBe(report!.bugs.length);
      expect(report!.summary.highPriority).toBeGreaterThanOrEqual(0);
      expect(report!.summary.mediumPriority).toBeGreaterThanOrEqual(0);
      expect(report!.summary.lowPriority).toBeGreaterThanOrEqual(0);

      const prioritySum =
        report!.summary.highPriority +
        report!.summary.mediumPriority +
        report!.summary.lowPriority;
      expect(prioritySum).toBe(report!.summary.totalBugs);
    });

    it("has registry entry with auto-detection support", () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY["spotbugs-xml"];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(true);
      expect(capabilities.validator).toBeDefined();
    });
  });

  describe("JUnit XML (existing)", () => {
    const junitPath = join(
      FIXTURES_DIR,
      "generated/java/TEST-com.example.CalculatorTest.xml",
    );

    it("still detects junit-xml correctly", () => {
      const result = detectArtifactType(junitPath);
      expect(result.detectedType).toBe("junit-xml");
      expect(result.originalFormat).toBe("xml");
      expect(result.isBinary).toBe(false);
    });

    it("validates junit XML content", () => {
      const content = readFileSync(junitPath, "utf-8");
      const result = validate("junit-xml", content);
      expect(result.valid).toBe(true);
    });
  });

  describe("Mixed detection scenarios", () => {
    it("correctly distinguishes between XML artifact types", () => {
      const checkstyleResult = detectArtifactType(
        join(FIXTURES_DIR, "generated/java/checkstyle-result.xml"),
      );
      const spotbugsResult = detectArtifactType(
        join(FIXTURES_DIR, "generated/java/spotbugsXml.xml"),
      );
      const junitResult = detectArtifactType(
        join(FIXTURES_DIR, "generated/java/TEST-com.example.CalculatorTest.xml"),
      );

      expect(checkstyleResult.detectedType).toBe("checkstyle-xml");
      expect(spotbugsResult.detectedType).toBe("spotbugs-xml");
      expect(junitResult.detectedType).toBe("junit-xml");

      // All are XML format but different types
      expect(checkstyleResult.originalFormat).toBe("xml");
      expect(spotbugsResult.originalFormat).toBe("xml");
      expect(junitResult.originalFormat).toBe("xml");
    });
  });
});
