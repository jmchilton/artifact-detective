// Type detector
export { detectArtifactType } from './detectors/type-detector.js';

// JSON conversion utilities
export {
  isJSON,
  canConvertToJSON,
  convertToJSON,
  validate,
  extractArtifactFromLog,
  extractArtifactToJson,
} from './validators/index.js';

// Artifact descriptions and documentation
export { loadArtifactDescriptions, getArtifactDescription } from './docs/artifact-descriptions.js';

// HTML parsers
export { extractPytestJSON } from './parsers/html/pytest-html.js';
export { extractJestJSON } from './parsers/html/jest-html.js';

// XML parsers
export { extractCheckstyleXML } from './parsers/xml/checkstyle-parser.js';
export { extractSpotBugsXML } from './parsers/xml/spotbugs-parser.js';

// Linter extractors
export {
  extractLinterOutput,
  detectLinterType,
  LINTER_PATTERNS,
} from './parsers/linters/extractors.js';

export type { ExtractorConfig } from './parsers/linters/extractors.js';

// Types
export type {
  ArtifactType,
  OriginalFormat,
  DetectionResult,
  CatalogEntry,
  LinterOutput,
  LinterPattern,
  LinterMatch,
  PytestTest,
  PytestReport,
  PlaywrightTest,
  PlaywrightSuite,
  PlaywrightReport,
  CheckstyleViolation,
  CheckstyleFile,
  CheckstyleReport,
  SpotBugsBug,
  SpotBugsReport,
} from './types.js';

// Validator and description types
export type {
  ValidationResult,
  ArtifactDescription,
  ConversionResult,
  ArtifactJsonResult,
} from './validators/index.js';
