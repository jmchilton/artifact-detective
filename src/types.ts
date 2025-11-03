// Core artifact type definitions
export type ArtifactType =
  | 'playwright-json'
  | 'jest-json'
  | 'jest-html'
  | 'pytest-json'
  | 'pytest-html'
  | 'junit-xml'
  | 'checkstyle-xml'
  | 'spotbugs-xml'
  | 'eslint-json'
  | 'mypy-json'
  | 'eslint-txt'
  | 'tsc-txt'
  | 'ruff-txt'
  | 'mypy-txt'
  | 'flake8-txt'
  | 'cargo-test-txt'
  | 'clippy-json'
  | 'clippy-txt'
  | 'rustfmt-txt'
  | 'binary'
  | 'unknown';

export type OriginalFormat = 'json' | 'xml' | 'html' | 'txt' | 'binary';

// Detection result from type detector
export interface DetectionResult {
  detectedType: ArtifactType;
  originalFormat: OriginalFormat;
  isBinary: boolean;
}

// Catalog entry for an artifact
export interface CatalogEntry {
  artifactName: string;
  artifactId: number;
  runId: string;
  detectedType: ArtifactType;
  originalFormat: OriginalFormat;
  filePath: string;
  converted?: boolean;
  skipped?: boolean;
}

// Linter output detection result
export interface LinterOutput {
  detectedType: string;
  filePath: string;
}

// Linter pattern for detection
export interface LinterPattern {
  name: string;
  pattern: RegExp;
  description: string;
}

// Linter match result
export interface LinterMatch {
  linterType: string;
  content: string;
}

// Pytest-specific types
export interface PytestTest {
  nodeid: string;
  outcome: string;
  log?: string; // Captured output, stack traces, error messages
  extras?: Array<Record<string, unknown>>; // Media attachments (screenshots, videos, etc.)
  setup?: {
    outcome: string;
  };
  call?: {
    outcome: string;
    longrepr?: string;
  };
  teardown?: {
    outcome: string;
  };
}

export interface PytestReport {
  created: number;
  exitCode: number;
  root: string;
  environment?: Record<string, string>;
  tests: PytestTest[];
}

// Playwright-specific types
export interface PlaywrightTest {
  title: string;
  status: string;
  duration: number;
  errors?: string[];
  file?: string;
  line?: number;
  column?: number;
}

export interface PlaywrightSuite {
  title: string;
  tests: PlaywrightTest[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightReport {
  suites: PlaywrightSuite[];
  stats?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

// Checkstyle-specific types
export interface CheckstyleViolation {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}

export interface CheckstyleFile {
  name: string;
  violations: CheckstyleViolation[];
}

export interface CheckstyleReport {
  files: CheckstyleFile[];
  summary: {
    totalFiles: number;
    filesWithViolations: number;
    totalViolations: number;
    errors: number;
    warnings: number;
  };
}

// SpotBugs-specific types
export interface SpotBugsBug {
  type: string;
  priority: number;
  abbrev: string;
  category: string;
  instanceLine: number;
  instanceMessage: string;
  sourceFile: string;
  sourceLanguage?: string;
  classname?: string;
  methodname?: string;
}

export interface SpotBugsReport {
  bugs: SpotBugsBug[];
  summary: {
    totalBugs: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
}
