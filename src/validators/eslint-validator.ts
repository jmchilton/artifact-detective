import type { ValidationResult } from './types.js';

export function validateEslintJSON(content: string): ValidationResult {
  try {
    const data = JSON.parse(content);

    // ESLint JSON must be an array
    if (!Array.isArray(data)) {
      return {
        valid: false,
        error: 'Expected array of ESLint results',
      };
    }

    // Should have at least one result with filePath and messages
    if (data.length === 0) {
      return {
        valid: false,
        error: 'ESLint results array is empty',
      };
    }

    // Check first result has required fields
    const firstResult = data[0];
    if (typeof firstResult.filePath !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid filePath in first result',
      };
    }

    if (!Array.isArray(firstResult.messages)) {
      return {
        valid: false,
        error: 'Missing or invalid messages array in first result',
      };
    }

    // Validate message structure if any messages exist
    if (firstResult.messages.length > 0) {
      const firstMessage = firstResult.messages[0];
      if (typeof firstMessage.ruleId !== 'string') {
        return {
          valid: false,
          error: 'Missing or invalid ruleId in message',
        };
      }
      if (typeof firstMessage.message !== 'string') {
        return {
          valid: false,
          error: 'Missing or invalid message text',
        };
      }
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
