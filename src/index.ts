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
  ARTIFACT_TYPE_REGISTRY,
} from './validators/index.js';

// Artifact descriptions and documentation
export { loadArtifactDescriptions, getArtifactDescription } from './docs/artifact-descriptions.js';

// Extractor configuration
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
  ArtifactTypeCapabilities,
  ValidatorFunction,
  ExtractFromLogFunction,
  NormalizeFunction,
} from './validators/index.js';
