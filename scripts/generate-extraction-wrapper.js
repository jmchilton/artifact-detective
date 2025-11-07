#!/usr/bin/env node

/**
 * Generates code for the extraction wrapper pattern used in src/validators/index.ts
 *
 * Usage:
 *   node scripts/generate-extraction-wrapper.js <tool-name> [options]
 *
 * Examples:
 *   # Generate wrapper for extracting Jest output
 *   node scripts/generate-extraction-wrapper.js jest
 *
 *   # Generate with custom format
 *   node scripts/generate-extraction-wrapper.js eslint --format upper-camel
 *
 * This generates TypeScript code that can be copy-pasted into src/validators/index.ts
 */

const toolName = process.argv[2];

if (!toolName) {
  console.error('Usage: node scripts/generate-extraction-wrapper.js <tool-name>');
  console.error('Example: node scripts/generate-extraction-wrapper.js jest');
  process.exit(1);
}

// Convert tool name to function case (camelCase with 'extract' prefix + 'FromLog')
// jest -> extractJestFromLog
// eslint -> extractEslintFromLog
const camelCase = toolName
  .split('-')
  .map((word, index) => {
    if (index === 0) {
      return 'extract' + word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  })
  .join('') + 'FromLog';

const registryKey = `'${toolName}-txt'`;

console.log(`\n📋 Extraction Wrapper Template for: ${toolName}\n`);
console.log('='.repeat(70));

// Generate wrapper function
const wrapperCode = `/**
 * Extract ${toolName} output from CI logs
 */
function ${camelCase}(logContents: string, config?: ExtractorConfig): string | null {
  return extractLinterOutput('${toolName}', logContents, config);
}`;

console.log('\n1️⃣  ADD THIS FUNCTION in src/validators/index.ts (before ARTIFACT_TYPE_REGISTRY):');
console.log('');
console.log(wrapperCode);

// Generate registry entry
const registryEntry = `  ${registryKey}: {
    supportsAutoDetection: false,
    validator: null,
    extract: ${camelCase},
    normalize: null,
    normalizesTo: null,
    artificialType: false,
    isJSON: false,
  },`;

console.log('\n2️⃣  ADD THIS ENTRY in ARTIFACT_TYPE_REGISTRY in src/validators/index.ts:');
console.log('');
console.log(registryEntry);

console.log('\n3️⃣  THEN ADD THIS TO src/types.ts (in ArtifactType union, alphabetically):');
console.log('');
console.log(`  | '${toolName}-txt'`);

console.log('\n4️⃣  AND ADD DESCRIPTION TO src/docs/artifact-descriptions.yml:');
console.log('');
console.log(`${toolName}-txt:
  fileExtension: 'txt'
  shortDescription: '[Tool] test framework plain text output with test results'
  toolUrl: 'https://[tool-website]/'
  formatUrl: '[documentation-url]'
  parsingGuide: |
    [Detailed description of format, how to parse, patterns to look for]

    [Include examples of key patterns and what they indicate]

    Success indicators: [What indicates valid output]
    Common errors: [What often goes wrong]`);

console.log('\n5️⃣  FINALLY, create fixture in fixtures/extraction-tests/${toolName}-txt/logs.txt');
console.log('     with sample tool output and add to manifest.yml\n');

console.log('='.repeat(70));
console.log('📚 See docs/guides/adding-artifact-types.md for complete instructions\n');
