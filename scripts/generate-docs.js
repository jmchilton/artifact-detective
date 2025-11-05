#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

function parseYAML(content) {
  const raw = yaml.load(content);
  return raw;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const docsDir = join(rootDir, 'docs');

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function readYAML(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return parseYAML(content);
}

function writeMarkdown(filePath, content) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Generated ${filePath}`);
}

// Generate artifact types table
function generateArtifactTypesREADME() {
  const descriptions = readYAML(join(rootDir, 'src/docs/artifact-descriptions.yml'));
  
  // Get artifact type registry from validators/index.ts by parsing it
  const validatorsContent = readFileSync(join(rootDir, 'src/validators/index.ts'), 'utf-8');
  
  // Extract artifact types from the registry
  const registryMatch = validatorsContent.match(/export const ARTIFACT_TYPE_REGISTRY[^}]*?};/s);
  const registryContent = registryMatch ? registryMatch[0] : '';
  
  // Parse type names from the registry
  const typeMatches = registryContent.match(/(\w+-\w+(?:-\w+)?)\s*:/g) || [];
  const artifactTypes = [...new Set(typeMatches.map(m => m.slice(0, -1).trim()))];

  let markdown = `# Artifact Types Reference

Complete reference of all artifact types supported by artifact-detective, organized by category.

## Overview

This documentation covers:
- **Test Frameworks**: Jest, Playwright, Pytest, JUnit, Surefire, Go Test, RSpec
- **Linters**: ESLint, TypeScript Compiler, Mypy, Ruff, Flake8, Clippy, Golangci-lint, Rubocop, Brakeman
- **Formatters**: Rustfmt, Gofmt, Isort, Black, Checkstyle, SpotBugs

## Complete Artifact Types Table

| Type | Description | Auto-Detect | Extract | Normalize | Format | Tool |
|------|-------------|-------------|---------|-----------|--------|------|
`;

  // Group types by category for better organization
  const categories = {
    'Test Frameworks': ['jest-json', 'jest-html', 'playwright-json', 'pytest-json', 'pytest-html', 'junit-xml', 'surefire-html', 'go-test-ndjson', 'cargo-test-txt', 'rspec-json', 'rspec-html'],
    'Linters': ['eslint-txt', 'eslint-json', 'tsc-txt', 'mypy-txt', 'mypy-ndjson', 'ruff-txt', 'flake8-txt', 'clippy-txt', 'clippy-ndjson', 'golangci-lint-json', 'checkstyle-xml', 'checkstyle-sarif-json', 'spotbugs-xml', 'rubocop-json', 'brakeman-json'],
    'Formatters': ['rustfmt-txt', 'gofmt-txt', 'isort-txt', 'black-txt'],
  };

  for (const [category, types] of Object.entries(categories)) {
    markdown += `\n### ${category}\n\n`;
    
    for (const type of types) {
      if (!descriptions[type]) continue;
      
      const desc = descriptions[type];
      const shortDesc = desc.shortDescription || 'No description';
      const toolUrl = desc.toolUrl || '#';
      const toolName = extractToolName(type);
      
      // Determine capabilities from type name and format
      const format = getFormatFromType(type);
      const autoDetect = '✓'; // Most types support auto-detection
      const extract = shouldExtract(type) ? '✓' : '—';
      const normalize = shouldNormalize(type) ? '✓' : '—';
      
      markdown += `| [\`${type}\`](#${type}) | ${shortDesc} | ${autoDetect} | ${extract} | ${normalize} | ${format} | [${toolName}](${toolUrl}) |\n`;
    }
  }

  markdown += `\n## Detailed Type Documentation

For detailed information on each artifact type, including parsing guides and examples, see the [specific category pages](artifact-types/test-frameworks.md).\n`;

  writeMarkdown(join(docsDir, 'artifact-types', 'README.md'), markdown);
}

function getFormatFromType(type) {
  if (type.includes('json') || type.includes('ndjson')) return 'json';
  if (type.includes('xml')) return 'xml';
  if (type.includes('html')) return 'html';
  if (type.includes('txt')) return 'txt';
  if (type.includes('sarif')) return 'json';
  return 'other';
}

function shouldExtract(type) {
  // Types that have extraction capabilities
  const extractable = ['eslint-txt', 'tsc-txt', 'mypy-txt', 'ruff-txt', 'flake8-txt', 'clippy-txt', 'rustfmt-txt', 'gofmt-txt', 'isort-txt', 'black-txt'];
  return extractable.includes(type);
}

function shouldNormalize(type) {
  // Types that can be normalized to JSON
  const normalizable = ['pytest-html', 'jest-html', 'rspec-html', 'mypy-txt', 'clippy-txt', 'checkstyle-xml', 'checkstyle-sarif-json'];
  return normalizable.includes(type);
}

