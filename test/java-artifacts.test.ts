import { describe, it, expect } from 'vitest';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';
import { extractCheckstyleXML } from '../src/parsers/xml/checkstyle-parser.js';
import { extractSpotBugsXML } from '../src/parsers/xml/spotbugs-parser.js';

describe('Java Artifact Detection and Validation', () => {
  const checkstylePath = fixtures.java.checkstyleXml();
  const spotbugsPath = fixtures.java.spotbugsXml();
  const junitPath = fixtures.java.junitXml();

  testArtifactType({
    artifactType: 'checkstyle-xml',
    fixturePath: checkstylePath,
    expectedFormat: 'xml',
    supportsAutoDetection: true,
  });

  describe('Checkstyle XML parsing', () => {
    it('parses checkstyle XML and extracts violations', () => {
      const report = extractCheckstyleXML(checkstylePath);
      expect(report).not.toBeNull();
      expect(report!.files.length).toBeGreaterThan(0);
      expect(report!.files[0].violations.length).toBeGreaterThan(0);

      const file = report!.files[0];
      expect(file.name).toContain('Calculator.java');

      // Check violation structure
      const violation = file.violations[0];
      expect(violation.line).toBeGreaterThan(0);
      expect(violation.column).toBeGreaterThan(0);
      expect(['error', 'warning', 'info']).toContain(violation.severity);
      expect(violation.message).toBeTruthy();
      expect(violation.source).toBeTruthy();
    });

    it('calculates checkstyle summary statistics', () => {
      const report = extractCheckstyleXML(checkstylePath);
      expect(report).not.toBeNull();
      expect(report!.summary.totalViolations).toBeGreaterThan(0);
      expect(report!.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(report!.summary.errors).toBeGreaterThanOrEqual(0);
      expect(report!.summary.totalFiles).toBeGreaterThan(0);
    });
  });

  testArtifactType({
    artifactType: 'spotbugs-xml',
    fixturePath: spotbugsPath,
    expectedFormat: 'xml',
    supportsAutoDetection: true,
  });

  describe('SpotBugs XML parsing', () => {
    it('parses spotbugs XML and extracts bugs', () => {
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

    it('calculates spotbugs summary by priority', () => {
      const report = extractSpotBugsXML(spotbugsPath);
      expect(report).not.toBeNull();
      expect(report!.summary.totalBugs).toBe(report!.bugs.length);
      expect(report!.summary.highPriority).toBeGreaterThanOrEqual(0);
      expect(report!.summary.mediumPriority).toBeGreaterThanOrEqual(0);
      expect(report!.summary.lowPriority).toBeGreaterThanOrEqual(0);

      const prioritySum =
        report!.summary.highPriority + report!.summary.mediumPriority + report!.summary.lowPriority;
      expect(prioritySum).toBe(report!.summary.totalBugs);
    });
  });

  testArtifactType({
    artifactType: 'junit-xml',
    fixturePath: junitPath,
    expectedFormat: 'xml',
    supportsAutoDetection: true,
  });

  describe('Mixed detection scenarios', () => {
    it('correctly distinguishes between XML artifact types', () => {
      const checkstyleResult = detectArtifactType(checkstylePath);
      const spotbugsResult = detectArtifactType(spotbugsPath);
      const junitResult = detectArtifactType(junitPath);

      expect(checkstyleResult.detectedType).toBe('checkstyle-xml');
      expect(spotbugsResult.detectedType).toBe('spotbugs-xml');
      expect(junitResult.detectedType).toBe('junit-xml');

      // All are XML format but different types
      expect(checkstyleResult.originalFormat).toBe('xml');
      expect(spotbugsResult.originalFormat).toBe('xml');
      expect(junitResult.originalFormat).toBe('xml');
    });
  });
});
