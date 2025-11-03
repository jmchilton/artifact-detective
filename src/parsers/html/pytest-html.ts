import { readFileSync } from "fs";
import * as cheerio from "cheerio";
import type { PytestTest, PytestReport } from "../../types.js";

export function extractPytestJSON(htmlFilePath: string): PytestReport | null {
  try {
    const html = readFileSync(htmlFilePath, "utf-8");
    const $ = cheerio.load(html);

    // Modern pytest-html (v3.x+) embeds data in data-jsonblob attribute
    const dataContainer = $("#data-container");
    if (dataContainer.length > 0) {
      const jsonBlob = dataContainer.attr("data-jsonblob");
      if (jsonBlob) {
        try {
          // Cheerio automatically decodes HTML entities
          const jsonData = JSON.parse(jsonBlob);
          return convertEmbeddedData(jsonData);
        } catch {
          // Not valid JSON, fall through
        }
      }
    }

    // No embedded data found
    return null;
  } catch (error) {
    throw new Error(
      `Failed to extract JSON from pytest HTML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

interface EmbeddedTestData {
  created?: number;
  root?: string;
  environment?: Record<string, string>;
  tests?: Record<string, unknown[]>;
}

function convertEmbeddedData(data: EmbeddedTestData): PytestReport {
  // Modern pytest-html embeds a full report structure
  const report: PytestReport = {
    created: data.created || Date.now(),
    duration: 0,
    exitCode: 0,
    root: data.root || "",
    environment: data.environment || {},
    tests: [],
  };

  // Convert test data
  // In modern pytest-html, tests is an object keyed by nodeid, not an array
  if (data.tests && typeof data.tests === "object") {
    let totalDuration = 0;
    let hasFailed = false;

    for (const [nodeid, testResults] of Object.entries(data.tests)) {
      // testResults is an array of result objects for this test
      const results = testResults as Array<Record<string, unknown>>;

      if (Array.isArray(results) && results.length > 0) {
        // Take the last result (most recent if retried)
        const lastResult = results[results.length - 1] as Record<string, unknown>;

        // Parse duration (format: "HH:MM:SS" or number)
        let duration = 0;
        if (typeof lastResult.duration === "string") {
          const parts = lastResult.duration.split(":").map(Number);
          if (parts.length === 3) {
            duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        } else if (typeof lastResult.duration === "number") {
          duration = lastResult.duration;
        }

        totalDuration += duration;

        // Map pytest result to outcome
        const resultValue = lastResult.result || lastResult.outcome || "";
        const result = String(resultValue).toLowerCase();
        const outcome = result.includes("pass")
          ? "passed"
          : result.includes("fail")
            ? "failed"
            : result.includes("skip")
              ? "skipped"
              : result.includes("error")
                ? "error"
                : result;

        if (outcome === "failed" || outcome === "error") {
          hasFailed = true;
        }

        const test: PytestTest = {
          nodeid,
          outcome,
          duration,
        };

        // Include log output (stack traces, captured stdout/stderr, etc.)
        if (lastResult.log && typeof lastResult.log === "string") {
          test.log = lastResult.log;
        }

        // Include extras (screenshots, videos, other media)
        if (
          lastResult.extras &&
          Array.isArray(lastResult.extras) &&
          lastResult.extras.length > 0
        ) {
          test.extras = lastResult.extras as Array<Record<string, unknown>>;
        }

        // Include setup/call/teardown details if present
        if (lastResult.setup && typeof lastResult.setup === "object") {
          test.setup = lastResult.setup as { duration: number; outcome: string };
        }
        if (lastResult.call && typeof lastResult.call === "object") {
          test.call = lastResult.call as { duration: number; outcome: string; longrepr?: string };
        }
        if (lastResult.teardown && typeof lastResult.teardown === "object") {
          test.teardown = lastResult.teardown as { duration: number; outcome: string };
        }

        report.tests.push(test);
      }
    }

    report.duration = totalDuration;
    report.exitCode = hasFailed ? 1 : 0;
  }

  return report;
}