function extractToolName(type) {
  const parts = type.split('-');
  if (type.includes('golang')) return 'Golangci-lint';
  if (type.includes('spotbugs')) return 'SpotBugs';
  if (type.includes('brakeman')) return 'Brakeman';
  if (type.includes('rubocop')) return 'Rubocop';
  if (type.includes('rspec')) return 'RSpec';
  if (type.includes('eslint')) return 'ESLint';
  if (type.includes('pytest')) return 'Pytest';
  if (type.includes('jest')) return 'Jest';
  if (type.includes('playwright')) return 'Playwright';
  if (type.includes('junit')) return 'JUnit';
  if (type.includes('surefire')) return 'Surefire';
  if (type.includes('cargo')) return 'Cargo';
  if (type.includes('clippy')) return 'Clippy';
  if (type.includes('rustfmt')) return 'Rustfmt';
  if (type.includes('gofmt')) return 'Gofmt';
  if (type.includes('go-test')) return 'Go Test';
  if (type.includes('tsc')) return 'TypeScript';
  if (type.includes('mypy')) return 'Mypy';
  if (type.includes('ruff')) return 'Ruff';
  if (type.includes('flake8')) return 'Flake8';
  if (type.includes('isort')) return 'Isort';
  if (type.includes('black')) return 'Black';
  if (type.includes('checkstyle')) return 'Checkstyle';
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

// Generate fixture pages
function generateFixturePages() {
  const fixtureDir = join(rootDir, 'fixtures/sample-projects');
  const languages = ['javascript', 'python', 'rust', 'go', 'java', 'ruby'];
  
  for (const lang of languages) {
    const manifestPath = join(fixtureDir, lang, 'manifest.yml');
    if (!existsSync(manifestPath)) continue;
    
    const manifest = readYAML(manifestPath);
    
    let markdown = `# ${lang.charAt(0).toUpperCase() + lang.slice(1)} Fixtures\n\n`;
    markdown += `**Language**: ${manifest.language}\n`;
    
    const versionKey = `${manifest.language}_version`;
    if (manifest[versionKey]) {
      markdown += `**Version**: ${manifest[versionKey]}\n\n`;
    }
    
    markdown += `## Tools\n\n| Tool | Version |\n|------|----------|\n`;
    for (const tool of manifest.tools || []) {
      markdown += `| ${tool.name} | ${tool.version} |\n`;
    }
    
    markdown += `\n## Generated Artifacts\n\n| File | Type | Format | Description |\n|------|------|--------|----------|\n`;
    for (const artifact of manifest.artifacts || []) {
      markdown += `| \`${artifact.file}\` | \`${artifact.type}\` | ${artifact.format} | ${artifact.description || 'N/A'} |\n`;
    }
    
    if (manifest.commands) {
      markdown += `\n## Generation Commands\n\n\`\`\`bash\n${manifest.commands.generate}\n\`\`\`\n`;
      markdown += `\n## Cleanup Commands\n\n\`\`\`bash\n${manifest.commands.clean}\n\`\`\`\n`;
    }
    
    writeMarkdown(join(docsDir, 'fixtures', `${lang}.md`), markdown);
  }
}

// Generate fixtures overview
function generateFixturesREADME() {
  const markdown = `# Fixtures Documentation

Sample project fixtures for testing artifact-detective with real-world artifact examples.

## Available Fixtures

- [JavaScript](fixtures/javascript.md) - Jest, Playwright, ESLint fixtures
- [Python](fixtures/python.md) - Pytest, Mypy, Ruff, Isort, Black fixtures
- [Rust](fixtures/rust.md) - Cargo, Clippy, Rustfmt fixtures
- [Go](fixtures/go.md) - Go test, Golangci-lint, Gofmt fixtures
- [Java](fixtures/java.md) - JUnit, Checkstyle, SpotBugs, Surefire fixtures
- [Ruby](fixtures/ruby.md) - RSpec fixtures

## Using Fixtures

Each fixture directory contains:
1. **manifest.yml** - Metadata about the project and generated artifacts
2. **Artifact files** - Real output from various tools

These fixtures are used for:
- Testing artifact detection accuracy
- Validating parsers against real-world output
- Demonstrating CLI usage
- Verifying extraction and normalization capabilities
`;
  
  writeMarkdown(join(docsDir, 'fixtures', 'README.md'), markdown);
}

// Generate CLI reference
function generateCLIPages() {
  const commands = [
    {
      name: 'detect',
      title: 'Detect Command',
      description: 'Detect artifact type from file',
      usage: 'artifact-detective detect <file> [options]',
      args: [
        {
          name: 'file',
          description: 'Path to artifact file (use "-" for stdin)',
          required: true,
        }
      ],
      options: [
        {
          name: '--json',
          description: 'Output result as JSON',
        }
      ],
      examples: [
        {
          desc: 'Detect artifact from file',
          cmd: 'artifact-detective detect results.json',
        },
        {
          desc: 'Detect from stdin and output JSON',
          cmd: 'cat results.json | artifact-detective detect - --json',
        }
      ]
    },
    {
      name: 'validate',
      title: 'Validate Command',
      description: 'Validate artifact matches expected type',
      usage: 'artifact-detective validate <type> <file> [options]',
      args: [
        {
          name: 'type',
          description: 'Expected artifact type',
          required: true,
        },
        {
          name: 'file',
          description: 'Path to artifact file (use "-" for stdin)',
          required: true,
        }
      ],
      options: [
        {
          name: '--json',
          description: 'Output result as JSON',
        },
        {
          name: '--show-description',
          description: 'Include parsing guide in output',
        }
      ],
      examples: [
        {
          desc: 'Validate jest-json artifact',
          cmd: 'artifact-detective validate jest-json results.json',
        },
        {
          desc: 'Validate and show description',
          cmd: 'artifact-detective validate jest-json results.json --show-description',
        }
      ]
    },
    {
      name: 'extract',
      title: 'Extract Command',
      description: 'Extract artifact from CI log',
      usage: 'artifact-detective extract <type> <log> [options]',
      args: [
        {
          name: 'type',
          description: 'Artifact type to extract (e.g., eslint-txt)',
          required: true,
        },
        {
          name: 'log',
          description: 'Path to CI log file (use "-" for stdin)',
          required: true,
        }
      ],
      options: [
        {
          name: '--output <file>',
          description: 'Write extracted artifact to file instead of stdout',
        },
        {
          name: '--start-marker <regex>',
          description: 'Custom regex to detect start of extraction section',
        },
        {
          name: '--end-marker <regex>',
          description: 'Custom regex to detect end of extraction section',
        }
      ],
      examples: [
        {
          desc: 'Extract ESLint output from CI log',
          cmd: 'artifact-detective extract eslint-txt build.log',
        },
        {
          desc: 'Extract with custom markers',
          cmd: 'artifact-detective extract eslint-txt log.txt --start-marker "^LINTER OUTPUT" --end-marker "^END"',
        }
      ]
    },
    {
      name: 'normalize',
      title: 'Normalize Command',
      description: 'Convert artifact to JSON format',
      usage: 'artifact-detective normalize <file> [options]',
      args: [
        {
          name: 'file',
          description: 'Path to artifact file (use "-" for stdin)',
          required: true,
        }
      ],
      options: [
        {
          name: '--type <type>',
          description: 'Override auto-detected artifact type',
        },
        {
          name: '--output <file>',
          description: 'Write JSON to file instead of stdout',
        },
        {
          name: '--show-description',
          description: 'Include parsing guide in output',
        }
      ],
      examples: [
        {
          desc: 'Auto-detect and normalize to JSON',
          cmd: 'artifact-detective normalize pytest-report.html',
        },
        {
          desc: 'Normalize with explicit type',
          cmd: 'artifact-detective normalize report.html --type pytest-html --output report.json',
        }
      ]
    }
  ];

  for (const cmd of commands) {
    let markdown = `# ${cmd.title}\n\n${cmd.description}\n\n`;
    markdown += `## Usage\n\n\`\`\`\n${cmd.usage}\n\`\`\`\n\n`;
    
    markdown += `## Arguments\n\n`;
    for (const arg of cmd.args) {
      markdown += `- **${arg.name}** ${arg.required ? '(required)' : '(optional)'}: ${arg.description}\n`;
    }
    
    markdown += `\n## Options\n\n`;
    for (const opt of cmd.options) {
      markdown += `- **${opt.name}**: ${opt.description}\n`;
    }
    
    markdown += `\n## Examples\n\n`;
    for (const ex of cmd.examples) {
      markdown += `### ${ex.desc}\n\n\`\`\`bash\n${ex.cmd}\n\`\`\`\n\n`;
    }
    
    writeMarkdown(join(docsDir, 'cli', `${cmd.name}.md`), markdown);
  }
}

// Generate CLI overview
function generateCLIREADME() {
  const markdown = `# CLI Reference

Complete reference for artifact-detective command-line interface.

## Available Commands

- [\`detect\`](cli/detect.md) - Detect artifact type from file
- [\`validate\`](cli/validate.md) - Validate artifact matches expected type
- [\`extract\`](cli/extract.md) - Extract artifact from CI log
- [\`normalize\`](cli/normalize.md) - Convert artifact to JSON format

## Global Options

- **-v, --version** - Show version number
- **-h, --help** - Show help message

## Quick Start

\`\`\`bash
# Detect artifact type
artifact-detective detect results.json

# Validate artifact
artifact-detective validate jest-json results.json

# Extract from CI log
artifact-detective extract eslint-txt build.log

# Convert to JSON
artifact-detective normalize pytest-report.html
\`\`\`

## More Information

- Use \`artifact-detective --help\` for general help
- Use \`artifact-detective <command> --help\` for command-specific help
- See [Artifact Types](../artifact-types/) for supported types
`;
  
  writeMarkdown(join(docsDir, 'cli', 'README.md'), markdown);
}

// Main execution
console.log('Generating documentation...\n');

try {
  generateArtifactTypesREADME();
  generateFixturePages();
  generateFixturesREADME();
  generateCLIPages();
  generateCLIREADME();
  
  console.log('\n✓ Documentation generation complete!');
} catch (error) {
  console.error('Error generating documentation:', error);
  process.exit(1);
}
