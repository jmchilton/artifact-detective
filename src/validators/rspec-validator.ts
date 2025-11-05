import type { ValidationResult } from './types.js';

export function validateRspecJSON(content: string): ValidationResult {
  try {
    const data = JSON.parse(content);

    // RSpec JSON must have examples array
    if (!data.examples || !Array.isArray(data.examples)) {
      return {
        valid: false,
        error: 'Missing or invalid examples array',
      };
    }

    // Should have summary object
    if (!data.summary || typeof data.summary !== 'object') {
      return {
        valid: false,
        error: 'Missing or invalid summary object',
      };
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export function validateRspecHTML(content: string): ValidationResult {
  if (!content.includes('RSpec')) {
    return {
      valid: false,
      error: 'Missing RSpec marker',
    };
  }

  return { valid: true };
}
