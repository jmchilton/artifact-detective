import { readFileSync } from 'fs';
import * as cheerio from 'cheerio';
import type { SpotBugsReport, SpotBugsBug } from '../../types.js';

export function extractSpotBugsXML(filePath: string): SpotBugsReport | null {
  try {
    const xml = readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(xml, { xmlMode: true });

    const report: SpotBugsReport = {
      bugs: [],
      summary: {
        totalBugs: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      },
    };

    // Parse each <BugInstance> element
    $('BugInstance').each((_index, elem) => {
      const type = $(elem).attr('type') || '';
      const priority = parseInt($(elem).attr('priority') || '3', 10);
      const abbrev = $(elem).attr('abbrev') || '';
      const category = $(elem).attr('category') || '';

      // Get the message from LongMessage or ShortMessage
      let instanceMessage = '';
      const longMsg = $(elem).find('LongMessage').first().text();
      const shortMsg = $(elem).find('ShortMessage').first().text();
      instanceMessage = longMsg || shortMsg || '';

      // Get source file from SourceLine element
      let sourceFile = '';
      let instanceLine = 0;
      const sourceLine = $(elem).find("SourceLine[primary='true']").first();
      if (sourceLine.length > 0) {
        sourceFile = sourceLine.attr('sourcefile') || '';
        const lineNum = sourceLine.attr('start');
        if (lineNum) {
          instanceLine = parseInt(lineNum, 10);
        }
      }

      // Get class and method names if available
      const classElem = $(elem).find("Class[primary='true']");
      const classname = classElem.attr('classname') || '';

      const methodElem = $(elem).find("Method[primary='true']");
      const methodname = methodElem.attr('name') || '';

      const bug: SpotBugsBug = {
        type,
        priority,
        abbrev,
        category,
        instanceLine,
        instanceMessage,
        sourceFile,
        classname: classname || undefined,
        methodname: methodname || undefined,
      };

      report.bugs.push(bug);
      report.summary.totalBugs++;

      // Count by priority
      if (priority === 1) {
        report.summary.highPriority++;
      } else if (priority === 2) {
        report.summary.mediumPriority++;
      } else if (priority >= 3) {
        report.summary.lowPriority++;
      }
    });

    return report;
  } catch (error) {
    throw new Error(
      `Failed to extract SpotBugs XML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
