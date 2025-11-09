export interface LinterMatch {
  linterType: string;
  startLine: number;
  endLine: number;
  content: string;
}

/**
 * Configuration for extracting a section from logs with start/end markers.
 * Useful for extracting structured tool output from CI logs.
 * This interface is designed to be reusable across all extraction methods.
 */
export interface ExtractorConfig {
  /** Regex to detect start of extraction section (matched against line) */
  startMarker?: RegExp;
  /** Regex to detect end of extraction section (matched against line) */
  endMarker?: RegExp;
  /** Whether to include the end marker line in output (default: true) */
  includeEndMarker?: boolean;
}

// Pattern to detect linter types from job names or log content
export const LINTER_PATTERNS = [
  { type: 'eslint', patterns: [/eslint/i, /npm run lint/i] },
  { type: 'prettier', patterns: [/prettier/i, /npm run format/i] },
  { type: 'ruff', patterns: [/ruff check/i, /ruff\s/i] },
  { type: 'flake8', patterns: [/flake8/i] },
  { type: 'isort', patterns: [/isort/i] },
  { type: 'black', patterns: [/black --check/i, /black\s/i] },
  { type: 'tsc', patterns: [/tsc --noEmit/i, /npm run type-check/i] },
  { type: 'mypy', patterns: [/mypy/i] },
  { type: 'pylint', patterns: [/pylint/i] },
];

export function detectLinterType(jobName: string, logContent: string): string | null {
  const combined = `${jobName}\n${logContent.slice(0, 1000)}`; // Check first 1000 chars

  for (const { type, patterns } of LINTER_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(combined))) {
      return type;
    }
  }

  return null;
}

/**
 * Extract linter output from log content using type-specific extractors.
 * @param linterType Artifact type (e.g., 'eslint-txt', 'mypy-txt')
 * @param logContent Full log content to extract from
 * @param config Optional extraction configuration (start/end markers, etc.)
 * @returns Extracted linter output or null if extraction failed
 */
export function extractLinterOutput(
  linterType: string,
  logContent: string,
  config?: ExtractorConfig,
): string | null {
  // Map artifact types to linter types (eslint-txt -> eslint, tsc-txt -> tsc)
  const normalizedType = linterType.replace(/-txt$/, '').replace(/-json$/, '');

  const lines = logContent.split('\n');

  switch (normalizedType) {
    case 'eslint':
      return extractESLintOutput(lines, config);

    case 'prettier':
      return extractPrettierOutput(lines);

    case 'ruff':
      return extractRuffOutput(lines);

    case 'flake8':
    case 'pylint':
      return extractPythonLinterOutput(lines, normalizedType);

    case 'tsc':
      return extractTSCOutput(lines);

    case 'isort':
    case 'black':
      return extractFormatterOutput(lines, normalizedType);

    case 'mypy':
      return extractMypyOutput(lines);

    case 'clippy':
      return extractClippyOutput(lines);

    case 'jest':
      return extractJestOutput(lines);

    case 'cargo-test':
    case 'rustfmt':
      // Raw output files, no extraction needed
      return lines.join('\n').trim();

    default:
      return null;
  }
}

function cleanLogLine(line: string): string {
  // Remove ISO timestamp prefix (e.g., "2025-10-24T05:43:16.9636538Z ")
  let cleaned = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*/, '');

  // Remove GitHub Actions markers (e.g., "##[error] " or "##[warning] ")
  cleaned = cleaned.replace(/^##\[(error|warning|notice)\]\s*/, '');

  // Trim leading/trailing whitespace
  return cleaned.trim();
}

/**
 * Generic section extractor for CI logs using start/end markers.
 * Scans through lines to find a section bounded by regex patterns,
 * cleans each line, and returns the extracted content.
 *
 * @param lines Array of log lines to search through
 * @param config Extraction configuration with optional start/end markers
 * @returns Extracted and cleaned content, or null if section not found
 */
