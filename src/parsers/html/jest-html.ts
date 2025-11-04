import { readFileSync } from 'fs';
import * as cheerio from 'cheerio';

// Simplified jest JSON result format based on actual jest JSON output
interface JestAssertionResult {
  title: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number | null;
  failureMessages: string[];
  failureDetails: Record<string, unknown>[];
  ancestorTitles: string[];
  fullName: string;
  numPassingAsserts: number;
  location: null;
  invocations: number;
  retryReasons: string[];
}

interface JestTestResult {
  name: string;
  status: 'passed' | 'failed';
  startTime: number;
  endTime: number;
  message: string;
  assertionResults: JestAssertionResult[];
}

interface JestReport {
  numFailedTestSuites: number;
  numPassedTestSuites: number;
  numPendingTestSuites: number;
  numFailedTests: number;
  numPassedTests: number;
  numPendingTests: number;
  numTotalTests: number;
  numTotalTestSuites: number;
  startTime: number;
  success: boolean;
  testResults: JestTestResult[];
}

export function extractJestJSON(htmlFilePath: string): JestReport | null {
  try {
    const html = readFileSync(htmlFilePath, 'utf-8');
    const $ = cheerio.load(html);

    // Parse timestamp from #timestamp element
    const timestampStr = $('#timestamp').text();
    const startTime = parseJestHtmlTimestamp(timestampStr);

    // Parse summary information
    const suitesSummary = parseSuiteSummary($);
    const testsSummary = parseTestSummary($);

    // Parse test results from HTML structure
    const assertionResults = parseTestResults($);

    // Calculate counts
    const numPassedTests = testsSummary.passed;
    const numFailedTests = testsSummary.failed;
    const numPendingTests = testsSummary.pending;
    const numTotalTests = testsSummary.total;

    const numPassedTestSuites = suitesSummary.passed;
    const numFailedTestSuites = suitesSummary.failed;
    const numPendingTestSuites = suitesSummary.pending;
    const numTotalTestSuites = numPassedTestSuites + numFailedTestSuites + numPendingTestSuites;

    const success = numFailedTests === 0 && numFailedTestSuites === 0;

    // Get suite name (file path) from first suite container
    const suitePath = $('.suite-info .suite-path').first().text() || '/unknown';

    // Create test result object for the suite
    const testResult: JestTestResult = {
      name: suitePath,
      status: success ? 'passed' : 'failed',
      startTime,
      endTime: startTime + 1000, // Approximation based on jest-html not having precise timing
      message: '',
      assertionResults,
    };

    const report: JestReport = {
      numFailedTestSuites,
      numPassedTestSuites,
      numPendingTestSuites,
      numFailedTests,
      numPassedTests,
      numPendingTests,
      numTotalTests,
      numTotalTestSuites,
      startTime,
      success,
      testResults: [testResult],
    };

    return report;
  } catch (error) {
    throw new Error(
      `Failed to extract JSON from jest HTML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function parseJestHtmlTimestamp(timestampStr: string): number {
  // Format: "Started: 2025-11-04 15:57:50"
  const match = timestampStr.match(/Started:\s*(.+)/);
  if (match && match[1]) {
    const dateStr = match[1].trim();
    // Parse "2025-11-04 15:57:50" format
    const date = new Date(dateStr);
    return date.getTime();
  }
  // Fallback to current time
  return Date.now();
}

interface SuiteSummary {
  passed: number;
  failed: number;
  pending: number;
}

interface TestSummary {
  passed: number;
  failed: number;
  pending: number;
  total: number;
}

function parseSuiteSummary($: cheerio.CheerioAPI): SuiteSummary {
  const summary: SuiteSummary = {
    passed: 0,
    failed: 0,
    pending: 0,
  };

  // Parse suite summary counts
  $('#suite-summary div').each((_, el) => {
    const text = $(el).text();
    if (text.includes('passed')) {
      const match = text.match(/(\d+)/);
      summary.passed = match ? parseInt(match[1], 10) : 0;
    } else if (text.includes('failed')) {
      const match = text.match(/(\d+)/);
      summary.failed = match ? parseInt(match[1], 10) : 0;
    } else if (text.includes('pending')) {
      const match = text.match(/(\d+)/);
      summary.pending = match ? parseInt(match[1], 10) : 0;
    }
  });

  return summary;
}

function parseTestSummary($: cheerio.CheerioAPI): TestSummary {
  const summary: TestSummary = {
    passed: 0,
    failed: 0,
    pending: 0,
    total: 0,
  };

  // Parse test summary counts
  $('#test-summary div').each((_, el) => {
    const text = $(el).text();
    const match = text.match(/(\d+)/);
    const count = match ? parseInt(match[1], 10) : 0;

    if (text.includes('total') || text.includes('Tests')) {
      summary.total = count;
    } else if (text.includes('passed')) {
      summary.passed = count;
    } else if (text.includes('failed')) {
      summary.failed = count;
    } else if (text.includes('pending')) {
      summary.pending = count;
    }
  });

  return summary;
}

function parseTestResults($: cheerio.CheerioAPI): JestAssertionResult[] {
  const results: JestAssertionResult[] = [];

  $('.test-result').each((_, testEl) => {
    const $test = $(testEl);
    const statusClass = $test.attr('class') || '';
    const status = statusClass.includes('passed')
      ? 'passed'
      : statusClass.includes('failed')
        ? 'failed'
        : 'pending';

    const $testInfo = $test.find('.test-info');
    const suiteName = $testInfo.find('.test-suitename').text().trim();
    const testTitle = $testInfo.find('.test-title').text().trim();
    const durationStr = $testInfo.find('.test-duration').text().trim();

    // Parse duration (format: "0.007s" or "0s")
    const durationMatch = durationStr.match(/(\d+(?:\.\d+)?)/);
    const duration = durationMatch ? Math.round(parseFloat(durationMatch[1]) * 1000) : null;

    const result: JestAssertionResult = {
      title: testTitle,
      status,
      duration,
      failureMessages: [],
      failureDetails: [],
      ancestorTitles: suiteName ? [suiteName] : [],
      fullName: suiteName ? `${suiteName} ${testTitle}` : testTitle,
      numPassingAsserts: status === 'passed' ? 1 : 0,
      location: null,
      invocations: 1,
      retryReasons: [],
    };

    results.push(result);
  });

  return results;
}
