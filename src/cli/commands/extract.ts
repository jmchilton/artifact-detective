import { extractArtifactFromLog } from '../../validators/index.js';
import { readInput, writeOutput, exitError } from '../utils.js';
import type { ArtifactType } from '../../types.js';
import type { ExtractorConfig } from '../../parsers/linters/extractors.js';

interface ExtractOptions {
  output?: string;
  startMarker?: string;
  endMarker?: string;
}

/**
 * Extract artifact from CI log
 */
export async function extract(
  type: string,
  logPath: string,
  options: ExtractOptions,
): Promise<void> {
  try {
    // Read log content from file or stdin
    const logContent = await readInput(logPath);

    // Build extractor config from options
    const config: ExtractorConfig = {};
    if (options.startMarker) {
      try {
        config.startMarker = new RegExp(options.startMarker);
      } catch {
        exitError(`Invalid start marker regex: ${options.startMarker}`);
      }
    }
    if (options.endMarker) {
      try {
        config.endMarker = new RegExp(options.endMarker);
      } catch {
        exitError(`Invalid end marker regex: ${options.endMarker}`);
      }
    }

    const result = extractArtifactFromLog(type as ArtifactType, logContent, config);

    if (!result) {
      exitError(`No ${type} output found in log`);
    }

    writeOutput(result, options.output || null);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    exitError(`Failed to extract artifact: ${message}`);
  }
}
