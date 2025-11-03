import { readFileSync } from "fs";
import * as cheerio from "cheerio";
import type { CheckstyleReport, CheckstyleViolation } from "../../types.js";

export function extractCheckstyleXML(filePath: string): CheckstyleReport | null {
  try {
    const xml = readFileSync(filePath, "utf-8");
    const $ = cheerio.load(xml, { xmlMode: true });

    const report: CheckstyleReport = {
      files: [],
      summary: {
        totalFiles: 0,
        filesWithViolations: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
      },
    };

    const filesWithViolations = new Set<string>();

    // Parse each <file> element
    $("file").each((_index, elem) => {
      const fileName = $(elem).attr("name");
      if (!fileName) return;

      const violations: CheckstyleViolation[] = [];

      // Parse each <error> element within the file
      $(elem)
        .find("error")
        .each((_errorIndex, errorElem) => {
          const line = parseInt($(errorElem).attr("line") || "0", 10);
          const column = parseInt($(errorElem).attr("column") || "0", 10);
          const severity = ($(errorElem).attr("severity") || "warning") as
            | "error"
            | "warning"
            | "info";
          const message = $(errorElem).attr("message") || "";
          const source = $(errorElem).attr("source") || "";

          violations.push({
            line,
            column,
            severity,
            message,
            source,
          });

          report.summary.totalViolations++;
          if (severity === "error") {
            report.summary.errors++;
          } else if (severity === "warning") {
            report.summary.warnings++;
          }
        });

      // Only add files that have violations
      if (violations.length > 0) {
        report.files.push({
          name: fileName,
          violations,
        });
        filesWithViolations.add(fileName);
      }
    });

    report.summary.totalFiles = filesWithViolations.size;
    report.summary.filesWithViolations = filesWithViolations.size;

    return report;
  } catch (error) {
    throw new Error(
      `Failed to extract Checkstyle XML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
