import type { ValidationResult } from './types.js';

/**
 * Validate black code formatter output format
 * black produces specific completion messages that identify it clearly
 * Format:
 * - "All done! ✨ 🍰 ✨" message (distinctive with emojis - only black uses this)
 * - Optional: "would reformat <file>" or "would be left unchanged" messages
 * - Key marker: Must have "All done!" with emojis OR "would reformat"/"would be left unchanged"
 */
export function validateBlackOutput(content: string): ValidationResult {
  // Black has very distinctive "All done! ✨ 🍰 ✨" message with emojis
  // This is the strongest indicator and differentiates from other formatters
  const hasBlackCompletionMessage = /All done!.*✨/.test(content);

  // Also check for black-specific status messages that appear in output
  const hasBlackStatusMessages = /would reformat|would be left unchanged/.test(content);

  // Must have at least one black-specific marker
  if (hasBlackCompletionMessage || hasBlackStatusMessages) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Does not match black formatter output format',
  };
}
