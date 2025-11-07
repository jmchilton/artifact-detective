import { extract as extractFromLog } from '../../validators/index.js';
import { readInput, writeOutput, exitError } from '../utils.js';
import type { ArtifactType } from '../../types.js';
import type { ExtractorConfig } from '../../parsers/linters/extractors.js';

interface ExtractOptions {
  output?: string;
  startMarker?: string;
  endMarker?: string;
}

/**
 * Core extraction logic - no I/O side effects
 */
export async function extractCore(
  type: string,
  logPath: string,
  markerOptions?: { startMarker?: string; endMarker?: string },
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  try {
    // Read log content from file or stdin
    const logContent = await readInput(logPath);

    // Build extractor config from options
    const config: ExtractorConfig = {};
    if (markerOptions?.startMarker) {
      try {
        config.startMarker = new RegExp(markerOptions.startMarker);
      } catch {
        return { success: false, error: `Invalid start marker regex: ${markerOptions.startMarker}` };
      }
    }
    if (markerOptions?.endMarker) {
      try {
        config.endMarker = new RegExp(markerOptions.endMarker);
      } catch {
        return { success: false, error: `Invalid end marker regex: ${markerOptions.endMarker}` };
      }
    }

    const result = extractFromLog(type as ArtifactType, logContent, { config });

    if (!result) {
      return { success: false, error: `No ${type} output found in log` };
    }

    return { success: true, data: result.content };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to extract artifact: ${message}` };
  }
}

/**
 * Extract artifact from CI log - CLI wrapper
 */
export async function extract(
  type: string,
  logPath: string,
  options: ExtractOptions,
): Promise<void> {
  const result = await extractCore(type, logPath, options);

  if (!result.success) {
    exitError(result.error);
    return;
  }

  const { data } = result as { success: true; data: string };
  writeOutput(data, options.output || null);
}
