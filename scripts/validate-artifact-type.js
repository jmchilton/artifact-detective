#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const artifactType = process.argv[2];

if (!artifactType) {
  console.error('Usage: node scripts/validate-artifact-type.js <artifact-type>');
  console.error('Example: node scripts/validate-artifact-type.js jest-txt');
  process.exit(1);
}

const projectRoot = join(fileURLToPath(import.meta.url), '..', '..');
let errors = [];
let warnings = [];

console.log(`\n✓ Validating artifact type: ${artifactType}\n`);

// 1. Check TypeScript types.ts
console.log('1. Checking src/types.ts...');
try {
  const typesContent = readFileSync(join(projectRoot, 'src/types.ts'), 'utf-8');
  if (typesContent.includes(`'${artifactType}'`)) {
    console.log(`   ✓ Found in ArtifactType union`);
  } else {
    errors.push(
      `Not found in src/types.ts ArtifactType union. Add: '${artifactType}' to the union in alphabetical order`,
    );
  }
} catch (e) {
  errors.push(`Cannot read src/types.ts: ${e.message}`);
}

// 2. Check validators registry
console.log('2. Checking src/validators/index.ts...');
try {
  const validatorsContent = readFileSync(join(projectRoot, 'src/validators/index.ts'), 'utf-8');
  if (validatorsContent.includes(`'${artifactType}':`)) {
    console.log(`   ✓ Found in ARTIFACT_TYPE_REGISTRY`);
  } else {
    errors.push(
      `Not found in src/validators/index.ts ARTIFACT_TYPE_REGISTRY. Add registry entry with extract/normalize/etc.`,
    );
  }
} catch (e) {
  errors.push(`Cannot read src/validators/index.ts: ${e.message}`);
}

// 3. Check artifact description
console.log('3. Checking src/docs/artifact-descriptions.yml...');
try {
  const descriptionsContent = readFileSync(
    join(projectRoot, 'src/docs/artifact-descriptions.yml'),
    'utf-8',
  );
  const descriptions = yaml.load(descriptionsContent);

  if (descriptions[artifactType]) {
    const desc = descriptions[artifactType];
    console.log(`   ✓ Found artifact description`);

    // Validate description quality
    if (desc.fileExtension) {
      console.log(`     - File extension: ${desc.fileExtension}`);
    } else {
      warnings.push(`Description missing fileExtension`);
    }

    if (desc.shortDescription) {
      console.log(`     - Short description: ${desc.shortDescription.substring(0, 50)}...`);
    } else {
      errors.push(`Description missing shortDescription`);
    }

    if (desc.parsingGuide && desc.parsingGuide.length > 100) {
      console.log(
        `     - Parsing guide: ${desc.parsingGuide.split('\n').length} lines`,
      );
    } else {
      warnings.push(`Description parsing guide is short or missing`);
    }
  } else {
    errors.push(
      `Not found in src/docs/artifact-descriptions.yml. Add description with fileExtension, shortDescription, and parsingGuide`,
    );
  }
} catch (e) {
  errors.push(`Cannot read src/docs/artifact-descriptions.yml: ${e.message}`);
}

// 4. Check manifest entry
console.log('4. Checking fixtures/extraction-tests/manifest.yml...');
try {
  const manifestPath = join(projectRoot, 'fixtures/extraction-tests/manifest.yml');
  if (existsSync(manifestPath)) {
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = yaml.load(manifestContent);

    const tests = manifest['extraction-tests'] || [];
    const testEntry = tests.find((t) => t['artifact-type'] === artifactType);

    if (testEntry) {
      console.log(`   ✓ Found test entry in manifest`);
      console.log(`     - Description: ${testEntry.description}`);
      console.log(`     - Log file: ${testEntry['log-file']}`);
      console.log(`     - Include patterns: ${testEntry.include?.length || 0}`);
      console.log(`     - Exclude patterns: ${testEntry.exclude?.length || 0}`);
    } else {
      warnings.push(
        `No test entry in fixtures/extraction-tests/manifest.yml. Add entry with log-file, include, and exclude patterns`,
      );
    }
  } else {
    warnings.push(`Cannot find fixtures/extraction-tests/manifest.yml`);
  }
} catch (e) {
  warnings.push(`Cannot validate manifest: ${e.message}`);
}

// 5. Check test fixture file
console.log('5. Checking fixtures/extraction-tests/<type>/logs.txt...');
const fixturePath = join(projectRoot, `fixtures/extraction-tests/${artifactType}/logs.txt`);
if (existsSync(fixturePath)) {
  const stats = statSync(fixturePath);
  console.log(`   ✓ Found fixture file`);
  console.log(`     - Size: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  warnings.push(
    `Fixture file not found at fixtures/extraction-tests/${artifactType}/logs.txt. Create with sample tool output`,
  );
}

// 6. Check extraction logic (if needed)
console.log('6. Checking src/parsers/linters/extractors.ts...');
try {
  const extractorsContent = readFileSync(
    join(projectRoot, 'src/parsers/linters/extractors.ts'),
    'utf-8',
  );

  // Extract tool name (e.g., jest from jest-txt)
  const toolName = artifactType.split('-')[0];
  if (extractorsContent.includes(`case '${toolName}':`)) {
    console.log(`   ✓ Found extraction case for '${toolName}'`);
  } else {
    warnings.push(
      `Extraction function may not be registered. If extracting, add case '${toolName}': to extractLinterOutput()`,
    );
  }
} catch (e) {
  warnings.push(`Cannot check extractors: ${e.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
if (errors.length === 0 && warnings.length === 0) {
  console.log(`✅ ${artifactType} is fully wired and ready!\n`);
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w}`);
    });
  }

  console.log('\nSee docs/guides/adding-artifact-types.md for detailed instructions.\n');

  if (errors.length > 0) {
    process.exit(1);
  }
}
