import { extract as extractFromLog } from '../../validators/index.js';
import { readInput, writeOutput, exitError, formatJSON, writeError } from '../utils.js';
import type { ArtifactType } from '../../types.js';
import type { ExtractorConfig } from '../../parsers/linters/extractors.js';

interface ExtractOptions {
  output?: string;
  startMarker?: string;
  endMarker?: string;
  validate?: boolean;
  showDescription?: boolean;
  json?: boolean;
}

/**
 * Core extraction logic - no I/O side effects
 */
export interface ExtractCoreResult {
  content: string;
  artifact?: {
    fileExtension: string;
    isJSON: boolean;
    normalizedFrom?: string;
  };
  validationResult?: {
    valid: boolean;
    error?: string;
  };
}

export async function extractCore(
  type: string,
  logPath: string,
  markerOptions?: { startMarker?: string; endMarker?: string; validate?: boolean },
): Promise<{ success: true; data: ExtractCoreResult } | { success: false; error: string }> {
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

    const result = extractFromLog(type as ArtifactType, logContent, { config, validate: markerOptions?.validate });

    if (!result) {
      return { success: false, error: `No ${type} output found in log` };
    }

    const extractResult: ExtractCoreResult = {
      content: result.content,
      artifact: {
        fileExtension: result.artifact.fileExtension || 'unknown',
        isJSON: result.artifact.isJSON,
        normalizedFrom: result.artifact.normalizedFrom,
      },
    };

    if (result.validationResult) {
      extractResult.validationResult = {
        valid: result.validationResult.valid,
        error: result.validationResult.error,
      };
    }

    return { success: true, data: extractResult };
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

  const data = result.data;

  if (options.json) {
    const output: Record<string, unknown> = {
      content: data.content,
    };
    if (data.artifact) {
      output.artifact = data.artifact;
    }
    if (data.validationResult) {
      output.validationResult = data.validationResult;
    }
    writeOutput(formatJSON(output), options.output || null);
  } else {
    writeOutput(data.content, options.output || null);

    if (data.artifact && options.showDescription) {
      writeError('');
      writeError(`Extracted as: ${data.artifact.fileExtension}`);
      if (data.artifact.isJSON) {
        writeError(`Already in JSON format`);
      }
      if (data.artifact.normalizedFrom) {
        writeError(`Normalized from: ${data.artifact.normalizedFrom}`);
      }
    }

    if (data.validationResult) {
      writeError('');
      const validStatus = data.validationResult.valid ? 'Valid' : 'Invalid';
      writeError(`Validation: ${validStatus}`);
      if (!data.validationResult.valid && data.validationResult.error) {
        writeError(`  ${data.validationResult.error}`);
      }
    }
  }
}
