export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type ValidatorFunction = (content: string) => ValidationResult;

export interface ArtifactTypeCapabilities {
  supportsAutoDetection: boolean;
  validator: ValidatorFunction | null;
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