function extractSectionFromLog(lines: string[], config?: ExtractorConfig): string | null {
  if (!config?.startMarker) {
    return null;
  }

  const outputLines: string[] = [];
  let inSection = false;

  for (const line of lines) {
    // Check for start marker
    if (!inSection && config.startMarker.test(line)) {
      inSection = true;
      continue; // Skip the start marker line itself
    }

    if (inSection) {
      // Check for end marker
      if (config.endMarker && config.endMarker.test(line)) {
        const cleaned = cleanLogLine(line);
        if (config.includeEndMarker !== false && cleaned) {
          outputLines.push(cleaned);
        }
        break; // Stop at end marker
      }

      // Capture non-empty lines
      if (line.trim()) {
        const cleaned = cleanLogLine(line);
        if (cleaned) {
          outputLines.push(cleaned);
        }
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractESLintOutput(lines: string[], config?: ExtractorConfig): string | null {
  // Default ESLint extraction markers
  const defaultConfig: ExtractorConfig = {
    startMarker: /eslint.*\.(js|ts|jsx|tsx)|npm run lint/i,
    endMarker: /^\d+ problems?/,
    includeEndMarker: true,
    ...config,
  };

  // Check if this looks like raw ESLint output or CI logs with embedded ESLint
  // Look for CI markers in first few lines
  const firstLines = lines.slice(0, 20).join('\n');
  const hasCIMarkers =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(firstLines) ||
    /##\[group\]/.test(firstLines) ||
    /##\[error\]/.test(firstLines) ||
    /##\[warning\]/.test(firstLines) ||
    /Current runner version|Runner Image|GITHUB_TOKEN/.test(firstLines);

  if (!hasCIMarkers) {
    // Raw ESLint output - just clean and return
    return lines
      .map(cleanLogLine)
      .filter((line) => line.trim())
      .join('\n')
      .trim();
  }

  // Extract from CI logs using generic section extractor
  return extractSectionFromLog(lines, defaultConfig);
}

function extractPrettierOutput(lines: string[]): string | null {
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes('prettier') || line.includes('npm run format')) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // Prettier typically outputs file paths that need formatting
      if (line.match(/^[a-zA-Z0-9_\-/.]+\.(js|ts|jsx|tsx|json|css|md)/)) {
        outputLines.push(line);
      }

      // End marker
      if (line.match(/^##\[/)) {
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

/**
 * Extract ruff output from CI logs, cleaning timestamps and CI markers.
 * Handles both raw ruff output and ruff embedded in larger CI logs.
 */
function extractRuffOutput(lines: string[]): string | null {
  // If this looks like raw ruff output (file:line:col: CODE message pattern),
  // return as-is without expecting CI log structure
  const hasRuffPattern = lines.some((line) => /^[a-zA-Z0-9_\-/.]+\.py:\d+:\d+:/.test(line));

  if (hasRuffPattern) {
    return lines.join('\n').trim();
  }

  // Extract from CI logs with timestamps and CI markers
  const outputLines: string[] = [];
  let inRuffOutput = false;

  for (const line of lines) {
    const cleaned = cleanLogLine(line);

    // Detect start: look for "ruff check" or "ruff " command
    if (!inRuffOutput && (line.includes('ruff check') || (line.includes('+ ruff') && !line.includes('ruff')))) {
      inRuffOutput = true;
      continue;
    }

    if (inRuffOutput) {
      // End markers: GitHub Actions error marker or another tool starting
      if (cleaned.match(/^##\[error\]/) || line.includes('+ mypy') || line.includes('+ pytest')) {
        break;
      }

      // Capture lines that are part of ruff output
      if (cleaned.match(/^[a-zA-Z0-9_\-/.]+\.py:\d+:\d+:/)) {
        // Error line
        outputLines.push(cleaned);
      } else if (cleaned.match(/^Found \d+ error/i)) {
        // Summary line
        outputLines.push(cleaned);
        break;
      } else if (cleaned.trim() && outputLines.length > 0) {
        // Continuation of error (context, help text, etc.)
        outputLines.push(cleaned);
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractPythonLinterOutput(lines: string[], linterType: string): string | null {
  // If this looks like raw linter output (not embedded in logs), return as-is
  const hasLinterPattern = lines.some((line) => /^[a-zA-Z0-9_\-/.]+\.py:\d+/.test(line));

  if (hasLinterPattern) {
    return lines.join('\n').trim();
  }

  // Otherwise, extract from CI logs
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes(linterType)) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // End markers
      if (line.match(/^##\[/) || line.match(/^\d+ error/i)) {
        outputLines.push(line);
        break;
      }

      // Capture error lines (usually start with file path)
      if (line.match(/^[a-zA-Z0-9_\-/.]+\.py:\d+/)) {
        outputLines.push(line);
      } else if (line.trim() && outputLines.length > 0) {
        // Continuation of previous error
        outputLines.push(line);
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractTSCOutput(lines: string[]): string | null {
  // If this looks like raw TSC output (not embedded in logs), return as-is
  const hasTSCPattern = lines.some((line) => /\.tsx?\(\d+,\d+\):\s+error\s+TS\d+/.test(line));

  if (hasTSCPattern) {
    return lines.join('\n').trim();
  }

  // Otherwise, extract from CI logs
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes('tsc ') || line.includes('type-check')) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // TypeScript errors usually start with file path
      if (line.match(/^[a-zA-Z0-9_\-/.]+\.tsx?:\d+:\d+/)) {
        outputLines.push(line);
      } else if (line.match(/error TS\d+:/)) {
        outputLines.push(line);
      } else if (line.match(/Found \d+ error/)) {
        outputLines.push(line);
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractFormatterOutput(lines: string[], formatterType: string): string | null {
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes(formatterType)) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // Black/isort usually output "would reformat" or file names
      if (line.match(/would reformat/i) || line.match(/^[a-zA-Z0-9_\-/.]+\.py/)) {
        outputLines.push(line);
      }

      if (line.match(/^##\[/)) {
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractMypyOutput(lines: string[]): string | null {
  // If this looks like raw mypy output (not embedded in logs), return as-is
  const hasMypyPattern = lines.some((line) =>
    /^[a-zA-Z0-9_\-/.]+\.py:\d+:\s*(error|warning|note):/.test(line),
  );

  if (hasMypyPattern) {
    return lines.join('\n').trim();
  }

  // Otherwise, extract from CI logs
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes('mypy')) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // Mypy errors: file.py:line: error:
      if (line.match(/^[a-zA-Z0-9_\-/.]+\.py:\d+:\s*(error|warning):/)) {
        outputLines.push(line);
      } else if (line.match(/Found \d+ error/)) {
        outputLines.push(line);
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractClippyOutput(lines: string[]): string | null {
  // If this looks like raw clippy output (not embedded in logs), return as-is
  const hasClippyPattern = lines.some(
    (line) => /^(warning|error):\s/.test(line) || /-->\s+\S+\.rs:\d+:\d+/.test(line),
  );

  if (hasClippyPattern) {
    return lines.join('\n').trim();
  }

  // Otherwise, extract from CI logs
  const outputLines: string[] = [];
  let inOutput = false;

  for (const line of lines) {
    if (line.includes('clippy')) {
      inOutput = true;
      continue;
    }

    if (inOutput) {
      // Clippy warnings start with "warning:" or "error:"
      if (line.match(/^(warning|error):/) || line.match(/-->\s+\S+\.rs:\d+:\d+/)) {
        outputLines.push(line);
      } else if (line.match(/\d+\s+warnings?\s+emitted/)) {
        outputLines.push(line);
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

function extractJestOutput(lines: string[]): string | null {
  const outputLines: string[] = [];
  let inJestOutput = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleaned = cleanLogLine(line);

    // Detect start of Jest output - look for jest command
    if (!inJestOutput && line.includes('$ jest')) {
      inJestOutput = true;
      continue;
    }

    if (inJestOutput) {
      // Jest test result lines start with PASS/FAIL
      if (cleaned.match(/^\s*(PASS|FAIL)\s+/)) {
        outputLines.push(cleaned);
      }
      // Capture test summary lines
      else if (
        cleaned.match(/^Test Suites:/) ||
        cleaned.match(/^Tests:/) ||
        cleaned.match(/^Snapshots:/) ||
        cleaned.match(/^Time:/) ||
        cleaned.match(/Summary of all failing tests/) ||
        cleaned.match(/^FAIL\s+/) ||
        cleaned.match(/^\s+●/) ||
        cleaned.match(/^\s+expect\(/) ||
        cleaned.match(/Expected:|Received:/) ||
        cleaned.match(/at Object\.<anonymous>/) ||
        cleaned.match(/Ran all test suites/)
      ) {
        if (cleaned) {
          outputLines.push(cleaned);
        }
      }
      // End of Jest output
      else if (
        line.match(/^##\[/) ||
        cleaned.match(/error Command failed/) ||
        cleaned.match(/Visit https:\/\//)
      ) {
        // Add final summary lines if present
        if (cleaned.match(/error Command failed/)) {
          outputLines.push(cleaned);
        }
        break;
      }
    }
  }

  return outputLines.length > 0 ? outputLines.join('\n') : null;
}

/**
 * Convert mypy text output to mypy-ndjson NDJSON format
 * Parses lines like: src/sample.py:8: error: message [code]
 * And converts to JSON objects with: file, line, column, message, code, severity, hint
 */
export function convertMypyTextToNDJSON(textOutput: string): string | null {
  const lines = textOutput.trim().split('\n');
  const jsonLines: string[] = [];
  let currentError: {
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: string;
    hint: string | null;
  } | null = null;

  // Pattern: file:line: severity: message [code]
  const errorPattern =
    /^([^:]+):(\d+):(?:(\d+):)?\s+(error|warning|note):\s+(.+?)(?:\s+\[([^\]]+)\])?$/;

  for (const line of lines) {
    const match = line.match(errorPattern);

    if (match) {
      const [, file, lineStr, columnStr, severity, message, code] = match;
      const column = columnStr ? parseInt(columnStr, 10) : 0;

      // If this is a note following an error, attach it as a hint
      if (severity === 'note' && currentError) {
        currentError.hint = message;
      } else {
        // Save previous error if exists
        if (
          currentError &&
          (currentError.severity === 'error' || currentError.severity === 'warning')
        ) {
          jsonLines.push(JSON.stringify(currentError));
        }

        // Start new error/warning
        currentError = {
          file,
          line: parseInt(lineStr, 10),
          column,
          message,
          code: code || '',
          severity,
          hint: null,
        };
      }
    }
  }

  // Don't forget the last error
  if (currentError && (currentError.severity === 'error' || currentError.severity === 'warning')) {
    jsonLines.push(JSON.stringify(currentError));
  }

  return jsonLines.length > 0 ? jsonLines.join('\n') : null;
}
