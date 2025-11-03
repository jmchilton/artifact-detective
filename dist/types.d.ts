export type ArtifactType = "playwright-json" | "playwright-html" | "jest-json" | "jest-html" | "pytest-json" | "pytest-html" | "junit-xml" | "eslint-txt" | "tsc-txt" | "ruff-txt" | "mypy-txt" | "flake8-txt" | "cargo-test-txt" | "clippy-json" | "clippy-txt" | "rustfmt-txt" | "binary" | "unknown";
export type OriginalFormat = "json" | "xml" | "html" | "txt" | "binary";
export interface DetectionResult {
    detectedType: ArtifactType;
    originalFormat: OriginalFormat;
    isBinary: boolean;
}
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
export interface LinterOutput {
    detectedType: string;
    filePath: string;
}
export interface LinterPattern {
    name: string;
    pattern: RegExp;
    description: string;
}
export interface LinterMatch {
    linterType: string;
    content: string;
}
export interface PytestTest {
    nodeid: string;
    outcome: string;
    duration: number;
    log?: string;
    extras?: any[];
    setup?: {
        duration: number;
        outcome: string;
    };
    call?: {
        duration: number;
        outcome: string;
        longrepr?: string;
    };
    teardown?: {
        duration: number;
        outcome: string;
    };
}
export interface PytestReport {
    created: number;
    duration: number;
    exitCode: number;
    root: string;
    environment?: Record<string, string>;
    tests: PytestTest[];
}
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
//# sourceMappingURL=types.d.ts.map