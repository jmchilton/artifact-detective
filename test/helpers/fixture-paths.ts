import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// FIXTURES_DIR: from test/helpers/ go up to root, then into fixtures
export const FIXTURES_DIR = join(__dirname, '../../fixtures');

/**
 * Pattern 4: Centralized fixture path management
 * Eliminates repeated fixture path construction across test files
 * Provides type-safe access to commonly used fixtures
 */

export const FIXTURE_PATHS = {
  javascript: {
    eslintJson: 'generated/javascript/eslint-results.json',
    eslintTxt: 'generated/javascript/eslint-output.txt',
    jestHtml: 'generated/javascript/jest-report.html',
    jestJson: 'generated/javascript/jest-results.json',
  },
  python: {
    pytestJson: 'generated/python/pytest-results.json',
    pytestHtml: 'generated/python/pytest-report.html',
    mypyNdjson: 'generated/python/mypy-results.json',
    isortTxt: 'generated/python/isort-output.txt',
    blackTxt: 'generated/python/black-output.txt',
  },
  java: {
    checkstyleXml: 'generated/java/checkstyle-result.xml',
    spotbugsXml: 'generated/java/spotbugsXml.xml',
    junitXml: 'generated/java/TEST-com.example.CalculatorTest.xml',
    checkstyleSarif: 'generated/java/checkstyle-result.sarif',
    surefireHtml: 'generated/java/surefire-report.html',
  },
  go: {
    goTestJson: 'generated/go/go-test.json',
    golangciLintJson: 'generated/go/golangci-lint.json',
    gofmtTxt: 'generated/go/gofmt-output.txt',
  },
  rust: {
    clippyTxt: 'generated/rust/clippy-output.txt',
    rustfmtTxt: 'generated/rust/rustfmt-output.txt',
  },
} as const;

/**
 * Get full path to a fixture file
 */
export function getFixturePath(relativePath: string): string {
  return join(FIXTURES_DIR, relativePath);
}

/**
 * Typed fixture path accessors for better IDE support
 */
export const fixtures = {
  javascript: {
    eslintJson: () => getFixturePath(FIXTURE_PATHS.javascript.eslintJson),
    eslintTxt: () => getFixturePath(FIXTURE_PATHS.javascript.eslintTxt),
    jestHtml: () => getFixturePath(FIXTURE_PATHS.javascript.jestHtml),
    jestJson: () => getFixturePath(FIXTURE_PATHS.javascript.jestJson),
  },
  python: {
    pytestJson: () => getFixturePath(FIXTURE_PATHS.python.pytestJson),
    pytestHtml: () => getFixturePath(FIXTURE_PATHS.python.pytestHtml),
    mypyNdjson: () => getFixturePath(FIXTURE_PATHS.python.mypyNdjson),
    isortTxt: () => getFixturePath(FIXTURE_PATHS.python.isortTxt),
    blackTxt: () => getFixturePath(FIXTURE_PATHS.python.blackTxt),
  },
  java: {
    checkstyleXml: () => getFixturePath(FIXTURE_PATHS.java.checkstyleXml),
    spotbugsXml: () => getFixturePath(FIXTURE_PATHS.java.spotbugsXml),
    junitXml: () => getFixturePath(FIXTURE_PATHS.java.junitXml),
    checkstyleSarif: () => getFixturePath(FIXTURE_PATHS.java.checkstyleSarif),
    surefireHtml: () => getFixturePath(FIXTURE_PATHS.java.surefireHtml),
  },
  go: {
    goTestJson: () => getFixturePath(FIXTURE_PATHS.go.goTestJson),
    golangciLintJson: () => getFixturePath(FIXTURE_PATHS.go.golangciLintJson),
    gofmtTxt: () => getFixturePath(FIXTURE_PATHS.go.gofmtTxt),
  },
  rust: {
    clippyTxt: () => getFixturePath(FIXTURE_PATHS.rust.clippyTxt),
    rustfmtTxt: () => getFixturePath(FIXTURE_PATHS.rust.rustfmtTxt),
  },
} as const;
