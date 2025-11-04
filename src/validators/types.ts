export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type ValidatorFunction = (content: string) => ValidationResult;

export type ExtractFunction = (artifactType: string, filePath: string) => string | null;

export type ExtractFromLogFunction = (logContents: string) => string | null;

export type NormalizeFunction = (filePath: string) => string | null;

export type ArtifactType = import('../types.js').ArtifactType;

export interface ArtifactTypeCapabilities {
  supportsAutoDetection: boolean;
  validator: ValidatorFunction | null;
  extract: ExtractFromLogFunction | null;
  normalize: NormalizeFunction | null;
  normalizesTo: ArtifactType | null;
  artificialType: boolean;
  isJSON: boolean;
}

/**
 * Helper function to check if content is valid JSON
 * @param content - The content to check
 * @returns true if content can be parsed as JSON, false otherwise
 */
export function isJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
