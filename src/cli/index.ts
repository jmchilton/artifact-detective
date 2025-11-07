#!/usr/bin/env node

import { Command } from 'commander';
import { detect } from './commands/detect.js';
import { validateArtifact } from './commands/validate.js';
import { extract } from './commands/extract.js';
import { normalize } from './commands/normalize.js';

const packageJson = {
  version: '1.6.0',
  description: 'Detect and parse CI artifact types for test frameworks and linters',
};

export function createProgram(): Command {
  const program = new Command();

  program
    .name('artifact-detective')
    .description(packageJson.description)
    .version(packageJson.version, '-v, --version');

  program
    .command('detect <file>')
    .description('Detect artifact type from file (use "-" for stdin)')
    .option('--json', 'Output as JSON')
    .option('--validate', 'Validate detected type matches content')
    .option('--show-description', 'Include tool and format info')
    .action(async (file: string, options: { json?: boolean; validate?: boolean; showDescription?: boolean }) => {
      await detect(file, options);
    });

  program
    .command('validate <type> <file>')
    .description('Validate artifact matches expected type (use "-" for stdin)')
    .option('--json', 'Output as JSON')
    .option('--show-description', 'Include parsing guide')
    .action(
      async (
        type: string,
        file: string,
        options: { json?: boolean; showDescription?: boolean },
      ) => {
        await validateArtifact(type, file, options);
      },
    );

  program
    .command('extract <type> <log>')
    .description(
      'Extract artifact from CI log (use "-" for stdin)\nUse custom markers for specific CI formats',
    )
    .option('--json', 'Output as JSON with artifact metadata')
    .option('--output <file>', 'Write to file instead of stdout')
    .option('--validate', 'Validate extracted content')
    .option('--show-description', 'Include extraction metadata')
    .option('--start-marker <regex>', 'Regex to detect start of section')
    .option('--end-marker <regex>', 'Regex to detect end of section')
    .action(
      async (
        type: string,
        log: string,
        options: { json?: boolean; output?: string; validate?: boolean; showDescription?: boolean; startMarker?: string; endMarker?: string },
      ) => {
        await extract(type, log, options);
      },
    );

  program
    .command('normalize <file>')
    .description('Convert artifact to JSON format (auto-detect type, use "-" for stdin)')
    .option('--type <type>', 'Override auto-detected artifact type')
    .option('--output <file>', 'Write to file instead of stdout')
    .option('--show-description', 'Include parsing guide')
    .action(
      async (
        file: string,
        options: { type?: string; output?: string; showDescription?: boolean },
      ) => {
        await normalize(file, options);
      },
    );

  return program;
}
