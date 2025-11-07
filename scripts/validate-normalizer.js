#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const sourceType = process.argv[2];
const targetType = process.argv[3];

if (!sourceType || !targetType) {
  console.error('Usage: node scripts/validate-normalizer.js <source-type> <target-type>');
  console.error('Example: node scripts/validate-normalizer.js jest-txt jest-json');
  process.exit(1);
}

const projectRoot = join(fileURLToPath(import.meta.url), '..', '..');
let errors = [];
let warnings = [];

console.log(`\n✓ Validating normalizer: ${sourceType} → ${targetType}\n`);

// 1. Check source type exists and has extractor
console.log('1. Checking source type...');
try {
  const typesContent = readFileSync(join(projectRoot, 'src/types.ts'), 'utf-8');
  if (typesContent.includes(`'${sourceType}'`)) {
    console.log(`   ✓ ${sourceType} found in ArtifactType union`);
  } else {
    errors.push(`${sourceType} not in ArtifactType union (src/types.ts)`);
  }
} catch (e) {
  errors.push(`Cannot read src/types.ts: ${e.message}`);
}

// 2. Check target type exists
console.log('2. Checking target type...');
try {
  const typesContent = readFileSync(join(projectRoot, 'src/types.ts'), 'utf-8');
  if (typesContent.includes(`'${targetType}'`)) {
    console.log(`   ✓ ${targetType} found in ArtifactType union`);
  } else {
    errors.push(`${targetType} not in ArtifactType union (src/types.ts)`);
  }
} catch (e) {
  errors.push(`Cannot read src/types.ts: ${e.message}`);
}

// 3. Check registry entries
console.log('3. Checking registry entries...');
try {
  const validatorsContent = readFileSync(join(projectRoot, 'src/validators/index.ts'), 'utf-8');

  if (validatorsContent.includes(`'${sourceType}':`)) {
    console.log(`   ✓ ${sourceType} in ARTIFACT_TYPE_REGISTRY`);

    // Check normalizer is set
    if (
      validatorsContent.includes(`'${sourceType}':`) &&
      validatorsContent.match(new RegExp(`'${sourceType}':.*?normalize:\\s*normalize\\w+`))
    ) {
      console.log(`     - Has normalizer function`);
    } else {
      warnings.push(`${sourceType} registry entry may not have normalizer function`);
    }

    // Check normalizesTo is set
    if (validatorsContent.match(new RegExp(`'${sourceType}':.*?normalizesTo:\\s*'${targetType}'`))) {
      console.log(`     - normalizesTo: '${targetType}'`);
    } else {
      errors.push(`${sourceType} normalizesTo not set to '${targetType}'`);
    }
  } else {
    errors.push(`${sourceType} not in ARTIFACT_TYPE_REGISTRY`);
  }

  if (validatorsContent.includes(`'${targetType}':`)) {
    console.log(`   ✓ ${targetType} in ARTIFACT_TYPE_REGISTRY`);
  } else {
    errors.push(`${targetType} not in ARTIFACT_TYPE_REGISTRY`);
  }
} catch (e) {
  errors.push(`Cannot read src/validators/index.ts: ${e.message}`);
}

// 4. Check descriptions
console.log('4. Checking artifact descriptions...');
try {
  const descriptionsContent = readFileSync(
    join(projectRoot, 'src/docs/artifact-descriptions.yml'),
    'utf-8',
  );
  const descriptions = yaml.load(descriptionsContent);

  if (descriptions[sourceType]) {
    console.log(`   ✓ ${sourceType} has description`);
  } else {
    warnings.push(`${sourceType} missing description in artifact-descriptions.yml`);
  }

  if (descriptions[targetType]) {
    console.log(`   ✓ ${targetType} has description`);
  } else {
    warnings.push(`${targetType} missing description in artifact-descriptions.yml`);
  }
} catch (e) {
  warnings.push(`Cannot validate descriptions: ${e.message}`);
}

// 5. Check fixtures
console.log('5. Checking test fixtures...');
const sourceFixturePath = join(projectRoot, `fixtures/extraction-tests/${sourceType}/logs.txt`);
const sourceFixtureExists = existsSync(sourceFixturePath);
if (sourceFixtureExists) {
  const stats = statSync(sourceFixturePath);
  console.log(`   ✓ Source fixture: ${sourceType}/logs.txt (${(stats.size / 1024).toFixed(1)} KB)`);
} else {
  warnings.push(`Source fixture not found at ${sourceType}/logs.txt`);
}

// Check if target fixture exists (optional)
const targetFixturePath = join(projectRoot, `fixtures/extraction-tests/${targetType}/logs.txt`);
if (existsSync(targetFixturePath)) {
  const stats = statSync(targetFixturePath);
  console.log(`   ✓ Target fixture: ${targetType}/logs.txt (${(stats.size / 1024).toFixed(1)} KB)`);
} else {
  console.log(`   ℹ Target fixture not found (optional - not needed for normalizer)`);
}

// Summary
console.log('\n' + '='.repeat(60));
if (errors.length === 0 && warnings.length === 0) {
  console.log(`✅ ${sourceType} → ${targetType} normalizer is fully configured!\n`);
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

  console.log('\nSee docs/guides/implementing-normalizers.md for detailed instructions.\n');

  if (errors.length > 0) {
    process.exit(1);
  }
}
